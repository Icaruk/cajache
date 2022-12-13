
<div style="text-align:center">
    <h1> cajache </h1>
    <img height="256px" src="https://i.gyazo.com/468a720ce6a70550f5430794e42da631.png" />
</div>


[![cajache package size](https://packagephobia.now.sh/badge?p=cajache)](https://packagephobia.now.sh/result?p=cajache) [![cajache package size minzipped](https://badgen.net/bundlephobia/minzip/cajache)](https://badgen.net/bundlephobia/minzip/cajache) [![cajache dependency count](https://badgen.net/bundlephobia/dependency-count/cajache)](https://badgen.net/bundlephobia/dependency-count/cajache)



**cajache** is a minimalistic javascript caching library.

- ⚡ Optimizes your projects reducing the number of HTTP request or heavy actions performed.
- 🚀 Lightweight.
- ⚪️ Zero dependencies.



<br>



<!-- TOC ignore:true -->
# Table of contents


<!-- TOC -->

- [Table of contents](#table-of-contents)
- [Import](#import)
- [Quick start](#quick-start)
- [Creating a new instance](#creating-a-new-instance)
- [Instance options](#instance-options)
- [Use cases](#use-cases)
  - [Cache HTTP requests](#cache-http-requests)
  - [Cache paginated HTTP requests](#cache-paginated-http-requests)
- [API](#api)
  - [.use](#use)
  - [.get](#get)
  - [.set](#set)
  - [.delete](#delete)
  - [.deleteAll](#deleteall)
  - [.setConfig](#setconfig)
  - [TTL watcher](#ttl-watcher)
- [Go to top](#go-to-top)

<!-- /TOC -->



<br>



# Import

```js
const cajache = require("cajache");
```



# Quick start

Permanent cache

```js
const myFetchFnc = axios.get("https://your.api/resource");

const response = await cajache.use(
    "cache_id_01",
    myFetchFnc
);
// The first time it will execute myFetchFnc.

const cachedResponse = await cajache.use(
    "cache_id_01",
    myFetchFnc
);
// The second time it will return cached value instead re-executing myFetchFnc.
```
<br/>

Temporal cache

```js
const myFetchFnc = axios.get("https://your.api/resource");

const response = await cajache.use(
    "cache_id_01",
    myFetchFnc,
    {
        ttl: 1000, // 1 second
    }
);
// The first time it will execute myFetchFnc.

// Sleep 3
await new Promise(res => setTimeout(res, 3000));

const nonCachedResponse = await cajache.use(
    "cache_id_01",
    myFetchFnc,
    {
        ttl: 1000, // 1 second
    }
);
// The second time it will NOT return cached value because it's expired.
```

<br/>

# Creating a new instance

```js
const cajache = require("cajache");
const myInstance = cajache.new();
```

<br/>

# Instance options

```js
const cajache = cajache(options);
```

| Instance option     | Type           		| Description
| :-----------:       |:-------------:		| :-----	
| ttl      		      | number              | Default `0`. Default TTL in miliseconds for all cached values. 0 = permanent
| checkInterval       | function      		| Default `1000 * 60` (1 min). Interval in miliseconds to check if cached values with `ttl` are expired.
| path	              | string	            | Dot path to the property that will be cached. Example: `"axiosResponse.data"`.
| condition	          | function            | On cache miss, this function will receive as argument the response of `fnc`. If it returns `true` the response will be cached, if it returns `false` it won't be cached.


<br>


# Use cases

## Cache HTTP requests

```js

// fetch 1: 248.659ms
// fetch 2 (cached): 0.015ms
// fetch 3 (cached): 0.008ms


console.time("fetch 1");

let characters = await cajache.use(
    "characters",
    () => axios.get("https://rickandmortyapi.com/api/character/14"),
);

console.timeEnd("fetch 1");
console.time("fetch 2 (cached)");

characters = await cajache.use(
    "characters",
    () => axios.get("https://rickandmortyapi.com/api/character/14"),
);

console.timeEnd("fetch 2 (cached)");



console.time("fetch 3 (cached)");
await cajache.use(
    "characters",
    () => axios.get("https://rickandmortyapi.com/api/character/14"),
);
console.timeEnd("fetch 3 (cached)");


```

## Cache paginated HTTP requests

```js

// fetch page 1: 284.629ms
// fetch page 2: 208.210ms
// fetch page 1 (cached): 0.018ms
// fetch page 2 (cached): 0.008ms


console.time("fetch page 1");

let characters_page1 = await cajache.use(
    ["characters", "page_1"],
    () => axios.get("https://rickandmortyapi.com/api/character/?page=1"),
);

console.timeEnd("fetch page 1");
console.time("fetch page 2");

let characters_page2 = await cajache.use(
    ["characters", "page_2"],
    () => axios.get("https://rickandmortyapi.com/api/character/?page=2"),
);

console.timeEnd("fetch page 2");



console.time("fetch page 1 (cached)");

characters_page1 = await cajache.use(
    ["characters", "page_1"],
    () => axios.get("https://rickandmortyapi.com/api/character/?page=1"),
);

console.timeEnd("fetch page 1 (cached)");
console.time("fetch page 2 (cached)");

characters_page2 = await cajache.use(
    ["characters", "page_2"],
    () => axios.get("https://rickandmortyapi.com/api/character/?page=2"),
);

console.timeEnd("fetch page 2 (cached)");

```



<br>



# API

## .use

Syntax:
```js
const cachedResponse: Promise = cajache.use(
    id: "myId",
    fetchFnc: () => stuff,
    options: {},
);
```

| Parameter     | Type           			| Description 	|
| :-----------: |:-------------:			| :-----		|
| id      		| string \| Array\<string\>	| Unique identifier of the cache entry.	If you pass an array like `["parent", "child"]` it will be treated as deep nested id. If parent is deleted all children will be deleted too. 
| fnc      		| function      			| Your function that will be cached. Can be async.
| options 		| object      				| [Same as instance options](#instance-options) (without `checkInterval`). If set, it will override instance options, otherwise it will use them.

<br />

**Example:**
```js
// Simple id
const response = await cajache.use(
    "characters",
    () => axios.get("https://you.api.com/characters"),
);
```

```js
// Nested id
const response = await cajache.use(
    ["location_2",  "characters", "page_3"],
    () => axios.get("https://you.api.com/location2/characters?page=3"),
);
```


<br />

**Example with expire:**

```js
const response = await cajache.use(
    ["location_2", "characters", "page_3"],
    () => axios.get("https://you.api.com/location2/characters?page=3"),
    {
        expire: 1000 * 30, // 30 seconds
    }
);
```

<br />

**Example with path:**

```js
const response = await cajache.use(
    ["location_2", "characters", "page_3"],
    () => axios.get("https://you.api.com/location2/characters?page=3"),
    {
        path: "character.name",
    }
);
```

<br />

**Example with condition:**

```js
const response = await cajache.use(
    ["location_2", "characters", "page_3"],
    () => axios.get("https://you.api.com/location2/characters?page=3"),
    {
        condition: apiRes => apiRes.isError === false,
    }
);
```



<br/>



## .get

Syntax:
```js
cajache.get(id);
```


| Parameter     | Type           			| Description 	|
| :-----------: |:-------------:			| :-----		|
| id      		| string \| Array\<string\>	| Unique identifier of the cache entry

<br/>
Examples:
```js
const characters = cajache.get("characters");
```

Or...

```js
const location2_characters_page3 = cajache.get(["location_2", "characters", "page_3"]);
```



<br/>



## .set

Syntax:

```js
cajache.set(id, value );
```


| Parameter     | Type           			| Description 	|
| :-----------: |:-------------:			| :-----		|
| id      		| string \| Array\<string\>	| Unique identifier of the cache entry
| value 		| any	      				| Value you want to set

<br/>

Examples:
```js
cajache.set("characters", {...} );
```

Or...

```js
cajache.set(["location_2", "characters", "page_3"], {...} );
```


<br/>



## .delete

Syntax;
```js
cajache.delete(id);
```

| Parameter     | Type           			| Description 	|
| :-----------: |:-------------:			| :-----		|
| id      		| string \| Array\<string\>	| Unique identifier of the cache entry you want to delete.

<br/>

Delete `location_2` cache entry (and his childrens):
```js
cajache.delete("location_2");
```

Delete `location_2.characters.page_3` cache entry (and his childrens):





<br/>



## .deleteAll


Deletes all cache entries of the instance.
```js
cajache.deleteAll();
```

<br/>



## .setConfig


Sets the instance config.

```js
cajache.setConfig(key, value);
```

Keys and values are the [same as instance options](#instance-options).
<br/>

Example: 
```js
cajache.setConfig("checkInterval", 1000 * 60 * 5); // 5 minutes
```



---



## TTL watcher

- It starts automatically when you create any instance.
- It will only iterate over all cache entries with TTL.
- It will delete all expired cache entries every `config.checkInterval` milliseconds.
- It will check the instance config (`config?.checkInterval`) after each iteration to stop or continue the loop.
- If the `checkInterval` is changed it will not not be effective until the next iteration.



---



# <a name='table-of-contents'></a>[Go to top](#table-of-contents) 


