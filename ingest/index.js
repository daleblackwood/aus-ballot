require("ts-node").register({ project: __dirname + "/tsconfig.json" });
const process = require("process");

async function run() {
    console.log("\naus-ballot ingestion:");
    const moduleNames = ["candidates", "votes", "parties", "electorates"];
    let runargs = process.argv.includes("all") ? moduleNames.slice() : process.argv;
    try {
        let processed = 0;
        for (const arg of runargs) {
            const moduleName = arg.trim().toLowerCase();
            if (moduleNames.includes(moduleName)) {
                console.log("processing " + moduleName + "...");
                const module = require("./modules/" + moduleName);
                for (let key in module) {
                    await module.ingest();
                    break;
                }
            }
        }

        if (processed === 0) {
            throw "nothing processed. options are: " + moduleNames.join(", ");
        }
    }
    catch (e) {
        console.error(e + "\n" + e.stack ? e.stack : "");
    }
}

run();
