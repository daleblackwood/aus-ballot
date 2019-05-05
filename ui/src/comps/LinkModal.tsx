import React from "react";

import { BaseComp } from "./BaseComp";
import { Modal } from "semantic-ui-react";
import { appService } from "../model/appService";
import { IModalLink } from "../model/Types";

interface ILinkModalState {
    modal: IModalLink|null;
}

export class LinkModal extends BaseComp<{}, ILinkModalState> {

    public state: ILinkModalState = { modal: null };
    private iframe = React.createRef<HTMLIFrameElement>();
    private monitorTimer: any;

    public componentDidMount() {
        this.monitor = this.monitor.bind(this);
        this.listen(appService.subModal, modal => this.setState({ modal }));
        //this.monitorTimer = setInterval(this.monitor, 100);
    }

    public componentWillUnmount() {
        super.componentWillUnmount();
        clearInterval(this.monitorTimer);
    }

    public render() {
        const src = this.state.modal ? this.state.modal.src : "";
        const title = this.state.modal ? this.state.modal.title : "";
        const isOpen = Boolean(src);
        const onClose = () => {
            appService.subModal.setValue(null);
        };
        return (
            <Modal className="link-modal" open={isOpen} centered={false} onClose={onClose}>
                <Modal.Header>{title}</Modal.Header>
                <Modal.Content>
                    <iframe 
                        ref={this.iframe} 
                        src={src} 
                        width="100%" 
                        height="100%" 
                        allow-top-navigation="true"
                    />
                </Modal.Content>
            </Modal>
        );

    }

    private monitor() {
        if (!this.iframe.current) {
            return;
        }

        const iframe = this.iframe.current;
        (window as any).iframe = iframe;
        if (iframe.src.indexOf("en.wikipedia.org") >= 0) {
            iframe.src = iframe.src.replace("en.wikipedia.org", "em.m.wikipedia.org");
            console.log("redirect " + iframe.src);
        }
    }

}
