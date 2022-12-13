# Changelog



## [2.0.2] - 2022-12-13

### Fixed
- `.delete` method was not deleting the cache entry.

### Added
- Tests for `.delete` and `.deleteAll` method.



## [2.0.1] - 2022-12-13

### Fixed
- `ttl` item on TTL watcher was being duplicated.
- Removed unnecesary console.log messages.



## [2.0.0] - 2022-12-13

### Breaking changes from  1.x.x to 2.0.0

- The `expire` option has been renamed to `ttl`. Instead Date of expiration now requires time to live in miliseconds.
  - Before:
    ```js
    await cajache.use(
      "id",
      () => functionToCache,
      {
        expire: (Date.now() / 1000) + 1, // 1 second
      }
    );
    ```
    
  - After:
    ```js
    await cajache.use(
      "id",
      () => functionToCache,
      {
        ttl: 1000, // 1 second
      }
    );
    ```
- `.expireWatcher` method has been removed, the watcher now starts automatically.



### Added
- New method `.deleteAll` has been added.
- New option `checkInterval` has been added. It defines the TTL watcher interval between cycles in miliseconds. Default value is `1000 * 60` (1 minute).
- New method `.new` has been added. It creates a new instance of `cajache`.
- New method `.setOptions` has been added. It sets the options for the current instance.



### Changed:

- The `condition` option behaviour been slighly changed:
  - **Before:** _Function that will receive as argument the fetchFnc response. If it returns true the response will be cached, if it returns an object it will override the response, otherwise it won't be cached and cajache.use will return null._
  - **After:** _On cache miss, this function will receive as argument the response of fnc. If it returns true the response will be cached, if it returns false it won't be cached._



### Fixed
- `cajache.delete` no longer deletes all cache entries with undefined id, now it throws an error.


