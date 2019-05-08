import React from "react";
import { BasePage } from "./BasePage";
import { electService } from "../model/electService";
import { IParty, IPartyDetails } from "../model/Types";
import { appService } from "../model/appService";
import { Segment, Grid, Divider } from "semantic-ui-react";

interface IPartyPageProps {
    party?: string;
}

interface IPartyPageState {
    partyDetails: IPartyDetails|null;
}

export class PartyPage extends BasePage<IPartyPageProps, IPartyPageState> {

    public state: IPartyPageState = { partyDetails: null }

    public render() {
        const party = electService.getParty(this.props.party);
        if (!party) {
            return (
                <div>Please select an party.</div>
            );
        }
        appService.setTitle("Party: " + party.name);
        
        return (
            <div className="party">
                { this.renderPartyDetails(party) }
            </div>
        )
    }

    private renderParty(party: IParty) {
        return (
            <div className="party head">
                <div>Name: { party.name } ({ party.abbrev })</div>
            </div>
        );
    }

    private renderPartyDetails(party: IParty) {
        const details = party.details || this.state.partyDetails;
        if (!details) {
            this.loadPartyDetails(party);
            return;
        }

        const elems: JSX.Element[] = [];

        if (details.websitePreview) {
            elems.push(
                <div className="web" key="web">
                    <h3>From the { party.name } website</h3>
                    <p>{ details.websitePreview || "Content wasn't able to be read." }</p>
                    <p><a href={details.website} target="_blank">(more on {details.website})</a></p>
                </div>
            );
            elems.push(<br key="hr1" />);
        } else if (details.website) {
            elems.push(
                <div className="web" key="web">
                    <h3>Website</h3>
                    <p><a href={details.website} target="_blank">{details.website}</a></p>
                </div>
            );
            elems.push(<br key="hr1" />);
        }
        elems.push(
            <div className="wiki" key="wiki">
                <h3>From Wikipedia</h3>
                <p>{ details.wikipediaPreview || "Wikipedia article wasn't found."  }</p>
                <p><a href={details.wikipedia} target="_blank">(more on Wikipedia)</a></p>
            </div>
        );

        return elems;
    }

    private async loadPartyDetails(party: IParty) {
        const partyDetails = await electService.loadPartyDetails(party.key);
        this.setState({ ...this.state, partyDetails });
    }

}
