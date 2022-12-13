
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



let cache = {
	/*
	config: {
		
	},
	cache: {
		comments: {
			config: {},
			cache: {
				
			}
		}
	}
	*/
	
};



/**
 * @property {boolean} isStarted Indicates if the expire watcher is running.
 * @property {number} interval Interval in miliseconds to check for expired boxes.
 * @property {Function} start Expire watcher starter.
 * @property {Function} stop Expire watcher stopper.
 * 
*/
const expireWatcher = {
	
	isStarted: false,
	
	interval: 1000 * 60,
	list: new Set(),
	
	start: function(force = false) {
		
		if (this.isStarted && !force) return; // si ya está empezado, no hago nada
		this.isStarted = true;
		
		
		
		setTimeout( () => {
			
			(this.list).forEach( (_cacheId, _idx) => {
				
				const [ref, lastKey] = getRef(cache, _cacheId);
				const cacheBox = ref[lastKey];
				
				if (cacheBox && cacheBox.expire && cacheBox.expire < ( Date.now() / 1000)) {
					delete ref[lastKey]; // borro el cache
					this.list.delete(_cacheId); // y lo borro de la lista
				};
				
			});
			
			
			if (!this.isStarted) return; // está parado, no sigo
			if (this.interval <= 0) return this.stop(); // intervalo 0, no sigo
			this.start(true);
			
		}, this.interval);
		
	},
	stop: function() {
		this.list = new Set();
		this.isStarted = false;
	},
	
};


const defaultCajacheConfig = {
	expire: 0, // 0 = no expire
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
 * @property {number} expire Date (timestamp seconds) when you want to expire the cache.
 * @property {string} path Dot path to the property that will be saved. Example: `"user.data"`.
 * @property {ConditionFnc} condition 
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
			if (ref[lastKey].expire < ( Date.now() / 1000)) {
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
	 * @param {Options} options
	*/	
	set(id, data, options = {}) {
		
		let [ref, lastKey] = getRef(this.cache, id);
		
		if (!ref[lastKey]) ref[lastKey] = {}; // si no existe la caja, la creo
		ref[lastKey].data = data; // meto data
		
		
		if (options.expire) {
			ref[lastKey].expire = options.expire;
			this.expiringEntries.add(id);
		};
		
	};
	
	/**
	 * Deletes a cache entry.
	 * @param {string | Array<string>} id Unique ID of the cache entry.
	 * @returns {*} Returns the deleted cache entry.
	*/
	delete (id) {
		try {
			if (id === undefined) return this.cache = {};
			
			let [ref, lastKey] = getRef(cache, id);
			
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
	 * @param {Options} options
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
			console.log( `this (${typeof this}):`, this )
			
			const {condition, path} = this.config;
			
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
	 * @param {Config} config
	*/
	constructor(config = defaultCajacheConfig) {
		this.id = Math.random().toString(36).slice(2);
		this.config = config;
		return this;
	};
	
};


const defaultInstance = new Cajache();


if (module) {
	module.exports = Cajache;
	module.exports.default = defaultInstance;
}

	
export default defaultInstance;
