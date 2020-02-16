import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { Pageable, Sort } from '../data/pageable.model';
import { SpringResource } from './spring.resource';
import { DataSource } from '@angular/cdk/table';
import { CollectionViewer } from '@angular/cdk/collections';
import { finalize, catchError } from 'rxjs/operators';

/**
 * Error handler which allows to hook into the returned service errors.
 */
export type DataSourceErrorHandler<ListType> = (error: any) => Observable<ListType>;
export type DataSourceLoadHook<ListType, ResourceType, ServiceType extends SpringResource<ListType, ResourceType>>
    = (service: ServiceType, page: Pageable) => Observable<ListType>;

/**
 * Default page request interface, like from Anular Material Paginator
 * https://material.angular.io/components/paginator/overview
 */
export interface PageRequest {
    /** the page to show, starting with 0 */
    pageIndex: number;
    /** the number of elements to show */
    pageSize: number;
}

export abstract class SpringDataSource<ListType, ResourceType, ServiceType extends SpringResource<ListType, ResourceType>>
    implements DataSource<ResourceType> {

    constructor(protected service: ServiceType,
                protected errorHandler?: DataSourceErrorHandler<ListType>,
                protected loadHook?: DataSourceLoadHook<ListType, ResourceType, ServiceType>) {}

    // tslint:disable: variable-name
    private _lastRequest: Subscription;
    // tslint:disable-next-line: variable-name
    private _loading = new BehaviorSubject<boolean>(false);
    public readonly loading$ = this._loading.asObservable();

    private _page = new Pageable();
    get page(): Pageable {
        return this._page;
    }
    private dataSubject = new BehaviorSubject<ResourceType[]>([]);
    public dataSubject$ = this.dataSubject.asObservable();
    private hateosSubject = new BehaviorSubject<ListType>(null);
    public hateosSubject$ = this.hateosSubject.asObservable();

    /**
     * Implement this method to extract the array of elements from the given ListType.
     * Return null will be converted into an empty new array.
     */
    abstract extractDataFromList(list: ListType): ResourceType[];

    connect(collectionViewer: CollectionViewer): Observable<ResourceType[] | readonly ResourceType[]> {
        return this.dataSubject$;
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.dataSubject.complete();
        this.hateosSubject.complete();
        this._loading.complete();
    }

    doLoad(page: number = Pageable.DEFAULT_PAGE, size: number = Pageable.DEFAULT_SIZE): void {
        this._page.size = size;
        this._page.page = page;
        this._loadData();
    }

    doPage(page: PageRequest | Pageable | any): void {
        if (page) {
            if (page instanceof  Pageable) {
                // console.info('Pageable load ...', this._page);
                this._page = page;
            } else {
                this._page.page = page.pageIndex || page.index || page.page || Pageable.DEFAULT_PAGE;
                this._page.size = page.pageSize || page.size || Pageable.DEFAULT_SIZE;
                // console.info('compatibility load ...', this._page);
            }
            this._loadData();
        } else {
            throw new TypeError('Given page is null.');
        }
    }

    doSortBy(sort: Sort | any) {
        if (sort) {
            this._page.setSort(sort.field || sort.active, sort.direction);
            this._loadData();
        }
    }

    setData(data: ListType) {
        this.hateosSubject.next(data);
        this.dataSubject.next(this.extractDataFromList(data) || []);
    }

    /**
     * Requests the data using the actual page.
     */
    // tslint:disable: curly
    private _loadData() {
        this._cancel();
        this._loading.next(true);

        // allow a custom service call if a hook was provided
        let l: Observable<ListType>;
        if (this.loadHook) l = this.loadHook(this.service, this._page);
        else l = this.service.list(this._page);

        if (this.errorHandler) {
            l = l.pipe(
                finalize(() => this._loading.next(false)),
                catchError(this.errorHandler)
            );
        } else {
            l = l.pipe(
                finalize(() => this._loading.next(false))
            );
        }
        this._lastRequest = l.subscribe(result => this.setData(result));
    }

    private _cancel() {
        if (this._lastRequest && this._lastRequest.unsubscribe) { // cancel any pending requests ...
            this._lastRequest.unsubscribe();
            this._lastRequest = null;
        }
    }
}
