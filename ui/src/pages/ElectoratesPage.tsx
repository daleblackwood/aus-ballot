import React from "react";
import { ElectorateList } from "../comps/ElectorateList";
import { Route, Router, Switch, RouteComponentProps } from "react-router";
import { BasePage } from "./BasePage";
import { ElectoratePage } from "./ElectoratePage";
import { appService } from "../model/appService";

export class ElectoratesPage extends BasePage {

    public render() {
        const renderElectorate = (props: RouteComponentProps) => {
            const electorate: string = (props.match.params as any).electorate;
            return <ElectoratePage electorate={electorate} />
        };

        return (
            <>
                <div className="panel left">
                    <ElectorateList />
                </div>
                <div className="panel right">
                    <Switch>
                        <Route 
                            path={appService.getElectorateLink()} 
                            render={renderElectorate}
                        />
                        <Route component={ElectoratePage} />
                    </Switch>
                </div>
            </>
        );
    }

}
