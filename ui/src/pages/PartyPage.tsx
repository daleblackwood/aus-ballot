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
                { this.renderParty(party) }
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

        return (
            <Segment placeholder>
                <Grid columns={2} relaxed='very' stackable>
                    <Grid.Column>
                        <p><strong><a href={details.website} target="_blank">Website</a></strong></p>
                        <p>{ details.websitePreview || "Content wasn't able to be read." }</p>
                        <p><a href={details.website} target="_blank">[more]</a></p>
                    </Grid.Column>

                    <Grid.Column>
                        <p><strong><a href={details.wikipedia} target="_blank">Wikipedia</a></strong></p>
                        <p>{ details.wikipediaPreview || "Content wasn't able to be read."  }</p>
                        <p><a href={details.wikipediaPreview} target="_blank">[more]</a></p>
                    </Grid.Column>
                </Grid>

                <Divider vertical />
            </Segment>
        );
    }

    private async loadPartyDetails(party: IParty) {
        const partyDetails = await electService.loadPartyDetails(party.key);
        this.setState({ ...this.state, partyDetails });
    }

}
