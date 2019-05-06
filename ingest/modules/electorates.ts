import { JSDOM } from "jsdom";
import { WebAPI } from "../utils/WebAPI";
import { IParty, IPartyDetails, KeyMap, IElectorate, IElectorateDetails } from "../../ui/src/model/Types";
import { loadJSON, writeJSON } from "../utils";
import { Utils } from "../../ui/src/utils/Utils";

const DIR_IN = __dirname + "/../../ui/public/data/";
const DIR_OUT = DIR_IN + "electorates/";

let electorateDetails: KeyMap<IPartyDetails> = {};

async function ingest() {
    electorateDetails = {};
    const electorates = await loadJSON<IElectorate[]>(DIR_IN + "/electorates.json");
    console.log("Loading " + electorates.length + " electorates");
    for (const electorate of electorates) {
        electorateDetails[electorate.key] = await loadElectorateDetails(electorate);
        const path = DIR_OUT + electorate.key + ".json";
        await writeJSON(path, electorateDetails[electorate.key]);
    }
}

async function loadElectorateDetails(electorate: IElectorate): Promise<IElectorateDetails> {
    let aecLink = "http://aec.gov.au/" + electorate.name.toLowerCase();
    let aecHTML = undefined;
    if (aecLink) {
        aecHTML = await WebAPI.loadPage(aecLink);
    }
    if (! aecHTML) {
        aecLink = await WebAPI.getLuckyUrl(electorate.name, "aec.gov.au");
        if (aecLink) {
            aecHTML = await WebAPI.loadPage(aecLink);
        }
    }

    const webmap: KeyMap<string> = {};

    if (aecHTML) {
        const dom = new JSDOM(aecHTML);
        const profileElem = dom.window.document.querySelector("dl#div-profile");
        let key = undefined;
        let value = undefined;
        if (profileElem && profileElem.childNodes.length > 0) {
            profileElem.childNodes.forEach(child => {
                if (child.nodeName == "DT") {
                    key = Utils.toKey(child.textContent);
                }
                if (child.nodeName == "DD" && key) {
                    value = child.textContent;
                    if (key && value) {
                        webmap[key] = value.trim().replace(/[ \t]+/g, " ");
                    }
                    key = value = undefined;
                }
            });
        }
    }

    console.log(electorate.name, aecLink);

    let members = [];
    const memberStr = webmap["MEMBERS"];
    if (memberStr) {
        for (const line of memberStr.split("\n")) {
            const member = line.trim();
            members.push(member);
        }
    }

    return {
        key: electorate.key,
        website: aecLink,
        description: webmap["LOCATION-DESCRIPTION"],
        demographic: webmap["DEMOGRAPHIC-RATING"],
        nomenclature: webmap["NAME-DERIVATION"],
        area: webmap["AREA"],
        industry: webmap["PRODUCTSINDUSTRIES-OF-THE-AREA"],
        members
    }
}

export { ingest };
