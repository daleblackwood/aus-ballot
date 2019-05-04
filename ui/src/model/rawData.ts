import * as Papa from "papaparse";
import { IElectorate, IParty, ICandidate, KeyMap } from "./Types";

export type CandidateField = (
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

function readStr(row: any, field: CandidateField) {
    return row[field] || "";
}

function readNum(row: any, field: CandidateField) {
    return parseFloat(readStr(row, field) || "0");
}

function readBool(row: any, field: CandidateField) {
    return readStr(row, field).toLowerCase() === "true";
}

function toKey(value: string) {
    return (value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getPartyColor(key: string) {
    key = toKey(key);
    for (const pk in PARTY_COLORS) {
        if (key.indexOf(pk) >= 0) {
            return PARTY_COLORS[pk];
        }
    }
    return undefined;
}

const PARTY_COLORS: KeyMap<string> = {
    "labor": "red",
    "liberal": "blue",
    "greens": "green",
    "united australia": "yellow"
}

class RawData {
    
    public electorates: KeyMap<IElectorate> = {};
    public parties: KeyMap<IParty> = {};
    public candidates: KeyMap<ICandidate> = {};

    public async load() {
        this.electorates = {};
        this.parties = {};
        this.candidates = {};

        const rows = await this.loadCSV("data/candidates.csv");
        for (const row of rows) {
            const party = this.reqParty(row);
            const electorate = this.reqElectorate(row);
            const candidate = this.reqCandidate(row);
            candidate.party = party;
            candidate.electorate = electorate;
        }

        console.log(this.parties);
    }

    private reqParty(row: any) {
        const name = readStr(row, "party_ballot_nm");
        const key = toKey(name);
        if (! this.parties[key]) {
            const color = getPartyColor(key);
            this.parties[key] = {
                key,
                name,
                color
            };
        }
        return this.parties[key];
    }

    private reqElectorate(row: any) {
        const name = readStr(row, "div_nm");
        const key = toKey(name);
        if (! this.electorates[key]) {
            let abbrev = key.substr(0, 2).toUpperCase();
            const spaceI = key.indexOf(" ");
            if (spaceI > 0) {
                abbrev = (key.charAt(0) + key.charAt(spaceI + 1)).toUpperCase();
            }
            const state = readStr(row, "state_ab");
            this.electorates[key] = {
                key,
                name,
                abbrev,
                state
            };
        }
        return this.electorates[key];
    }

    private reqCandidate(row: any) {
        const surname = readStr(row, "surname");
        const firstname = readStr(row, "ballot_given_nm");
        const key = toKey(surname + " " + firstname);
        if (! this.candidates[key]) {
            this.candidates[key] = {
                key,
                firstname,
                surname,
                occupation: readStr(row, "occupation"),
                balletPos: readNum(row, "ballot_position"),
                email: readStr(row, "contact_email")
            };
        }
        return this.candidates[key];
    }

    private async loadCSV(path: string): Promise<Array<KeyMap<string>>> {
        const csvReq = await fetch(path);
        const csvStr = await csvReq.text();
        const parsed = Papa.parse(csvStr, { header: true });
        const rows = parsed.data;
        return rows;
    }

}

export const rawData = new RawData();
