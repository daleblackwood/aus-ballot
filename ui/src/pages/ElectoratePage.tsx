import React from "react";
import { BasePage } from "./BasePage";
import { electService } from "../model/electService";
import { IElectorate, ICandidate, IElectorateResult } from "../model/Types";

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

                <h3>Last Election: Previous First Preferences</h3>
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
                        <td>Ballot</td>
                        <td>Surname</td>
                        <td>Name</td>
                        <td>Party</td>
                    </tr>
                </thead>
                <tbody>
                    { candidateElems }
                </tbody>
            </table>
        );
    }

    private renderCandidate(candidate: ICandidate) {
        return (
            <tr key={candidate.key}>
                <td>{candidate.balletPos}</td>
                <td>{candidate.surname}</td>
                <td>{candidate.firstname}</td>
                <td>{candidate.party ? candidate.party.name : ""}</td>
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
                        <td>Party</td>
                        <td>Vote %</td>
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
        return (
            <tr key={index}>
                <td>{result.party || "-"}</td>
                <td>{pcs}</td>
            </tr>
        )
    }
}
