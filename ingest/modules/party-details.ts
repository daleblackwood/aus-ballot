import { WebAPI } from "../utils/WebAPI";
import { IParty, IPartyDetails, KeyMap } from "../../ui/src/model/Types";
import { loadJSON, writeJSON } from "../utils";

const DIR_IN = __dirname + "/../../ui/public/data/";
const DIR_OUT = DIR_IN + "parties/";

let partyDetails: KeyMap<IPartyDetails> = {};

async function ingest() {
    partyDetails = {};
    const parties = await loadJSON<IParty[]>(DIR_IN + "/parties.json");
    console.log("Loading " + parties.length + " parties");
    for (const party of parties) {
        partyDetails[party.key] = await loadPartyDetails(party);
        const path = DIR_OUT + party.key + ".json";
        await writeJSON(path, partyDetails[party.key]);
    }
}

async function loadPartyDetails(party: IParty): Promise<IPartyDetails> {
    let partySearch = party.name;
    if (partySearch.indexOf("australia") < 0) {
        partySearch += " australia";
    }
    const website = await WebAPI.getLuckyUrl(partySearch);
    const websiteDomain = WebAPI.getDomain(website);

    let aboutUrl = await WebAPI.getLuckyUrl(websiteDomain + " policy");
    let websitePreview = undefined;
    if (aboutUrl) {
        websitePreview = await WebAPI.scrapePageSummary(aboutUrl);
    }
    if (! websitePreview) {
        aboutUrl = await WebAPI.getLuckyUrl("about", websiteDomain);
        if (aboutUrl) {
            websitePreview = await WebAPI.scrapePageSummary(aboutUrl);
        }
    }

    const wikipedia = await WebAPI.getLuckyUrl(partySearch, "wikipedia.org");
    const wikipediaPreview = wikipedia ? await WebAPI.scrapePageSummary(wikipedia) : undefined;

    return {
        key: party.key,
        website,
        websitePreview,
        wikipedia,
        wikipediaPreview
    }
}

export { ingest };
