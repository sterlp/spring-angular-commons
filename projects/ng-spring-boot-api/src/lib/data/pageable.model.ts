import { HttpParams } from '@angular/common/http';

export enum SortDirection {
    ASC = 'asc',
    DESC = 'desc'
}
export interface Sort {
    field: string;
    direction: SortDirection;
}

/**
 * Interface for pagination information during a request.
 * ```
 * http://fooo:8080/api/bar?page=0&size=5&sort=name,desc
 * ```
 * In addition filters are supported and appended.
 */
export class Pageable {
    public static readonly DEFAULT_PAGE = 0;
    public static readonly DEFAULT_SIZE = 25;
    page = Pageable.DEFAULT_PAGE;
    size = Pageable.DEFAULT_SIZE;
    sort: Sort[] = [];
    filter = new  Map<string, any>();

    /**
     * Create a new Pageable with the given optional parameters
     * @param page the page to request, default 0
     * @param size the ammount of elements to read, default 25
     */
    // tslint:disable: curly
    static of(page?: number, size?: number): Pageable {
        const result = new Pageable();
        if (page == null) result.page = Pageable.DEFAULT_PAGE;
        if (size == null) result.size = Pageable.DEFAULT_SIZE;
        return result;
    }

    asc(field: string): Pageable {
        // tslint:disable-next-line: no-use-before-declare
        return this.addSort(field, SortDirection.ASC);
    }
    desc(field: string): Pageable {
        // tslint:disable-next-line: no-use-before-declare
        return this.addSort(field, SortDirection.DESC);
    }
    /**
     * Add the given field into the sort list, empty field are ignored
     * @param field field to use for the sort
     * @param direction optional direction, default is ASC
     */
    addSort(field: string, direction: SortDirection = SortDirection.ASC): Pageable {
        if (!direction) direction = SortDirection.ASC;
        if (field && field.length > 0) {
            this.sort.push({field, direction});
        }
        return this;
    }
    addFilter(key: string, value: any): Pageable {
        this.filter.set(key, value);
        return this;
    }
    /**
     * Sets the given sort only
     * @param field the field to sort for, if empty it is ignored
     * @param direction the direction to sort
     */
    setSort(field: string, direction: SortDirection = SortDirection.ASC): Pageable {
        this.sort.length = 0;
        this.addSort(field, direction);
        return this;
    }
    /**
     * Builds: page=0&size=5&sort=name,desc
     */
    buildQuery(): string {
        let query = `page=${this.page}&size=${this.size}`;
        if (this.sort && this.sort.length > 0) {
            this.sort.forEach(s => {
                query += '&sort=' + s.field + ',' + s.direction;
            });
        }
        return query;
    }
    newHttpParams(): HttpParams {
        let result = new HttpParams()
            .set('page', this.page.toString())
            .set('size', this.size.toString());
        if (this.sort && this.sort.length > 0) {
            this.sort.forEach(s => {
                result = result.append('sort', s.field + ',' + s.direction);
            });
        }
        if (this.filter.size > 0) {
            this.filter.forEach((v, k) => result = result.set(k, v));
        }
        return result;
    }
    public toString(): string {
        return this.buildQuery();
    }
}
