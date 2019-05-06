import React from "react";
import { ElectorateList } from "../comps/ElectorateList";
import { Route, Router, Switch, RouteComponentProps } from "react-router";
import { BasePage } from "./BasePage";
import { ElectoratePage } from "./ElectoratePage";
import { appService } from "../model/appService";

export class ElectoratesPage extends BasePage {

    private electorateKey: string = "";
    private electorateElem: JSX.Element|null = null;

    public render() {
        const renderElectorate = (props?: RouteComponentProps) => {
            if (props) {
                const electorateKey = (props.match.params as any).electorate;
                if (electorateKey !== this.electorateKey) {
                    this.electorateElem = <ElectoratePage electorate={electorateKey} />;
                    this.electorateKey = electorateKey;
                }
            }
            return this.electorateElem;
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
                        <Route render={renderElectorate} />
                    </Switch>
                </div>
            </>
        );
    }

}
