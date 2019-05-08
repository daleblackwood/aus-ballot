import React, { CSSProperties } from "react";
import { List, Input } from "semantic-ui-react";
import { Link } from "react-router-dom";

import { IElectorate } from "../model/Types";
import { BaseComp } from "./BaseComp";
import { electService } from "../model/electService";
import { appService } from "../model/appService";

interface IElectorateListState {
    electorates: IElectorate[];
    search: string;
    focused: boolean;
}

export class ElectorateList extends BaseComp<{}, IElectorateListState> {

    public state: IElectorateListState = { electorates: [], search: "", focused: false };

    componentDidMount() {
        this.handleInput = this.handleInput.bind(this);
        this.listen(electService.subElectorates, electorates => this.setState({ ...this.state, electorates }));
        this.listen(electService.subElectorateKey, key => {
            const electorate = electService.getElectorate(key);
            if (electorate) {
                this.setState({ ...this.state, search: electorate.name, focused: false });
            };
        });
    }

    public render() {
        const items: JSX.Element[] = [];

        let electorates = this.state.electorates;

        if (this.state.search) {
            electorates = electorates.filter(e => e.name.toLowerCase().indexOf(this.state.search.toLowerCase()) >= 0);
        }

        for (const electorate of electorates) {
            items.push(this.renderElectorate(electorate));
        }

        let showList = Boolean(this.state.search);
        if (this.state.focused) {
            showList = true;
        }
        const searchClass = "search-area " + (showList ? "searching" : "");

        const inputFocus = () => this.setState({ ...this.state, focused: true });

        const iconClick = () => {
            if (this.state.search) {
                this.setState({ ...this.state, search: "" });
            }
            appService.navigate("/");
        };

        const iconType = this.state.search ? "close" : "search";
        
        return (
            <div className={searchClass}>
                <div className="ui icon input">
                    <input placeholder="Find Electorate..." 
                        type="text"
                        value={this.state.search}
                        onChange={this.handleInput}
                        onFocus={inputFocus}
                    />
                    <i className={iconType + " icon"} 
                        onClick={iconClick} 
                        style={{pointerEvents: "auto"}}
                    />
                </div>
                <List divided relaxed className="search-list">
                    { items }
                </List>
            </div>
        );
    }

    private handleInput(e: any) {
        this.setState({
            ...this.state,
            search: e.target.value
        });
    }

    private renderElectorate(electorate: IElectorate) {
        const url = appService.getElectorateLink(electorate.key);
        const iconStyle: React.CSSProperties = {};
        if (electorate.details) {
            let party = electService.getParty(electorate.details.partyKey);
            if (! party && electorate.results) {
                const result = electorate.results.slice().sort((a, b) => {
                    return a.votes > b.votes ? -1 : 1;
                })[0];
                if (result) {
                    party = electService.getParty(result.party);
                }
            }
            if (party) {
                iconStyle.backgroundColor = party.color;
            }
        }

        return (
            <List.Item key={electorate.key} className="electorate-item" >
                <List.Icon>
                    <div className="electorate-icon" style={iconStyle}>
                        <Link to={url}>{ electorate.abbrev }</Link>
                    </div>
                </List.Icon>
                <List.Content>
                    <Link to={url}>
                        <List.Header>
                            { electorate.name }
                        </List.Header>
                        <List.Description>
                            { electorate.state }
                        </List.Description>
                    </Link>
                </List.Content>
            </List.Item>
        );
    }

}
