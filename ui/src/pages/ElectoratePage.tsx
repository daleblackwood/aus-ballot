import React from "react";
import { BasePage } from "./BasePage";
import { electService } from "../model/electService";
import { IElectorate, ICandidate } from "../model/Types";

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
                <h2>{electorate.name}</h2>
                { this.renderCandidates(electorate) }
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
                        <td>Ballot #</td>
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
}
