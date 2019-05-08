import React from "react";
import { Router, Route, Switch } from "react-router";

import "./styles/App.css";

import { Header } from "./chrome/Header";
import { appService } from "./model/appService";
import { ElectoratesPage } from "./pages/ElectoratesPage";
import { electService } from "./model/electService";
import { PopupModal } from "./comps/PopupModal";
import { BrowserRouter } from "react-g-analytics";

interface IAppState {
    isLoaded: boolean;
}

const GA_ID = 'UA-139639011-1';

export class App extends React.Component<{}, IAppState> {

    public state: IAppState = { isLoaded: false };

    public componentWillMount() {
        electService.subElectorates.listen(electorates => { 
            this.setState({ isLoaded: electorates.length > 0 });
        });
    }

    public render() {
        let page: JSX.Element|null = null

        if (this.state.isLoaded) {
            page = this.renderPage();
        }
        else {
            page = this.renderLoader();
        }

        return (
            <div className="app">
                <Header />
                <div className="page">
                    { page }
                </div>
            </div>
        );
    }

    private renderPage() {
        return (
            <>
                <BrowserRouter id={GA_ID} history={appService.history}>
                    <Route path="/" component={ElectoratesPage} />
                    <PopupModal />
                </BrowserRouter>
            </>
        );
    }

    private renderLoader() {
        return (
            <div className="panel left">
                <h3>Loading...</h3>
            </div>
        );
    }

}
