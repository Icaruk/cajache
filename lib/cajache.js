
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
	
	// "comentarios": {
	// 	data: {
	// 		comentarios: [
	// 			"asd",
	// 			"qwe",
	// 			"rty",
	// 		],
	// 		total: 3,
	// 	},
	// 	expire: null,
	// },
	
};


/**
 * Deletes a  cache box.
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
		
		
		// Si está caducado, borro la entrada y devuelvo null, como si no lo hubiese encontrado
		if (ref[lastKey].expire < ( Date.now() / 1000)) {
			delete ref[lastKey];
			return null;
		};
		
		// Si llego hasta aquí, lo he encontrado y devuelvo su propiedad data
		return ref[lastKey].data;
		
	} catch(err) {
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
	
	if (options.path) {
		const [ref, lastKey] = getRef(fresh, options.path.split("."));
		fresh = ref[lastKey];
	};
	
	
	cajache.set(id, fresh, options);
	
	return fresh;
	
};



// -------------------------------------------------------------------------------------------------------------------------------



/**
 * @typedef Options
 * @property {number} expire Timestamp (seconds) of when the data will expire.
 * @property {string} path Dot path to the property that will be saved. Example: `"user.data"`.
 * @ {function} condition (DISABLED TEMPORALLY) Función a la que se le pasará como argumento la respuesta de `fetchFnc`. Si devuelve `true` se cachearán los datos.
*/



/**
 * @property {function} get
 * @property {function} set
 * @property {function} delete
 * @property {function} deleteAll
 * @property {fncUse} use
*/
const cajache = {
	get: fncGet,
	set: fncSet,
	delete: fncDelete,
	deleteAll: fncDeleteAll,
	use: fncUse,
};

module.exports = cajache;
