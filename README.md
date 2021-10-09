
<div style="text-align:center">
	<h1> cajache </h1>
	<img height="256px" src="https://i.gyazo.com/468a720ce6a70550f5430794e42da631.png" />
</div>


[![install size](https://packagephobia.com/badge?p=cajache@latest)](https://packagephobia.com/result?p=cajache@latest)


**cajache** is a minimalistic javascript caching library.

- ⚡ Optimizes your projects reducing the number of HTTP request performed.
- 🚀 Lightweight.
- ⚪️ Zero dependencies.



<br>



<!-- TOC ignore:true -->
# Table of contents


<!-- TOC -->

- [Table of contents](#table-of-contents)
- [Import](#import)
- [Example](#example)
- [Use cases](#use-cases)
	- [Cache a request](#cache-a-request)
	- [Cache a paginated request](#cache-a-paginated-request)
- [API](#api)
	- [.use](#use)
	- [.get](#get)
	- [.set](#set)
	- [.delete](#delete)
- [<a name='table-of-contents'></a>Go to top](#go-to-top)

<!-- /TOC -->



<br>



# Import

```js
const cajache = require("cajache");
```



<br>



# Example

```js
const response = await cajache.use(
	"cache_id_01",
	() => axios.get("https://your.api/resource")
);

const cachedResponse = await cajache.use(
	"cache_id_01",
	() => axios.get("https://your.api/resource")
);

// The first time it will execute the request.
// The second time it will return cache value instead re-executing the request.
```



<br>



# Use cases

## Cache a request

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

## Cache a paginated request

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
	id: String,
	fetchFnc: function,
	options: Object,
);
```

<br />

Examples
```js
const response = await cajache.use(
	"characters",
	() => axios.get("https://you.api.com/characters"),
);
```

Or...

```js
const response = await cajache.use(
	["location_2",  "characters", "page_3"],
	() => axios.get("https://you.api.com/location2/characters?page=3"),
);
```

| Parameter     | Type           			| Description 	|
| :-----------: |:-------------:			| :-----		|
| id      		| string \| Array\<string\>	| Unique identifier (or route) of the location where you want to store the cache.
| fetchFnc      | function      			| Your fetch function that will be cached.
| options 		| object      				| See below.

<br/>

| Option    	 	| Type           	| Description 	|
| :-----------: 	|:-------------:	| :-----		|
| expire      		| number			| Date (timestamp seconds) when you want to expire the cache.
| path      		| string			| Dot path to the property that will be saved. Example: `"user.data"`.
| condition      	| function			| Function that will receive as argument the `fetchFnc` response. If it returns `true` the response will be cached, otherwise it won't be cached and `null` will be returned.


<br />

**Example with expire:**

```js
const response = await cajache.use(
	["location_2", "characters", "page_3"],
	() => axios.get("https://you.api.com/location2/characters?page=3"),
	{
		expire: (Date.now() / 1000) + (1000 * 30), // 30 seconds
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
		condition: res => res.isError === false,
	}
);
```



<br/>



## .get

```js
const characters = cajache.get("characters");
```

Or...

```js
const location2_characters_page3 = cajache.get(["location_2", "characters", "page_3"]);
```

| Parameter     | Type           			| Description 	|
| :-----------: |:-------------:			| :-----		|
| id      		| string \| Array\<string\>	| Unique identifier (or route) of the location where you want to retrieve the cache.



<br/>



## .set

```js
cajache.set("characters", {...} );
```

Or...

```js
cajache.set(["location_2", "characters", "page_3"], {...} );
```

| Parameter     | Type           			| Description 	|
| :-----------: |:-------------:			| :-----		|
| id      		| string \| Array\<string\>	| Unique identifier (or route) of the location where you want to set the cache.
| value 		| any	      				| Value you want to set



<br/>



## .delete

Delete **all** cache boxes:
```js
cajache.delete();
```

Delete `location_2` box:
```js
cajache.delete("location_2");
```

Delete `location_2.characters.page_3` box:

```js
cajache.delete(["location_2", "characters", "page_3"]);
```

| Parameter     | Type           			| Description 	|
| :-----------: |:-------------:			| :-----		|
| id      		| string \| Array\<string\>	\| undefined | Unique identifier (or route) of the location you want to delete. If undefined all cache boxes will be deleted.



---



# <a name='table-of-contents'></a>[Go to top](#table-of-contents) 


