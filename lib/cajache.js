
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
	"comentarios": {
		data: {
			comentarios: [
				"asd",
				"qwe",
				"rty",
			],
			total: 3,
		},
		expire: null,
	},
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


/**
 * Deletes a cache box.
 * @param {string | Array<string>} id Unique ID of the box.
*/	
const fncDelete = (id) => {
	if (id === undefined) return cache = {};
	
	let [ref, lastKey] = getRef(cache, id);
	delete ref[lastKey];
};



/**
 * Sets the data for a cache box.
 * @param {string | Array<string>} id Unique ID of the box.
 * @param {*} data Data you want to set.
 * @param {Options} options
*/
const fncSet = (id, data, options = {}) => {
	
	let [ref, lastKey] = getRef(cache, id);
	
	if (!ref[lastKey]) ref[lastKey] = {}; // si no existe la caja, la creo
	ref[lastKey].data = data; // meto data
	
	
	if (options.expire) {
		
		ref[lastKey].expire = options.expire;
		
		if (expireWatcher.isStarted) {
			expireWatcher.list.add(id);
		};
	};
	
};



/**
 * Retrieves a cache box.
 * @param {string | Array<string>} id Unique ID of the box.
 * @returns {* | null}
*/
const fncGet = (id) => {
	
	try {
		
		let [ref, lastKey] = getRef(cache, id);
		
		
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
		console.log(err);
		return null;
	};
	
};



/**
 * Deletes all cache boxes.
*/	
const fncDeleteAll = () => {
	cache = {};
};



/**
 * @param {string | Array<string>} id Unique ID of the box.
 * @param {function} fetchFnc Fetch function that will be executed and saved if no cache is found.
 * @param {Options} options
 * 
 * @returns {*} Returns the cached result if found, otherwise returns the response of `fetchFnc`.
*/
async function fncUse (id, fetchFnc, options = {}) {
	
	const cache = cajache.get(id);
	if (cache) {
		cajache.set(id, cache, options);
		return cache;
	};
	
	let fresh = await fetchFnc();
	
	
	if (options.condition) {
		
		if (typeof options.condition !== "function") throw TypeError("options.condition must be a function");
		
		const conditionResult = options.condition(fresh);
		
		
		if (typeof conditionResult === "boolean") {
			if (conditionResult !== true) return null;
		} else if (typeof conditionResult === "object" && conditionResult !== null) {
			fresh = conditionResult;
		};
		
	};
	
	if (options.path) {
		const [ref, lastKey] = getRef(fresh, options.path.split("."));
		fresh = ref[lastKey];
	};
	
	
	
	cajache.set(id, fresh, options);
	
	return fresh;
	
};



// -------------------------------------------------------------------------------------------------------------------------------



/**
 * @callback ConditionFnc
 * Function that will receive as argument the `fetchFnc` response.
 * - If this function returns `true` the `fetchFnc` response will be cached.
 * - If this function returns `object` it will override the response.
 * - Otherwise `fetchFnc` response won't be cached and `cajache.use` will return null.
 * @param {*} fetchFncResponse Response of the `fetchFnc` function.
*/

/**
 * @typedef Options
 * @property {number} expire Date (timestamp seconds) when you want to expire the cache.
 * @property {string} path Dot path to the property that will be saved. Example: `"user.data"`.
 * @property {ConditionFnc} condition 
*/

// * @property {number} [maxEntries] Default no limit. Maximum number of entries in the cache. 



/**
 * @property {function} get
 * @property {function} set
 * @property {function} delete
 * @property {function} deleteAll
 * @property {fncUse} use
 * @property {Object} expireWatcher
*/
const cajache = {
	get: fncGet,
	set: fncSet,
	delete: fncDelete,
	deleteAll: fncDeleteAll,
	use: fncUse,
	expireWatcher: expireWatcher,
};



module.exports = cajache;
