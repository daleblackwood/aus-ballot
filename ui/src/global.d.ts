declare module "react-g-analytics" {
    import { BrowserRouter as ReactBrowserRouter, BrowserRouterProps } from "react-router-dom";

    export interface IGABrowserRouterProps extends BrowserRouterProps {
        id: string;
        history: any;
    }

    export class BrowserRouter extends React.Component<IGABrowserRouterProps, any> {}
}
