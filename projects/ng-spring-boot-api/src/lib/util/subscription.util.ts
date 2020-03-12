function isFunction(v: any): boolean {
    return v && typeof v === 'function';
}
export interface Closable {
    close(): any;
}

export function isClosable(v: any): v is Closable {
    return v && isFunction(v.close);
}


export class SubscriptionsHolder implements Closable {
    private toClose: Closable[] = [];
    get size(): number {
        return this.toClose.length;
    }
    /**
     * Add any Closable or a object having one of the following methods:
     * ```
     * .close()
     * .unsubscribe()
     * .complete()
     * ```
     */
    add(val: Closable | any): SubscriptionsHolder {
        if (val) {
            if (isClosable(val)) {
                this.toClose.push(val);
            } else if (isFunction(val.unsubscribe)) {
                this.toClose.push({close() {val.unsubscribe(); }});
            } else if (isFunction(val.complete)) {
                this.toClose.push({close() {val.complete(); }});
            } else {
                throw new Error( (typeof val) + ' doesnt provide any known close method. ');
            }
        }
        return this;
    }
    close(): number {
        let result = 0;
        this.toClose.forEach(e => {
            try {
                e.close();
                ++result;
            } catch (error) {
                console.warn('Failed to close', e, 'with error', error);
            }
        });
        this.toClose = [];
        return result;
    }
}
