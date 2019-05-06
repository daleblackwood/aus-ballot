import { IElectorate, IParty, ICandidate, KeyMap } from "../../ui/src/model/Types";
import { Utils } from "../../ui/src/utils/Utils";
import { loadCSV, loadJSON, writeJSON, mapToArray, makeParty, getParty } from "../utils";

const DIR_IN = __dirname + "/../data/";
const DIR_OUT = __dirname + "/../../ui/public/data/";

type CandidateField = (
    "txn_nm" |
    "nom_ty" |
    "state_ab" |
    "div_nm" |
    "ticket" |
    "ballot_position" |
    "surname" |
    "ballot_given_nm" |
    "party_ballot_nm" |
    "occupation" |
    "address_1" |
    "address_2" |
    "postcode" |
    "suburb" |
    "address_state_ab" |
    "contact_work_ph" |
    "contact_home_ph" |
    "postal_address_1" |
    "postal_address_2" |
    "postal_suburb" |
    "postal_postcode" |
    "contact_fax" |
    "postal_state_ab" |
    "contact_mobile_no" |
    "contact_email"
);

export { ingest, load };

async function ingest() {
    const result = await this.load();
    await writeJSON(DIR_OUT + "/candidates.json", mapToArray(result.candidateMap));
    await writeJSON(DIR_OUT + "/electorates.json", mapToArray(result.electorateMap));
    await writeJSON(DIR_OUT + "/parties.json", mapToArray(result.partyMap));
}

function readStr(row: any, field: CandidateField) {
    return (row[field] || "").trim();
}

function readNum(row: any, field: CandidateField) {
    return parseFloat(readStr(row, field) || "0");
}

let electorateMap: KeyMap<IElectorate> = {};
let partyMap: KeyMap<IParty> = {};
let candidateMap: KeyMap<ICandidate> = {};

async function load() {
    electorateMap = {};
    partyMap = {};
    candidateMap = {};
    await loadParties();
    await loadCandidates();
    return {
        electorateMap,
        partyMap,
        candidateMap
    }
}

async function loadParties() {
    const json = await loadJSON<any>(DIR_IN + "/parties.json");
    for (const key in json.parties) {
        const partyIn = json.parties[key];
        makeParty(partyMap, { ...partyIn, key });
    }
}

async function loadCandidates() {
    const rows = await loadCSV(DIR_IN + "/candidates.csv");

    const reqParty = (row: any) => {
        const name = readStr(row, "party_ballot_nm");
        const key = Utils.makeAbbrev(name);
        let party = getParty(partyMap, name);
        if (! party) {
            party = makeParty(partyMap, {
                key: key,
                name
            });
        }
        return party;
    };

    const reqElectorate = (row: any) => {
        const name = readStr(row, "div_nm");
        const key = Utils.toKey(name);
        if (! electorateMap[key]) {
            const abbrev = Utils.makeAbbrev(key, 2);
            const state = readStr(row, "state_ab");
            electorateMap[key] = {
                key,
                name,
                abbrev,
                state
            };
        }
        return electorateMap[key];
    };

    const reqCandidate = (row: any) => {
        const surname = readStr(row, "surname");
        const firstname = readStr(row, "ballot_given_nm");
        const key = Utils.toKey(surname + " " + firstname);
        if (! candidateMap[key]) {
            candidateMap[key] = {
                key,
                firstname,
                surname,
                occupation: readStr(row, "occupation"),
                balletPos: readNum(row, "ballot_position"),
                email: readStr(row, "contact_email"),
                partyPrinted: readStr(row, "party_ballot_nm")
            };
        }
        return candidateMap[key];
    };

    for (const row of rows) {
        if (row.nom_ty !== "H") {
            continue;
        }
        const party = reqParty(row);
        const electorate = reqElectorate(row);
        const candidate = reqCandidate(row);
        candidate.partyKey = party.key;
        candidate.electorateKey = electorate.key;
    }
}
