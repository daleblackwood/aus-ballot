import { Subject } from "./Subject";
import { createBrowserHistory } from "history";
import { IModalLink } from "./Types";

class AppService {

    public subRoute = new Subject<string>("/");
    public history = createBrowserHistory();
    public subModal = new Subject<IModalLink|null>(null);

    public navigate(path: string) {
        this.subRoute.setValue(path);
    }

    public getElectorateLink(key?: string) {
        return "/electorate/" + (key || ":electorate").toLowerCase();
    }

    public openModal(title: string, src: string) {
        this.subModal.setValue({
            title,
            src
        });
    }
}

export const appService = new AppService();
