import * as fs from "fs";
import * as Papa from "papaparse";
import * as showdown from "showdown";
import { KeyMap, IParty, IElectorate } from "../../ui/src/model/Types";
import { Utils } from "../../ui/src/utils/Utils";

const DEFAULT_PARTY_COLOR = "grey";

export async function loadCSV(path: string): Promise<Array<KeyMap<string>>> {
    const str = await loadText(path);
    const parsed = Papa.parse(str, { header: true });
    const rows = parsed.data;
    return rows;
}

export async function loadJSON<T extends any>(path: string): Promise<T> {
    const str = await loadText(path);
    const json = JSON.parse(str);
    return json;
}

export async function loadMDHTML(path: string): Promise<string> {
    const str = await loadText(__dirname + "/../../README.md");
    const converter = new showdown.Converter();
    const html = converter.makeHtml(str);
    return html;
}

export async function loadText(path: string): Promise<string> {
    const file = await new Promise<string>((resolve, reject) => {
        fs.readFile(path, { encoding: "utf-8" }, (err, res) => err ? reject(err) : resolve(res));
    });
    return file;
}

export async function writeJSON(path: string, data: any) {
    const json = JSON.stringify(data, null, "  ");
    await writeText(path, json);
}

export async function writeText(path: string, text: string) {
    await new Promise<any>((resolve, reject) => {
        fs.writeFile(path, text, { encoding: "utf-8" }, err => err ? reject(err) : resolve());
    });
}

export function mapToArray<T extends object>(map: KeyMap<T>): T[] {
    const result: T[] = [];
    for (const key in map) {
        result.push(map[key]);
    }
    return result;
}

export function makeParty(
    partyMap:KeyMap<IParty>, 
    input: {
       name: string,
        key?: string,
        color?: string,
        alts?: string[] 
    }
): IParty {
    const name = input.name;
    const key = Utils.toKey(input.key || input.name);
    const color = input.color || DEFAULT_PARTY_COLOR;
    const abbrev = Utils.makeAbbrev(key);

    const matches = [];
    matches.push(
        input.name,
        key,
        abbrev
    );
    if (input.alts) {
        for (const alt of input.alts) {
            matches.push(alt);
        }
    }

    const party: IParty = {
        key,
        name,
        abbrev,
        color,
        matches
    }

    partyMap[key] = party;
    return party;
}

export function getParty(partyMap:KeyMap<IParty>, search: string): IParty|null {
    search = Utils.toKey(search);
    for (const key in partyMap) {
        const party = partyMap[key];
        for (const match of party.matches) {
            if (Utils.wordMatch(match, search)) {
                return party;
            }
        }
    }
    return null;
}

export function getElectorate(electorateMap:KeyMap<IElectorate>, search: string): IElectorate|null {
    search = Utils.toKey(search);
    for (const key in electorateMap) {
        const electorate = electorateMap[key];
        if (Utils.keyMatch(search, electorate.name)) {
            return electorate;
        }
        if (Utils.keyMatch(search, electorate.key)) {
            return electorate;
        }
    }
    return null;
}
