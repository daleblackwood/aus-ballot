export type KeyMap<T> = { [key: string]: T };

export enum House {
    Representitives = "Representitives",
    Senate = "Senate"
}

export interface IParty {
    key: string;
    name: string;
    color?: string;
}

export interface IElectorate {
    key: string;
    name: string;
    state: string;
    abbrev: string;
    lat?: number;
    lon?: number;
}

export interface ICandidate {
    key: string;
    firstname: string;
    surname: string;
    occupation: string;
    balletPos: number;
    email?: string;
    party?: IParty;
    electorate?: IElectorate;
}
