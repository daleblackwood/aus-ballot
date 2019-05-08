import React from "react";

export class Header extends React.Component {

    public render() {
        return (
            <div className="header">
                <img src="/logo.png" className="logo" alt="AusBallot" title="AusBallot"/>
                <h1>2019 Australian Election Ballot Information</h1>
                <div className="buttons">
                    <a href="#page:about">?</a>
                </div>
            </div>
        );
    }

}
