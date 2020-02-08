// WIP

export interface HateosEntityList<T, L extends HateosResourceLinks> {
    // tslint:disable-next-line: variable-name
    _embedded?: T;
    page: HateosPage;
    _links?: L;
}
export interface HateosPage {
    /**
     * Returns the number of the current {@link Slice}. Is always non-negative.
     */
    number: number;
    /**
     * Returns the size of the {@link Slice}.
     */
    size: number;
    /**
     * Returns the total amount of elements.
     */
    totalElements: number;
}

export interface HateosResourceLink {
    href: string;
    /** Information if the URL supports a pageable request or not {?page,size,sort} */
    templated ?: boolean;
}

/**
 * Extend this interface to add your links
 */
export interface HateosResourceLinks {
    self: HateosResourceLink;
    profile?: HateosResourceLink;
}
