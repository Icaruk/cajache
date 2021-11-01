/**
 * Function that will receive as argument the `fetchFnc` response.
 * - If this function returns `true` the `fetchFnc` response will be cached.
 * - If this function returns `object` it will override the response.
 * - Otherwise `fetchFnc` response won't be cached and `cajache.use` will return null.
 */
export type ConditionFnc = (fetchFncResponse: any) => any;
export type Options = {
    /**
     * Date (timestamp seconds) when you want to expire the cache.
     */
    expire: number;
    /**
     * Dot path to the property that will be saved. Example: `"user.data"`.
     */
    path: string;
    condition: ConditionFnc;
};
