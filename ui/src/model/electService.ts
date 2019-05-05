import { Subject } from "./Subject";
import { IElectorate, ICandidate, IParty, IElectorateResult, KeyMap } from "./Types";
import { Utils } from "../utils/Utils";

class ElectService {

    public subElectorates = new Subject<IElectorate[]>([]);
    public subParties = new Subject<IParty[]>([]);
    public subCandidates = new Subject<ICandidate[]>([]);
    public subElectorateKey = new Subject<string>("");

    constructor() {
        this.loadData();
    }

    public async loadData() {
        const electorates = await this.fetchJSON<IElectorate[]>("/data/electorates.json");
        const candidates = await this.fetchJSON<ICandidate[]>("/data/candidates.json");
        const parties = await this.fetchJSON<IParty[]>("/data/parties.json");

        this.subElectorates.setValue(electorates);
        this.subCandidates.setValue(candidates);
        this.subParties.setValue(parties);

        const votes = await this.fetchJSON<KeyMap<IElectorateResult[]>>("/data/votes.json");
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

    private async fetchJSON<T extends any>(url: string): Promise<T> {
        const res = await fetch(url);
        const str = await res.text();
        console.log(str);
        const json = JSON.parse(str);
        return json as T;
    }
}

export const electService = new ElectService();
