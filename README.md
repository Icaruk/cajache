
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

- [Import](#import)
- [Use cases](#use-cases)
	- [Cache a request](#cache-a-request)
	- [Cache a paginated request](#cache-a-paginated-request)
- [API](#api)
	- [use](#use)
	- [get](#get)
	- [set](#set)
	- [delete](#delete)
- [<a name='table-of-contents'></a>Go to top](#a-nametable-of-contentsago-to-top)

<!-- /TOC -->



<br>



# Import

```js
const cajache = require("cajache");
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

```js
const response = cajache.use(
	"characters",
	() => axios.get("https://you.api.com/characters"),
);
```

Or...

```js
const response = cajache.use(
	["location_2", "page_3", "characters"],
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
| expire      		| number			| Timestamp (seconds) when you want to expire the cache.

<br />

**Example with expire:**

```js
const response = cajache.use(
	["location_2", "page_3", "characters"],
	() => axios.get("https://you.api.com/location2/characters?page=3"),
	{
		expire: (Date.now() / 1000) + (1000 * 30), // 30 seconds
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
const characters_location2_page3 = cajache.get(["location_2", "page_3", "characters"]);
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
cajache.set(["location_2", "page_3", "characters"], {...} );
```

| Parameter     | Type           			| Description 	|
| :-----------: |:-------------:			| :-----		|
| id      		| string \| Array\<string\>	| Unique identifier (or route) of the location where you want to set the cache.
| value 		| any	      				| Value you want to set



<br/>



## .delete
```js
cajache.delete("characters", {...} );
```

Or...

```js
cajache.delete(["location_2", "page_3", "characters"], {...} );
```

| Parameter     | Type           			| Description 	|
| :-----------: |:-------------:			| :-----		|
| id      		| string \| Array\<string\>	\| undefined | Unique identifier (or route) of the location you want to delete. If undefined all cache boxes will be deleted.



---



# <a name='table-of-contents'></a>[Go to top](#table-of-contents) 


