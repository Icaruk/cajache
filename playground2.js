
const axios = require("axios");
const cajache = require("./lib/cajache");

const cajache2 = cajache.new();



(async() => {
    
    console.time("fetch 1");
    const response1 = await cajache2.use(
        "characters",
        () => axios.get("https://rickandmortyapi.com/api/character/14"),
    );
    console.timeEnd("fetch 1");
    console.log(`    ${response1.data?.name}`);

    
    console.time("fetch 2 (cached)");
    const response2 = await cajache2.use(
        "characters",
        () => axios.get("https://rickandmortyapi.com/api/character/14"),
    );
    console.timeEnd("fetch 2 (cached)");
    console.log(`    ${response2.data?.name}`);
    
    
    
    console.time("fetch 3 (cached)");
    const response3 = await cajache2.use(
        "characters",
        () => axios.get("https://rickandmortyapi.com/api/character/14"),
    );
    console.timeEnd("fetch 3 (cached)");
    console.log(`    ${response3.data?.name}`);
    
    
    
    // fetch 1: 248.659ms
    // fetch 2 (cached): 0.015ms
    // fetch 3 (cached): 0.008ms
    
})();
