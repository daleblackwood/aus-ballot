import { Subject } from "./Subject";
import { createBrowserHistory } from "history";
import { KeyMap } from "./Types";
import * as history from "history";

export enum ModalName {
    PARTY = "PARTY"
}

export const MODALS: { [key: string]: JSX.Element|null } = {
    [ModalName.PARTY]: null
}

export const APP_TITLE = "Australian Federal Election 2019";
export const APP_SUBTITLE = "Ballot Information";
export const DEFAULT_TITLE = APP_TITLE + " " + APP_SUBTITLE;

class AppService {

    public subRoute = new Subject<string>(window.location.pathname);
    public history = createBrowserHistory();
    public subModal = new Subject<JSX.Element|null>(null);
    public subHashProps = new Subject<KeyMap<string>>({});
    public subTitle = new Subject<string>(DEFAULT_TITLE);

    public get isModalOpen() { 
        const slashes = window.location.pathname.match(/\//g);
        return slashes ? slashes.length > 2 : false;
    }

    public constructor() {
        this.onHashChange = this.onHashChange.bind(this);
        window.addEventListener("hashchange", this.onHashChange);
        this.subHashProps.listen(props => this.onHashProps(props));
        this.subTitle.listen(title => this.onTitle(title));
        this.onHashChange();
        this.onLocation = this.onLocation.bind(this);
        this.history.listen(this.onLocation);
    }

    public navigate(path: string) {
        path = this.resolvePath(path);
        console.log("navigate to " + path);
        this.subRoute.setValue(path);
        this.history.push(path);
    }

    public resolvePath(path: string) {
        path = path.replace(/\\/g, "/");
        // relative
        if (path.indexOf("/") > 0) {
            const toPath = path.split("/");
            const toBit = toPath[0];
            if (toBit) {
                const routeValue = window.location.href;
                const routeBits = routeValue.split("/");
                if (routeBits.length > 0) {
                    for (let i=routeBits.length-1; i>=0; i--) {
                        if (routeBits[i] == toBit) {
                            path = routeBits.splice(0, i - 1).join("/");
                        }
                    }
                }
            }
        }
        return path;
    }

    public getElectorateLink(key?: string) {
        return "/electorate/" + (key || ":electorate").toLowerCase();
    }

    public setTitle(title: string) {
        this.subTitle.setValue(title);
    }

    public openModal(modalName: ModalName) {
        window.location.hash = "modal:" + modalName;
    }

    private onHashChange() {
        let hash = window.location.hash;
        if (hash.indexOf("#") === 0) {
            hash = hash.substr(1);
        }
        const props: KeyMap<string> = {};
        const pairs = hash.split(",");
        let hasKeys = false;
        for (const pair of pairs) {
            const bits = pair.split(":");
            const key = (bits[0] || "").trim();
            if (!key) {
                continue;
            }
            const value = (bits[1] || "").trim();
            props[key] = value;
            hasKeys = true;
        }
        this.subHashProps.setValue(props);
    }

    private onHashProps(props: KeyMap<string>) {
        console.log("hash props", props);
    }

    private onTitle(title: string) {
        document.title = APP_TITLE + ": " + title;
    }

    private onLocation(location: history.Location, action: history.Action) {
        this.subRoute.setValue(location.pathname);
    }
}

export const appService = new AppService();
