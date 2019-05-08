import { JSDOM } from "jsdom";
import { WebAPI } from "../utils/WebAPI";
import { IParty, IPartyDetails, KeyMap, IElectorate, IElectorateDetails, ICandidate } from "../../ui/src/model/Types";
import { loadJSON, writeJSON, getParty, mapToArray } from "../utils";
import { Utils } from "../../ui/src/utils/Utils";
import { load as loadCandidates, IElectorateResult, writeElectorates } from "./candidates";

const DIR_IN = __dirname + "/../../ui/public/data/";
const DIR_OUT = DIR_IN + "electorates/";

let electorateDetails: KeyMap<IElectorateDetails> = {};
let data: IElectorateResult;

async function ingest() {
    electorateDetails = {};
    data = await loadCandidates();
    const electorates = Object.values(data.electorateMap);
    console.log("Loading " + electorates.length + " electorates");
    for (const electorate of electorates) {
        const partyDetails = await loadElectorateDetails(electorate);
        electorate.details = partyDetails;
    }
    await writeElectorates(data.electorateMap);
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
        const profileElem = dom.window.document.querySelector(".container dl");
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

    let memberKey = undefined;
    let partyKey = undefined;
    const memberField = webmap["MEMBERS"];
    if (memberField) {
        const memberStr = (memberField.split("\n")[0] || "").trim() || undefined;
        if (memberStr) {
            const member = getMemberForElectorate(electorate.key, memberStr);
            if (member) {
                memberKey = member.key;
            }

            partyKey = (memberStr.match(/(\().*(\))/g)||[])[0] || undefined;
            if (partyKey) {
                partyKey = partyKey.replace(/[\(\)]/g, "");
                const party = getParty(data.partyMap, partyKey) || data.partyMap[partyKey];
                if (party) {
                    partyKey = party ? party.key : undefined;
                }
            }
        }
    }

    console.log(electorate.name, aecLink, partyKey, memberKey);

    return {
        key: electorate.key,
        website: aecLink,
        description: webmap["LOCATION-DESCRIPTION"],
        demographic: webmap["DEMOGRAPHIC-RATING"],
        nomenclature: webmap["NAME-DERIVATION"],
        area: webmap["AREA"],
        industry: webmap["PRODUCTSINDUSTRIES-OF-THE-AREA"],
        memberKey,
        partyKey
    }
}

function getMemberForElectorate(electorateKey: string, memberField: string): ICandidate|undefined {
    let partyKey: string = undefined;
    let memberKey: string = undefined;

    if (! memberField) {
        return undefined;
    }
    memberField = memberField.trim();

    const commaI = memberField.indexOf(',');
    if (commaI < 0) {
        return undefined;
    }
    const surname = memberField.substr(0, commaI);
    const firstInitial = memberField.charAt(commaI + 2);

    const memberStart = Utils.toKey(surname + " " + firstInitial);

    let member: ICandidate|null = null;
    for (const key in data.candidateMap) {
        if (key.startsWith(memberStart)) {
            const candidate = data.candidateMap[key];
            if (candidate.electorateKey === electorateKey) {
                member = candidate;
                return member;
            }
        }
    }
    return undefined;
}

export { ingest };
