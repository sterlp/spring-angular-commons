import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { Pageable, Sort } from '../data/pageable.model';
import { SpringResourece } from './spring.resource';
import { DataSource } from '@angular/cdk/table';
import { CollectionViewer } from '@angular/cdk/collections';

export type DataSourceErrorHandler = (operation: string, error: any) => Observable<any>;

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

export abstract class SpringDataSource<ListType, ResourceType> implements DataSource<ResourceType> {

    constructor(protected service: SpringResourece<ListType, ResourceType>, protected errorHandler?: DataSourceErrorHandler) {}

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
    private hateosSubject = new BehaviorSubject<ListType>(null);
    public hateosSubject$ = this.hateosSubject.asObservable();

    /**
     * Implement this method to extract the array of elements from the given ListType.
     * Return null will be converted into an empty new array.
     */
    abstract extractDataFromList(list: ListType): ResourceType[];

    connect(collectionViewer: CollectionViewer): Observable<ResourceType[] | readonly ResourceType[]> {
        return this.dataSubject.asObservable();
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
    private _loadData() {
        if (this._lastRequest) { // cancel any pending requests ...
            this._lastRequest.unsubscribe();
            this._lastRequest = null;
        }
        this._loading.next(true);
        this._lastRequest = this.service.list(this._page)
            .subscribe(
                result => this.setData(result),
                e => this.errorHandler ? this.errorHandler('loadData', e) : console.warn('Failed to call:', this.service.listUrl, e),
                () => {
                    this._loading.next(false);
                    this._lastRequest.unsubscribe();
                    this._lastRequest = null;
                }
            );
    }
}
