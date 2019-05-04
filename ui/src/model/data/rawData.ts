import * as Papa from "papaparse";
import { IElectorate, IParty, ICandidate, KeyMap } from "../Types";
import { Utils } from "../../utils/Utils";

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

export type FPPField = (
    "State" | "DivisionId" | "DivisionAb" | "DivisionName" | "PartyAb" | "CandidateSurname" | "Votes"
);

export type Field = CandidateField | FPPField;

const DEFAULT_PARTY_COLOR = "grey";

function readStr(row: any, field: Field) {
    return (row[field] || "").trim();
}

function readNum(row: any, field: Field) {
    return parseFloat(readStr(row, field) || "0");
}

function readBool(row: any, field: Field) {
    return readStr(row, field).toUpperCase() === "TRUE";
}

class RawData {
    
    public electorates: KeyMap<IElectorate> = {};
    public parties: KeyMap<IParty> = {};
    public candidates: KeyMap<ICandidate> = {};

    public async load() {
        this.electorates = {};
        this.parties = {};
        this.candidates = {};
        await this.loadParties();
        await this.loadCandidates();
        await this.loadResults();
    }

    private async loadParties() {
        const res = await fetch("/data/parties.json");
        const json = await res.json();
        for (const key in json.parties) {
            const partyIn = json.parties[key];
            this.makeParty({ ...partyIn, key });
        }
    }

    private async loadCandidates() {
        const rows = await this.loadCSV("/data/candidates.csv");

        const reqParty = (row: any) => {
            const name = readStr(row, "party_ballot_nm");
            const key = Utils.makeAbbrev(name);
            let party = this.getParty(name);
            if (! party) {
                party = this.makeParty({
                    key: key,
                    name
                });
            }
            return party;
        };

        const reqElectorate = (row: any) => {
            const name = readStr(row, "div_nm");
            const key = Utils.toKey(name);
            if (! this.electorates[key]) {
                const abbrev = Utils.makeAbbrev(key, 2);
                const state = readStr(row, "state_ab");
                this.electorates[key] = {
                    key,
                    name,
                    abbrev,
                    state
                };
            }
            return this.electorates[key];
        };

        const reqCandidate = (row: any) => {
            const surname = readStr(row, "surname");
            const firstname = readStr(row, "ballot_given_nm");
            const key = Utils.toKey(surname + " " + firstname);
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
        };

        for (const row of rows) {
            if (row.nom_ty !== "H") {
                continue;
            }
            const party = reqParty(row);
            const electorate = reqElectorate(row);
            const candidate = reqCandidate(row);
            candidate.party = party;
            candidate.electorate = electorate;
        }
    }

    private async loadResults() {
        const rows = await this.loadCSV("/data/first-prefs.csv");
        for (const row of rows) {
            const electorateKey = readStr(row, "DivisionName");
            let electorate = this.getElectorate(electorateKey);
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
            let party = this.getParty(partyKey);
            if (! party) {
                party = this.makeParty({
                    name: partyKey,
                    key: partyKey
                });
            }

            if (!electorate.results) {
                electorate.results = [];
            }

            const surname = readStr(row, "CandidateSurname");
            const candidate = Object.values(this.candidates).find(c => {
                return c.surname === surname && c.electorate === electorate
            }) || null;

            electorate.results.push({
                candidate,
                party: party.key,
                votes: votes,
                pc: 0
            });
        }

        for (const key in this.electorates) {
            const electorate = this.electorates[key];
            let total = 0;
            if (electorate.results) {
                for (const res of electorate.results) {
                    total += res.votes;
                }
                for (const res of electorate.results) {
                    res.pc = res.votes / total * 100;
                }
            }
        }
    }

    private makeParty(input: {
        name: string,
        key?: string,
        color?: string,
        alts?: string[] 
    }): IParty {
        const name = input.name;
        const key = Utils.toKey(input.key || input.name);
        const color = input.color || DEFAULT_PARTY_COLOR;
        const abbrev = Utils.makeAbbrev(key);

        const matches = [];
        matches.push(
            Utils.toKey(input.name),
            key,
            abbrev
        );
        if (input.alts) {
            for (const alt of input.alts) {
                matches.push(Utils.toKey(alt));
            }
        }

        const party: IParty = {
            key,
            name,
            abbrev,
            color,
            matches
        }

        this.parties[key] = party;

        console.log(`reg party ${party.key}`, party);

        return party;
    }

    private getParty(search: string): IParty|null {
        search = Utils.toKey(search);
        for (const key in this.parties) {
            const party = this.parties[key];
            for (const match of party.matches) {
                if (Utils.wordMatch(match, search)) {
                    return party;
                }
            }
        }
        return null;
    }

    private getElectorate(search: string): IElectorate|null {
        search = Utils.toKey(search);
        for (const key in this.electorates) {
            const electorate = this.electorates[key];
            if (Utils.wordMatch(search, electorate.name)) {
                return electorate;
            }
            if (Utils.wordMatch(search, electorate.key)) {
                return electorate;
            }
        }
        return null;
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
