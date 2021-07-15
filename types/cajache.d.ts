export type Options = {
    /**
     * Timestamp (seconds) of when the data will expire.
     */
    expire: number;
    /**
     * Dot path to the property that will be saved. Example: `"user.data"`.
     */
    path: string;
};
