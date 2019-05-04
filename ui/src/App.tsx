import React from "react";
import { Router, Route } from "react-router";

import "./styles/App.css";

import { Header } from "./chrome/Header";
import { HomePage } from "./pages/HomePage";
import { appService } from "./model/appService";
import { ElectoratesPage } from "./pages/ElectoratesPage";

export class App extends React.Component {

    public render() {
        return (
            <div className="app">
                <Header />
                <div className="page">
                    <Router history={appService.history}>
                        <Route path="/" component={ElectoratesPage} />
                    </Router>
                </div>
            </div>
        );
    }

}
