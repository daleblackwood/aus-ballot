import { rawData } from "./rawData";
import { Subject } from "./Subject";
import { IElectorate, KeyMap, IParty, ICandidate } from "./Types";


class ElectService {

    public subElectorates = new Subject<IElectorate[]>([]);
    public subParties = new Subject<IParty[]>([]);
    public subCandidates = new Subject<ICandidate[]>([]);

    public subElectorate = new Subject<IElectorate|null>(null);

    constructor() {
        this.loadData();
    }

    public async loadData() {
        await rawData.load();

        const extract = <T>(map: KeyMap<T>): T[] => {
            const result: T[] = [];
            for (const key in map) {
                if (map[key]) {
                    result.push(map[key]);
                }
            }
            return result;
        }

        this.subElectorates.setValue(extract(rawData.electorates));
        this.subCandidates.setValue(extract(rawData.candidates));
        this.subParties.setValue(extract(rawData.parties));
    }

    public getElectorate(electorateKey: string) {
        return this.subElectorates.value.find(e => e.key === electorateKey);
    }

    public getCandidates(electorateKey: string) {
        const result = this.subCandidates.value.filter(c => c.electorate && c.electorate.key === electorateKey);
        result.sort((a, b) => {
            return a.balletPos < b.balletPos ? -1 : 1;
        });
        return result;
    }
}

export const electService = new ElectService();
