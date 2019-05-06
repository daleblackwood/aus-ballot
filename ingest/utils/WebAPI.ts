import * as process from "process";
import * as request from "request";

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

        // check required terms
        if (requiredTerms.length > 0) {
            let found = false;
            const lowerPage = page.toLowerCase();
            for (const term of requiredTerms) {
                const rt = term.toLowerCase();
                if (lowerPage.indexOf(rt) >= 0) {
                    found = true;
                    break;
                }
            }
            if (found === false) {
                return undefined;
            }
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

}
