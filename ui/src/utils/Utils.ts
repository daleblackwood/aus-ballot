export class Utils {

    public static toKey(value: string) {
        return (value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    }

    public static makeAbbrev(value: string, maxLength: number = 4) {
        let result = "";
        const words = value.split(" ");
        if (words.length > 1) {
            for (const word of words) {
                result += this.toKey(word).charAt(0);
            }
        }
        else {
            result = this.toKey(value).substr(0, 3);
        }

        if (result.length > maxLength) {
            result = result.substr(0, maxLength);
        }

        return result;
    }

    public static  wordMatch(search: string, phrase: string) {
        search = this.toKey(search);
        const words = phrase.split(" ");
        for (const word of words) {
            if (this.toKey(word) === search) {
                return true;
            }
        }
        return false;
    }

}
