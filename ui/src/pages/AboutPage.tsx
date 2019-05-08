import React from "react";
import { BasePage } from "./BasePage";
import { electService } from "../model/electService";
import { appService } from "../model/appService";

export class AboutPage extends BasePage {

    public state = { html: "" };

    public componentDidMount() {
        this.load();
        appService.setTitle("About");
    }

    public render() {
        const template = { __html: this.state.html };
        return (
            <>
                <div dangerouslySetInnerHTML={template} />
                <h3>Your Privacy</h3>
                <p>This website doesn't collect or store information about you.
                    It does, however, use Google Analytics to collect anonymous visitor statistics
                    - just like the rest of the internet.</p>
                <h3>Contact</h3>
                <p>If you have any issues, please leave them on the github page.</p>
            </>
        );
    }

    private async load() {
        const res = await fetch("/pages/about.html");
        const html = await res.text();
        this.setState({ html });
    }
}
