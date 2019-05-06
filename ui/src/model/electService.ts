import { Subject } from "./Subject";
import { IElectorate, ICandidate, IParty, IElectorateResult, KeyMap, IPartyDetails } from "./Types";
import { Utils } from "../utils/Utils";

const DATA_PATH = "/data/";

class ElectService {

    public subElectorates = new Subject<IElectorate[]>([]);
    public subParties = new Subject<IParty[]>([]);
    public subCandidates = new Subject<ICandidate[]>([]);
    public subElectorateKey = new Subject<string>("");
    public subPartyKey = new Subject<string>("");

    constructor() {
        this.loadData();
    }

    public async loadData() {
        const electorates = await this.fetchJSON<IElectorate[]>(DATA_PATH + "/electorates.json");
        const candidates = await this.fetchJSON<ICandidate[]>(DATA_PATH + "/candidates.json");
        const parties = await this.fetchJSON<IParty[]>(DATA_PATH + "/parties.json");

        this.subElectorates.setValue(electorates);
        this.subCandidates.setValue(candidates);
        this.subParties.setValue(parties);

        const votes = await this.fetchJSON<KeyMap<IElectorateResult[]>>(DATA_PATH + "/votes.json");
        for (const key in votes) {
            const electorate = this.getElectorate(key);
            if (!electorate) {
                continue;
            }
            electorate.results = votes[key];
        }
    }

    public getElectorate(electorateKey: string): IElectorate|null {
        electorateKey = Utils.toKey(electorateKey);
        return this.subElectorates.value.find(e => e.key === electorateKey) || null;
    }

    public getCandidates(electorateKey: string): ICandidate[] {
        const result = this.subCandidates.value.filter(c => c.electorateKey === electorateKey);
        result.sort((a, b) => {
            return a.balletPos < b.balletPos ? -1 : 1;
        });
        return result;
    }

    public getParty(partyKey: string|null|undefined): IParty|null {
        if (partyKey) {
            for (const party of this.subParties.value) {
                for (const match of party.matches) {
                    if (Utils.wordMatch(match, partyKey)) {
                        return party;
                    }
                }
            }
        }
        return null;
    }

    public fetchLuckyUrl(term: string): string {
        const query = term.replace(/\s/g, "+");
        const sendURL = "https://www.google.com/search?q=" + query + "&btnI";
        return sendURL;
    }

    public async loadPartyDetails(partyKey: string): Promise<IPartyDetails|null> {
        const party = this.getParty(partyKey);
        if (party) {
            const url = DATA_PATH + "/parties/" + party.key + ".json";
            try {
                party.details = await this.fetchJSON<IPartyDetails>(url);
                return party.details;
            }
            catch (e) {
                console.warn("Couldn't load details from " + url + " for party " + partyKey);
            }
        }
        else {
            console.warn("No party " + partyKey);
        }
        return null;
    }

    private async fetchJSON<T extends any>(url: string): Promise<T> {
        const res = await fetch(url);
        const str = await res.text();
        console.log(str);
        const json = JSON.parse(str);
        return json as T;
    }
}

export const electService = new ElectService();
