
// async function _crystalImport() {
//     try {
//         // const crystal = await import("http://localhost:5173/build/crystal.es.js");
//         const crystal = await import("https://dist.hulu.deckz.fun/crystal/0.0.1/crystal.es.js");
//         crystal.run();
//     } catch (error) {
//         console.error('Dynamic import is not supported:', error);
//     }
// }
//
// _crystalImport();

const crystal = await import("http://localhost:5173/build/crystal.es.js");
crystal.run({"useDebugAppId": "548430", "enableHistoryPriceCharts": true});

console.log("Hello World!")