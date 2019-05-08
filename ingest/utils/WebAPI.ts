import * as process from "process";
import * as request from "request";
import { JSDOM } from "jsdom";

export class WebAPI {

    public static async getLuckyUrl(term: string, site?: string) {
        let query = term.trim().replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s/g, "+");
        query = encodeURI(query);
        if (site) {
            query = "site:" + site + " " + query;
        }
        const url = "http://www.google.com/search?q=" + query + "&btnI";
        const res = await new Promise<request.Response>(resolve => {
            request.get(url, { followRedirect: false }, (err, res) => resolve(res));
        });
        const result = res.headers.location;
        console.log("got lucky: " + term + " => " + result);
        return result;
    }

    public static async loadPage(url: string) {
        const res = await new Promise<request.Response>((resolve, reject) => {
            request.get(url, (err, res) => err ? reject(err) : resolve(res));
        });
        let page = res.body as string;
        return page;
    }

    public static async scrapePage(url: string, requiredTerms: string[] = []) {
        let page = await this.loadPage(url);
        page = page.replace(/\s\s/g, " ");
        page = page.replace(/\s/g, " ");

        if (this.hasARequiredTerm(page, requiredTerms) === false) {
            return undefined;
        }

        // get paragraphs
        let text = "";
        const ps = page.match(/(\<[pP]\>).*(\<\/[pP]\>)/g);
        if (!ps) {
            return undefined;
        }
        for (const p of ps) {
            text += p + "\n\n";
        }

        // remove tags
        text = this.stripTags(text);
        return text;
    }

    public static hasARequiredTerm(page: string, requiredTerms: string[] = []):boolean {
        if (requiredTerms.length < 1) {
            return true;
        }
        const lowerPage = page.toLowerCase();
        for (const term of requiredTerms) {
            const rt = term.toLowerCase();
            if (lowerPage.indexOf(rt) >= 0) {
                return true;
            }
        }
        return false;
    }

    public static stripTags(text: string) {
        text = text.replace(/\<[^\>]*\>/g, "").trim();
        return text;
    }

    public static async scrapePageSummary(url: string, requiredTerms: string[] = []) {
        const inText = await this.scrapePage(url, requiredTerms);
        if (! inText) {
            return undefined;
        }
        const ps = inText.split(".");
        let outText = "";
        for (const p of ps) {
            outText += p + ".";
            if (outText.length > 500) {
                outText += "..";
                break;
            }
        }
        console.log(url + " found");
        return outText;
    }

    public static getDomain(url:string) {
        let hostname = undefined;

        if (url) {
            if (url.indexOf("//") > -1) {
                hostname = url.split('/')[2];
            }
            else {
                hostname = url.split('/')[0];
            }

            hostname = hostname.split(':')[0];
            hostname = hostname.split('?')[0];
        }

        return hostname;
    }

    public static getElement(html: string, tagMatch: string) {
        const startI = html.indexOf(tagMatch);
        if (startI < 0) {
            return undefined;
        }
    }

    public static async readWikipediaSummary(url: string, requiredTerms: string[] = []): Promise<string | undefined> {
        const html = await this.loadPage(url);
        if (this.hasARequiredTerm(html, requiredTerms) === false) {
            return undefined;
        }

        const dom = new JSDOM(html);
        const content = dom.window.document.querySelector("div.mw-parser-output");
        if (! content || content.childNodes.length < 1) {
            return undefined;
        }

        let text = "";

        const children: ChildNode[] = [];
        content.childNodes.forEach(child => children.push(child));

        for (const child of children) {
            if (child.nodeName === "P") {
                text += child.textContent.trim() + "\n\n";
            }
            if (child["class"] === "toc") {
                break;
            }
            if (text.length > 500) {
                text += "...";
                break;
            }
        }

        return text;
    }

    public static async readPageSummary(url: string, requiredTerms: string[] = []): Promise<string | undefined> {
        const html = await this.loadPage(url);
        if (this.hasARequiredTerm(html, requiredTerms) === false) {
            return undefined;
        }

        const dom = new JSDOM(html);
        const content = dom.window.document.querySelectorAll("p, span");
        let text = "";

        const children: ChildNode[] = [];
        content.forEach(child => children.push(child));

        for (const child of children) {
            const textContent = child.textContent;
            if (textContent.length > 50) {
                text += textContent + "\n\n";
            }
            if (text.length > 500) {
                text += "...";
                break;
            }
        }

        return text.trim();
    }

}
