import React from "react";
import { BasePage } from "./BasePage";
import { electService } from "../model/electService";
import { IElectorate, ICandidate, IElectorateResult, IParty } from "../model/Types";
import { appService } from "../model/appService";

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
        return (
            <tr key={candidate.key}>
                <td>{candidate.balletPos}</td>
                <td>
                    <a href="#" onClick={this.candidateClickHanlder(candidate)}>
                        {name}
                    </a>
                </td>
                <td>{this.renderPartyIcon(party)} 
                    <a href="#" onClick={this.partyClickHanlder(party)}>
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
            <table className="redults">
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
        return (
            <tr key={index}>
                <td>{partyStr || "-"}</td>
                <td>{this.renderPartyIcon(party)} {pcs}</td>
            </tr>
        )
    }

    private renderPartyIcon(party: IParty|null|undefined) {
        const color = party ? party.color : "#CCC";
        const abbrev = party ? party.abbrev : "";

        const onClick = this.partyClickHanlder(party);

        return (
            <span className="party-icon" style={{ backgroundColor: color }} onClick={ onClick }>{ abbrev }</span>
        );
    }

    private partyClickHanlder(party: IParty|null|undefined) {
        if (!party) {
            return undefined;
        }
        return async () => {
            const url = electService.fetchLuckyUrl("site:en.m.wikipedia.org " + party.name);
            appService.openModal(party.name + " Wikipedia", url);
        };
    }

    private candidateClickHanlder(candidate: ICandidate|null|undefined) {
        if (!candidate) {
            return undefined;
        }
        return () => {
            if (!candidate.electorateKey) {
                return;
            };
            const electorate = electService.getElectorate(candidate.electorateKey);
            if (!electorate) {
                return;
            }
            const candidateName = candidate.firstname + " " + candidate.surname;
            const url = electService.fetchLuckyUrl(electorate.name + " " + candidateName);
            appService.openModal(candidateName + " Wikipedia", url);
        };
    }
}
