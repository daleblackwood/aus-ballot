import { writeJSON, loadCSV, getElectorate, getParty, makeParty } from "../utils";
import { load as loadCandidates } from "./candidates";
import { KeyMap, IElectorateResult } from "../../ui/src/model/Types";

const DIR_IN = __dirname + "/../data/";
const DIR_OUT = __dirname + "/../../ui/public/data/";

export type FPPField = (
    "State" | "DivisionId" | "DivisionAb" | "DivisionName" | "PartyAb" | "CandidateSurname" | "Votes"
);

export { ingest, load };

async function ingest() {
    const result = await this.load();
    await writeJSON(DIR_OUT + "/votes.json", result);
}

const DEFAULT_PARTY_COLOR = "grey";

function readStr(row: any, field: FPPField) {
    return (row[field] || "").trim();
}

function readNum(row: any, field: FPPField) {
    return parseFloat(readStr(row, field) || "0");
}

async function load() {
    return await loadResults();
}

let resultMap: KeyMap<IElectorateResult[]> = {};

async function loadResults() {
    const data = await loadCandidates();

    resultMap = {};
    
    const rows = await loadCSV(__dirname + "/../data/first-prefs.csv");
    for (const row of rows) {
        const electorateKey = readStr(row, "DivisionName");
        let electorate = getElectorate(data.electorateMap, electorateKey);
        if (! electorate) {
            console.log("No electorate", electorateKey);
            continue;
        }

        const votes = readNum(row, "Votes");
        if (! votes) {
            console.log("No votes", electorateKey);
            continue;
        }

        const partyKey = readStr(row, "PartyAb");
        let party = getParty(data.partyMap, partyKey);
        if (! party) {
            party = makeParty(data.partyMap, {
                name: partyKey,
                key: partyKey
            });
        }

        if (!electorate.results) {
            electorate.results = [];
        }

        const surname = readStr(row, "CandidateSurname");
        const candidate = Object.values(data.candidateMap).find(c => {
            return c.surname === surname && c.electorateKey === electorate.key
        }) || null;

        if (! resultMap[electorateKey]) {
            resultMap[electorateKey] = [];
        }

        resultMap[electorateKey].push({
            candidateKey: candidate ? candidate.key : undefined,
            party: party.key,
            votes: votes,
            pc: 0
        });
    }

    for (const key in resultMap) {
        const results = resultMap[key];
        let total = 0;
        if (results) {
            for (const res of results) {
                total += res.votes;
            }
            for (const res of results) {
                res.pc = res.votes / total * 100;
            }
        }
    }

    return resultMap;
}
