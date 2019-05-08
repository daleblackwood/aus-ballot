import { string } from "prop-types";

export type KeyMap<T> = { [key: string]: T };

export enum House {
    Representitives = "Representitives",
    Senate = "Senate"
}

export interface IParty {
    key: string;
    name: string;
    color: string;
    matches: string[];
    abbrev: string;
    details?: IPartyDetails;
}

export interface IPartyDetails {
    key: string;
    website?: string;
    websitePreview?: string;
    wikipedia?: string;
    wikipediaPreview?: string;
}

export interface IElectorateDetails {
    key: string;
    website?: string;
    description?: string;
    demographic?: string;
    nomenclature?: string;
    area?: string;
    industry?: string;
    memberKey?: string;
    partyKey?: string;
}

export interface IElectorate {
    key: string;
    name: string;
    state: string;
    abbrev: string;
    lat?: number;
    lon?: number;
    results?: IElectorateResult[];
    details?: IElectorateDetails;
}

export interface IElectorateResult {
    candidateKey?: string;
    party: string;
    votes: number;
    pc: number;
}

export interface ICandidate {
    key: string;
    firstname: string;
    surname: string;
    balletPos: number;
    occupation?: string;
    email?: string;
    partyPrinted?: string;
    partyKey?: string;
    electorateKey?: string;
}
