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
            <div dangerouslySetInnerHTML={template} />
        );
    }

    private async load() {
        const res = await fetch("/pages/about.html");
        const html = await res.text();
        this.setState({ html });
    }
}
