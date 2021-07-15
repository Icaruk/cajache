export type Options = {
    /**
     * Date (timestamp seconds) when you want to expire the cache.
     */
    expire: number;
    /**
     * Dot path to the property that will be saved. Example: `"user.data"`.
     */
    path: string;
};
