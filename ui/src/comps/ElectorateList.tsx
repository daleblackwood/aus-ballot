import React from "react";
import { List, Input } from "semantic-ui-react";
import { Link } from "react-router-dom";

import { IElectorate } from "../model/Types";
import { BaseComp } from "./BaseComp";
import { electService } from "../model/electService";
import { appService } from "../model/appService";

interface IElectorateListState {
    electorates: IElectorate[];
    search: string;
}

export class ElectorateList extends BaseComp<{}, IElectorateListState> {

    public state: IElectorateListState = { electorates: [], search: "" };

    componentDidMount() {
        this.handleInput = this.handleInput.bind(this);
        this.listen(electService.subElectorates, electorates => this.setState({ ...this.state, electorates }));
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
        
        return (
            <>
                <Input icon="search" placeholder="Search..." onChange={this.handleInput} />
                <List divided relaxed>
                    { items }
                </List>
            </>
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
        return (
            <List.Item key={electorate.key} className="electorate-item" >
                <List.Icon>
                    <div className="electorate-icon">
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
