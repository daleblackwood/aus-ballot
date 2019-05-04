import React from "react";
import { Router, Route, Switch } from "react-router";
import "./styles/App.css";
import { Header } from "./chrome/Header";

export class App extends React.Component {

    public render() {
        return (
            <div className="app">
                <Header />
                <div className="page">
                    <Router>
                        <Route path="/" comp={HomePage} />
                    </Router>
                </div>
            </div>
        );
    }

}
