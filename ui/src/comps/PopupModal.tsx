import React from "react";

import { BaseComp } from "./BaseComp";
import { appService } from "../model/appService";
import { Modal } from "semantic-ui-react";
import { Switch, Route } from "react-router";
import { PartyPage } from "../pages/PartyPage";
import * as history from "history";
import { KeyMap } from "../model/Types";
import { AboutPage } from "../pages/AboutPage";

interface IPopupState {
    route: string;
    hashProps: KeyMap<string>;
    title: string;
}

export class PopupModal extends BaseComp {

    public state: IPopupState = { route: appService.subRoute.value, hashProps: appService.subHashProps.value, title: document.title };

    public componentDidMount() {
        appService.subRoute.listen(route => this.setState({ ...this.state, route }));
        appService.subHashProps.listen(hashProps => this.setState({ ...this.state, hashProps }));
        appService.subTitle.listen(title => this.setState({ ...this.state, title }));
    }
    
    public render() {
        const onClose = this.onClose.bind(this);
        const body = this.renderBody();
        const isOpen = Object.keys(this.state.hashProps).length > 0;
        return (
            <Modal className="popup-modal" open={isOpen} centered={false} onClose={onClose}>
                <Modal.Header>
                    { this.renderTitle() }
                    <button className="close" onClick={onClose} />
                </Modal.Header>
                <Modal.Content>
                    { body }
                </Modal.Content>
            </Modal>
        );
    }

    protected renderTitle() {
        return appService.subTitle.value;
    }

    protected renderBody() {
        const hashProps = this.state.hashProps;
        if (hashProps.party) {
            return <PartyPage party={ hashProps.party }/>;
        }
        switch(hashProps.page) {
            case "about":
                return <AboutPage />;
        }
        return null;
    }

    protected onClose() {
        window.location.hash = "";
    }

}
