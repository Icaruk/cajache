export type Options = {
    /**
     * Timestamp (seconds) of when the data will expire.
     * //  *
     */
    expire: number;
    /**
     * (PENDIENTE) Función a la que se le pasará como argumento la respuesta de `fetchFnc`. Si devuelve `true` se cachearán los datos.
     */
    condition: Function;
};
export declare const cache: {};
/**
 * Retrieves a cache box.
 * @param {string | Array<string>} id Unique ID of the box.
 * @returns {* | null}
*/
export declare function get(id: string | string[]): any;
/**
 * Sets the data for a cache box.
 * @param {string | Array<string>} id Unique ID of the box.
 * @param {*} data Data you want to set.
 * @param {Options} options
*/
export declare function set(id: string | string[], data: any, options?: Options): void;
/**
 * Deletes a  cache box.
 * @param {string | Array<string>} id Unique ID of the box.
*/
declare function _delete(id: string | string[]): void;
/**
 * @param {string | Array<string>} id Unique ID of the box.
 * @param {function} fetchFnc Fetch function that will be executed and saved if no cache is found.
 * @param {Options} options
 *
 * @returns {*} Returns the cached result if found, otherwise returns the response of `fetchFnc`.
*/
export declare function use(id: string | string[], fetchFnc: Function, options?: Options): any;
export { _delete as delete };
