import React from "react";
import { Router, Route } from "react-router";

import "./styles/App.css";

import { Header } from "./chrome/Header";
import { HomePage } from "./pages/HomePage";
import { appService } from "./model/appService";
import { ElectoratesPage } from "./pages/ElectoratesPage";
import { electService } from "./model/electService";
import { LinkModal } from "./comps/LinkModal";

interface IAppState {
    isLoaded: boolean;
}

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
                <Router history={appService.history}>
                    <Route path="/" component={ElectoratesPage} />
                </Router>
                <LinkModal />
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
