
const axios = require("axios");
const cajache = require("./lib/cajache");



(async() => {
    
    return;
    
    console.time("fetch 1");
    await cajache.use(
        "characters",
        () => axios.get("https://rickandmortyapi.com/api/character/14"),
    );
    console.timeEnd("fetch 1");
    
    
    
    console.time("fetch 2 (cached)");
    await cajache.use(
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
    
    
    
    // fetch 1: 248.659ms
    // fetch 2 (cached): 0.015ms
    // fetch 3 (cached): 0.008ms
    
})();



(async() => {
    
    console.time("fetch page 1");
    await cajache.use(
        ["characters", "page_1"],
        () => axios.get("https://rickandmortyapi.com/api/character/?page=1"),
    );
    console.timeEnd("fetch page 1");
    
    console.time("fetch page 2");
    await cajache.use(
        ["characters", "page_2"],
        () => axios.get("https://rickandmortyapi.com/api/character/?page=2"),
    );
    console.timeEnd("fetch page 2");
    
    
    
    console.time("fetch page 1 (cached)");
    await cajache.use(
        ["characters", "page_1"],
        () => axios.get("https://rickandmortyapi.com/api/character/?page=1"),
    );
    console.timeEnd("fetch page 1 (cached)");
    
    console.time("fetch page 2 (cached)");
    await cajache.use(
        ["characters", "page_2"],
        () => axios.get("https://rickandmortyapi.com/api/character/?page=2"),
    );
    console.timeEnd("fetch page 2 (cached)");
    
    
    
    // fetch page 1: 284.629ms
    // fetch page 2: 208.210ms
    // fetch page 1 (cached): 0.018ms
    // fetch page 2 (cached): 0.008ms
    
})();
