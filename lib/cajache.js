
/**
 * Obtiene la referencia de un objeto anidado dentro de otro objeto (a cualquier profundidad) a partir de una ruta `["key1", "key2", "key3"...]`.
 * @param {*} obj 
 * @param {Array<string> | string} arrKeys Ruta hasta el objeto. Por ejemplo `["moto", "rueda2", "tipo"]`.
 * @returns {Array<*,string>} [ref, lastKey] para poder hacer `ref[lastKey] = "cosas"`.
 * 
 * @example
 * 
 * let moto = {
 * 	rueda1: {
 * 		tipo: "AD-56",
 * 		estado: "ok"
 * 	},
 * 	rueda2: {
 * 		tipo: "AT-77",
 * 		estado: "ok"
 * 	},
 * };
 * 
 * let [ref, lastKey] = getRef(moto, ["rueda2", "tipo"]);
 * console.log( ref[lastKey] ); // "AT-77"
 * 
*/
function getRef(obj, arrKeys) {
	
	if (typeof arrKeys === "string") return [obj, arrKeys];
	
	
	let ref = obj;
	let lastKey = null;
	
	
	// Si me pasan array
	const lastIdx = arrKeys.length - 1;
	
	arrKeys.forEach( (_key, _idx) => {
		if (_idx === lastIdx) return lastKey = _key;
		
		if (!ref[_key]) ref[_key] = {};
		ref = ref[_key];
	});
	
	
	return [ref, lastKey];
	
};



// -------------------------------------------------------------------------------------------------------------------------------



const startWatcher = (instance) => {
	
	setTimeout( () => {
		
		for (let _cacheId of instance.expiringEntries) {
			
			const [ref, lastKey] = getRef(instance.cache, _cacheId);
			const cacheEntry = ref[lastKey];
			
			if (cacheEntry && cacheEntry.expireAt && cacheEntry.expireAt < Date.now()) {
				delete ref[lastKey]; // borro el cache
				instance.expiringEntries.delete(_cacheId); // y lo borro de la lista
			};
			
		};
		
		const checkInterval = instance?.config?.checkInterval ?? 0;
		if (checkInterval <= 0) return; // interval is 0, stop
		startWatcher(instance); // start again
		
	}, instance?.config?.checkInterval ?? 0);
	
};



const defaultCajacheConfig = {
	ttl: 0, // 0 = no ttl
	checkInterval: 1000 * 60, // 1 min
	path: null,
	condition: null,
}


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

class Cajache {
	id = "cajache";
	config = {};
	cache = {};
	expiringEntries = new Set();
	
	/**
	 * Retrieves a entry.
	 * @param {string | Array<string>} id Unique ID of the cache entry.
	 * @returns {* | null}
	*/
	get(id) {
		try {
			let [ref, lastKey] = getRef(this.cache, id);
			
			
			// No lo he encontrado
			if (!ref[lastKey]) return null;
			
			
			// Si está caducado, borro la entrada y devuelvo null, como si no lo hubiese encontrado
			if (ref[lastKey].ttl < ( Date.now() / 1000)) {
				delete ref[lastKey];
				return null;
			};
			
			// Si llego hasta aquí, lo he encontrado y devuelvo su propiedad data
			return ref[lastKey].data;
			
		} catch(err) {
			console.error(err);
			return null;
		};
	};
	
	/**
	 * Sets the data for a cache entry.
	 * @param {string | Array<string>} id Unique ID of the box.
	 * @param {*} data Data you want to set.
	 * @param {Config} options
	*/	
	set(id, data, options = {}) {
		try {
			let [ref, lastKey] = getRef(this.cache, id);
			
			if (!ref[lastKey]) ref[lastKey] = {}; // si no existe la caja, la creo
			ref[lastKey].data = data; // meto data
			
			
			if (options.ttl) {
				ref[lastKey].expireAt = Date.now() + options.ttl;
				
				const stringifiedId = typeof id === "string" ? id : id.join(".");
				this.expiringEntries.add(stringifiedId);
			};
			
		} catch (err) {
			console.error(err);
		};
	};
	
	/**
	 * Deletes a cache entry.
	 * @param {string | Array<string>} id Unique ID of the cache entry.
	 * @returns {*} Returns the deleted cache entry.
	*/
	delete (id) {
		try {
			if (!id) throw new Error(`delete should have a valid id but ${id} was provided`); 
			
			let [ref, lastKey] = getRef(this.cache, id);
			
			let deleted = ref[lastKey];
			delete ref[lastKey];
			
			return deleted;
		} catch(err) {
			console.error(err);
			return null;
		};
	};
	
	/**
	 * Deletes all cache entries.
   	*/	
	deleteAll() {
		this.cache = {};
	};
	
	/**
	 * @param {string | Array<string>} id Unique ID of the cache entry.
	 * @param {function} fnc Function that will be executed (and saved) on cache miss, otherwise it will just return the cached data.
	 * @param {Config} options
	 * 
	 * @returns {*} Returns the cached result if found, otherwise returns the returned data of `fnc`.
	*/
	async use (id, fnc, options = {}) {
		
		try {
			// Find cache
			const cache = this.get(id);
			
			// Cache hit
			if (cache) {
				this.set(id, cache, options); // set new options
				return cache;
			};
			
			// Cache miss, execute fnc
			let freshData = await fnc();
			
			// Get config
			const {condition, path} = options ?? this.config;
			
			// Check condition
			if (condition) {
				if (typeof condition !== "function") throw TypeError("config.condition must be a function");
				
				const conditionResult = condition(freshData); // try to execute condition
				if (!!conditionResult !== true) return freshData; // condition check failed, return freshData and don't cache
				
			};
			
			// Path is required
			if (path) {
				const [ref, lastKey] = getRef(freshData, path.split("."));
				freshData = ref[lastKey];
			};
			
			
			this.set(id, freshData, this.options);
			return freshData;
			
		} catch (err) {
			console.error(err);
			return null;
		}
		
		
	};
	
	/**
	 * Creates a new instance of cache, with his own config and separated cache.
	 * @param {Config} config
	 * @returns {Cajache}
	*/
	new(config) {
		return new Cajache(config);
	};
	
	/**
	 * Sets config values
	 * @param {"ttl" | "condition" | "path" | "checkInterval"} key
	*/
	setConfig(key, value) {
		
		if (key === "ttl") this.config.ttl = value;
		if (key === "path") this.config.path = value;
		if (key === "condition") this.config.condition = value;
		if (key === "checkInterval") {
			this.config.checkInterval = ms;
			if (ms > 0) startWatcher(this);
		};
	};
	
	/**
	 * @param {Config} config
	*/
	constructor(config = defaultCajacheConfig) {
		this.id = Math.random().toString(36).slice(2);
		this.config = config;
		
		startWatcher(this);
		
		return this;
	};
	
};


const defaultInstance = new Cajache();


module.exports = defaultInstance;
module.exports.default = defaultInstance;

