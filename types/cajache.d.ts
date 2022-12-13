export = defaultInstance;
declare const defaultInstance: Cajache;
/**
 * @callback ConditionFnc
 * Function that will receive as argument the `fetchFnc` response.
 * - If this function returns `true` the `fetchFnc` response will be cached.
 * - If this function returns `object` it will override the response.
 * - Otherwise `fetchFnc` response won't be cached and `cajache.use` will return null.
 * @param {*} fetchFncResponse Response of the `fetchFnc` function.
*/
/**
 * @typedef Config
 * @property {number} ttl Time to live in milseconds.
 * @property {number} checkInterval Default `1000 * 60` (1 min). Interval in milseconds to check for expired entries. **Only used on instance config.**
 * @property {string} path Dot path to the property that will be saved. Example: `"user.data"`.
 * @property {ConditionFnc} condition Function that will return boolean determining if the response will be cached or not.
*/
declare class Cajache {
    /**
     * @param {Config} config
    */
    constructor(config?: Config);
    id: string;
    config: {};
    cache: {};
    expiringEntries: Set<any>;
    /**
     * Retrieves a entry.
     * @param {string | Array<string>} id Unique ID of the cache entry.
     * @returns {* | null}
    */
    get(id: string | Array<string>): any | null;
    /**
     * Sets the data for a cache entry.
     * @param {string | Array<string>} id Unique ID of the box.
     * @param {*} data Data you want to set.
     * @param {Config} options
    */
    set(id: string | Array<string>, data: any, options?: Config): void;
    /**
     * Deletes a cache entry.
     * @param {string | Array<string>} id Unique ID of the cache entry.
     * @returns {*} Returns the deleted cache entry.
    */
    delete(id: string | Array<string>): any;
    /**
     * Deletes all cache entries.
    */
    deleteAll(): void;
    /**
     * @param {string | Array<string>} id Unique ID of the cache entry.
     * @param {function} fnc Function that will be executed (and saved) on cache miss, otherwise it will just return the cached data.
     * @param {Config} options
     *
     * @returns {*} Returns the cached result if found, otherwise returns the returned data of `fnc`.
    */
    use(id: string | Array<string>, fnc: Function, options?: Config): any;
    /**
     * Creates a new instance of cache, with his own config and separated cache.
     * @param {Config} config
     * @returns {Cajache}
    */
    new(config: Config): Cajache;
    /**
     * Sets config values
     * @param {"ttl" | "condition" | "path" | "checkInterval"} key
    */
    setConfig(key: "ttl" | "condition" | "path" | "checkInterval", value: any): void;
}
type Config = {
    /**
     * Time to live in milseconds.
     */
    ttl: number;
    /**
     * Default `1000 * 60` (1 min). Interval in milseconds to check for expired entries. **Only used on instance config.**
     */
    checkInterval: number;
    /**
     * Dot path to the property that will be saved. Example: `"user.data"`.
     */
    path: string;
    /**
     * Function that will return boolean determining if the response will be cached or not.
     */
    condition: ConditionFnc;
};
/**
 * Function that will receive as argument the `fetchFnc` response.
 * - If this function returns `true` the `fetchFnc` response will be cached.
 * - If this function returns `object` it will override the response.
 * - Otherwise `fetchFnc` response won't be cached and `cajache.use` will return null.
 */
type ConditionFnc = (fetchFncResponse: any) => any;
