export type Options = {
    /**
     * Date (timestamp seconds) when you want to expire the cache.
     */
    expire: number;
    /**
     * Dot path to the property that will be saved. Example: `"user.data"`.
     */
    path: string;
    /**
     * Function that will receive as argument the `fetchFnc` response. If it returns `true` the response will be cached, otherwise it won't be cached and `null` will be returned.
     */
    condition: Function;
};
