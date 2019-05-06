import React from "react";
import { BasePage } from "./BasePage";
import { electService } from "../model/electService";
import { IElectorate, ICandidate, IElectorateResult, IParty } from "../model/Types";
import { appService } from "../model/appService";
import { Link } from "react-router-dom";

interface IElectoratePageProps {
    electorate?: string;
}

export class ElectoratePage extends BasePage<IElectoratePageProps> {

    public render() {
        const electorate = electService.getElectorate(this.props.electorate || "");
        if (!electorate) {
            return (
                <div>Please select an electorate.</div>
            );
        }
        return (
            <div className="electorate">
                <h2>{electorate.name}, {electorate.state}</h2>
                { this.renderCandidates(electorate) }

                <h3>Last Election: First Preference Votes</h3>
                { this.renderResults(electorate) }
            </div>
        )
    }

    private renderCandidates(electorate: IElectorate) {
        const candidateElems: JSX.Element[] = [];

        const candidates = electService.getCandidates(electorate.key);
        for (const candidate of candidates) {
            candidateElems.push(this.renderCandidate(candidate));
        }

        return (
            <table className="candidates">
                <thead>
                    <tr>
                        <th>Ballot</th>
                        <th>Name</th>
                        <th>Party</th>
                    </tr>
                </thead>
                <tbody>
                    { candidateElems }
                </tbody>
            </table>
        );
    }

    private renderCandidate(candidate: ICandidate) {
        const name = candidate.firstname + " " + candidate.surname;
        const party = electService.getParty(candidate.partyKey);

        const candidateUrl = appService.resolvePath("#candidate:" + candidate.key);
        const partyUrl = party ? appService.resolvePath("#party:" + party.key) : "";

        return (
            <tr key={candidate.key}>
                <td>{candidate.balletPos}</td>
                <td>
                    {name}
                </td>
                <td>{this.renderPartyIcon(party, partyUrl)} 
                    <a href={partyUrl}>
                        {candidate.partyPrinted ? candidate.partyPrinted : ""}
                    </a>
                </td>
            </tr>
        )
    }

    private renderResults(electorate: IElectorate) {
        if (!electorate.results) {
            return "There are no results for this electorate.";
        }

        const results = electorate.results.slice();
        results.sort((a, b) => {
            return a.votes > b.votes ? -1 : 1;
        });

        const resultElems: JSX.Element[] = [];
        for (const result of results) {
            resultElems.push(this.renderResult(resultElems.length, result));
        }

        return (
            <table className="results">
                <thead>
                    <tr>
                        <th>Party</th>
                        <th>Vote %</th>
                    </tr>
                </thead>
                <tbody>
                    { resultElems }
                </tbody>
            </table>
        );
    }

    private renderResult(index: number, result: IElectorateResult) {
        const pc = Math.round(result.pc);
        const pcs = result.pc < 1 ? "< 1%" : pc + "%";
        const party = electService.getParty(result.party);
        const partyStr = party ? party.name : result.party;

        let url = "#";
        if (party) {
            url += "party:" + party.key;
        }

        return (
            <tr key={index}>
                <td>
                    <a href={url}>{partyStr || "-"}</a>
                </td>
                <td>{this.renderPartyIcon(party, url)} {pcs}</td>
            </tr>
        )
    }

    private renderPartyIcon(party: IParty|null|undefined, url: string) {
        const color = party ? party.color : "#CCC";
        const abbrev = party ? party.abbrev : "";

        return (
            <span className="party-icon" style={{ backgroundColor: color }}>
                <a href={url}>{ abbrev }</a>
            </span>
        );
    }
}
