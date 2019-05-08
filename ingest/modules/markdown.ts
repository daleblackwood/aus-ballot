import { loadMDHTML, writeText } from "../utils";

const DIR_IN = __dirname + "/../../ui/public/pages/";

async function ingest() {
    const html = await loadMDHTML(__dirname + "/../../README.md");
    await writeText(DIR_IN + "/about.html", html);
}

export { ingest };
