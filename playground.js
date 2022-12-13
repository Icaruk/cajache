
const cajache = require("./lib/cajache");



(async() => {
    
    const generateRandomId = () => Math.random().toString(36).slice(2);
    
    
    console.time("fetch 1");
    const response1 = await cajache.use(
        "first",
        generateRandomId,
        {
            ttl: 1000 * 5,
        }
    );
    console.timeEnd("fetch 1");
    console.log(`    ${response1}`);
    
    
    
    console.time("fetch 2");
    const response2 = await cajache.use(
        "first",
        generateRandomId,
        {
            ttl: 100,
        }
    );
    console.timeEnd("fetch 2");
    console.log(`    ${response2}`);
    
    
    // Sleep 2s
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    
    
    console.time("fetch 3");
    const response3 = await cajache.use(
        "first",
        generateRandomId,
        {
            ttl: 500,
        }
    );
    console.timeEnd("fetch 3");
    console.log(`    ${response3}`);
    
})();
