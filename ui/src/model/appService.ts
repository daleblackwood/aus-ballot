import { Subject } from "./Subject";
import { createBrowserHistory } from "history";

class AppService {

    public subRoute = new Subject<string>("/");
    public history = createBrowserHistory();

    public navigate(path: string) {
        this.subRoute.setValue(path);
    }

    public getElectorateLink(key?: string) {
        return "/electorate/" + (key || ":electorate");
    }
}

export const appService = new AppService();
