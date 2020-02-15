// WIP

export interface HateoasEntityList<T, L extends HateoasResourceLinks> {
    // tslint:disable-next-line: variable-name
    _embedded?: T;
    page: HateoasPage;
    _links?: L;
}
export interface HateoasPage {
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

export interface HateoasResourceLink {
    href: string;
    /** Information if the URL supports a pageable request or not {?page,size,sort} */
    templated ?: boolean;
}

/**
 * Extend this interface to add your links
 */
export interface HateoasResourceLinks {
    self: HateoasResourceLink;
    profile?: HateoasResourceLink;
}
