import * as datefns from "date-fns";

/* tslint:disable:max-classes-per-file */
/* tslint:disable:only-arrow-functions */

export interface IDateUnit {
    names: string[];
    add: (date: Date, amount: number) => Date;
    difference: (a: Date, b: Date) => number;
    startOf: (date: Date) => Date;
    endOf: (date: Date) => Date;
    value: number;
}

export interface ITimeLeft {
    milliseconds: number;
    seconds: number;
    minutes: number;
    hours: number;
    days: number;
    months: number;
    years: number;
}

export const NO_TIME_LEFT: ITimeLeft = {
    milliseconds: 0,
    seconds: 0,
    minutes: 0,
    hours: 0,
    days: 0,
    months: 0,
    years: 0
};

function DateNoOp(date: Date): Date {
    return date;
}

export enum DateValue {
    MILLISECOND = 1,
    SECOND = 1000,
    MINUTE = SECOND * 60,
    HOUR = MINUTE * 60,
    DAY = HOUR * 24,
    WEEK = DAY * 7,
    MONTH = DAY * 30,
    QUARTER = DAY * 91,
    YEAR = DAY * 365
}

export class DateUnit implements IDateUnit {

    public static readonly MILLISECOND = new DateUnit({
        names: ["ms", "milli", "millis", "millisecond", "milliseconds"],
        add: datefns.addMilliseconds,
        difference: datefns.differenceInMilliseconds,
        startOf: DateNoOp,
        endOf: DateNoOp,
        value: DateValue.MILLISECOND
    });

    public static readonly SECOND = new DateUnit({
        names: ["s", "sec", "secs", "second", "seconds"],
        add: datefns.addSeconds,
        difference: datefns.differenceInSeconds,
        startOf: datefns.startOfSecond,
        endOf: datefns.endOfSecond,
        value: DateValue.SECOND
    });

    public static readonly MINUTE = new DateUnit({
        names: ["mi", "min", "mins", "minute", "minutes"],
        add: datefns.addMinutes,
        difference: datefns.differenceInMinutes,
        startOf: datefns.startOfMinute,
        endOf: datefns.endOfMinute,
        value: DateValue.MINUTE
    });

    public static readonly HOUR = new DateUnit({
        names: ["hr", "hrs", "hour", "hours"],
        add: datefns.addHours,
        difference: datefns.differenceInHours,
        startOf: datefns.startOfHour,
        endOf: datefns.endOfHour,
        value: DateValue.HOUR
    });

    public static readonly DAY = new DateUnit({
        names: ["day", "days"],
        add: datefns.addDays,
        difference: datefns.differenceInDays,
        startOf: datefns.startOfDay,
        endOf: datefns.endOfDay,
        value: DateValue.DAY
    });

    public static readonly WEEK = new DateUnit({
        names: ["wk", "wks", "week", "weeks"],
        add: datefns.addWeeks,
        difference: datefns.differenceInWeeks,
        startOf: datefns.startOfWeek,
        endOf: datefns.endOfWeek,
        value: DateValue.WEEK
    });

    public static readonly MONTH = new DateUnit({
        names: ["month", "months"],
        add: datefns.addMonths,
        difference: datefns.differenceInMonths,
        startOf: datefns.startOfMonth,
        endOf: datefns.endOfMonth,
        value: DateValue.MONTH
    });

    public static readonly QUARTER = new DateUnit({
        names: ["qtr", "quarter", "quarters"],
        add: datefns.addQuarters,
        difference: datefns.differenceInQuarters,
        startOf: datefns.startOfQuarter,
        endOf: datefns.endOfQuarter,
        value: DateValue.QUARTER
    });

    public static readonly YEAR = new DateUnit({
        names: ["year", "years"],
        add: datefns.addYears,
        difference: datefns.differenceInYears,
        startOf: datefns.startOfYear,
        endOf: datefns.endOfYear,
        value: DateValue.YEAR
    });

    public static Units = [
        DateUnit.MILLISECOND,
        DateUnit.SECOND,
        DateUnit.MINUTE,
        DateUnit.HOUR,
        DateUnit.DAY,
        DateUnit.WEEK,
        DateUnit.MONTH,
        DateUnit.QUARTER,
        DateUnit.YEAR
    ];

    public names = Array<string>();
    public value: number = 1;

    constructor(values: IDateUnit) {
        for (const key in values) {
            (this as any)[key] = (values as any)[key];
        }
    }

    public add = function(date: Date, amount: number): Date {
        throw new Error("DateUnit.add not implemented");
        return date;
    };

    public difference = function(a: Date, b: Date): number {
        throw new Error("DateUnit.difference not implemented");
        return 0;
    };

    public startOf = function(date: Date): Date {
        throw new Error("DateUnit.startOf not implemented");
        return date;
    };

    public endOf = function(date: Date): Date {
        throw new Error("DateUnit.endOf not implemented");
        return date;
    };
}

export enum DateFormat {
    API = "YYYY-MM-DD",
    FRIENDLY_SHORT = "Do MMM, YYYY"
}

export class DateUtils {

    public static format(date: Date, format: DateFormat|string): string {
        return datefns.format(date, format);
    }

    public static formatRange(range: [Date, Date], format: DateFormat|string, joinStr: string = " - "): string {
        return DateUtils.format(range[0], format) + joinStr + DateUtils.format(range[1], format);
    }

    public static parse(dateStr: string): Date {
        return datefns.parse(dateStr);
    }

    public static isValid(date: Date): boolean {
        return datefns.isValid(date);
    }

    public static isDateString(value: string): boolean {
        return value.match(/^\d{4}\-\d{2}\-\d{2}T{0,1}(\d{2}\:\d{2}\:\d{2}.{0,6}){0,1}$/g) !== null;
    }

    public static add(date: Date, amount: number, unit: DateUnit): Date {
        return unit.add(date, amount);
    }

    public static subtract(date: Date, amount: number, unit: DateUnit): Date {
        return unit.add(date, -amount);
    }

    public static startOf(date: Date, unit: DateUnit): Date {
        return unit.startOf(date);
    }

    public static endOf(date: Date, unit: DateUnit): Date {
        return unit.endOf(date);
    }

    public static difference(a: Date, b: Date, unit: DateUnit): number {
        return unit.difference(a, b);
    }

    public static getTimeLeft(ms:number): ITimeLeft {
        const result = { ...NO_TIME_LEFT };
        if (ms > 0) {
            result.years = Math.floor(ms / DateUnit.YEAR.value);
            ms -= result.years * DateUnit.YEAR.value;
            result.months = Math.floor(ms / DateUnit.MONTH.value);
            ms -= result.months * DateUnit.MONTH.value;
            result.days = Math.floor(ms / DateUnit.DAY.value);
            ms -= result.days * DateUnit.DAY.value;
            result.hours = Math.floor(ms / DateUnit.HOUR.value);
            ms -= result.hours * DateUnit.HOUR.value;
            result.minutes = Math.floor(ms / DateUnit.MINUTE.value);
            ms -= result.minutes * DateUnit.MINUTE.value;
            result.seconds = Math.floor(ms / DateUnit.SECOND.value);
            ms -= result.seconds * DateUnit.SECOND.value;
            result.milliseconds = ms;
        }
        return result;
    }

    public static getTimeLeftDates(start: Date, end: Date): ITimeLeft {
        const result = { ...NO_TIME_LEFT };
        if (end.valueOf() > start.valueOf()) {
            let dec = end;
            result.years = Math.floor(this.difference(dec, start, DateUnit.YEAR));
            dec = this.subtract(dec, result.years, DateUnit.YEAR);
            result.months = Math.floor(this.difference(dec, start, DateUnit.MONTH));
            dec = this.subtract(dec, result.months, DateUnit.MONTH);
            result.days = Math.floor(this.difference(dec, start, DateUnit.DAY));
            dec = this.subtract(dec, result.days, DateUnit.DAY);
            result.hours = Math.floor(this.difference(dec, start, DateUnit.HOUR));
            dec = this.subtract(dec, result.hours, DateUnit.HOUR);
            result.minutes = Math.floor(this.difference(dec, start, DateUnit.MINUTE));
            dec = this.subtract(dec, result.minutes, DateUnit.MINUTE);
            result.seconds = Math.floor(this.difference(dec, start, DateUnit.SECOND));
            dec = this.subtract(dec, result.hours, DateUnit.SECOND);
            result.milliseconds = Math.floor(this.difference(dec, start, DateUnit.MILLISECOND));
        }
        return result;
    }

    public static intervalMs(count: number, unit: DateUnit) {
        return count * unit.value;
    }

    public static max(a: Date, b: Date): Date {
        return a > b ? a : b;
    }

    public static min(a: Date, b: Date): Date {
        return a < b ? a : b;
    }

    public static getUnit(unitName: string): DateUnit|null {
        if (unitName) {
            unitName = unitName.toLowerCase().trim();
            for (const unit of DateUnit.Units) {
                for (const name of unit.names) {
                    if (name === unitName) {
                        return unit;
                    }
                }
            }
        }
        return null;
    }

    public static unitDown(unit: DateUnit): DateUnit|null {
        const index = DateUnit.Units.indexOf(unit) - 1;
        if (index < 0) {
            return null;
        }
        return DateUnit.Units[index];
    }

    public static unitUp(unit: DateUnit): DateUnit|null {
        const index = DateUnit.Units.indexOf(unit) + 1;
        if (index >= DateUnit.Units.length) {
            return null;
        }
        return DateUnit.Units[index];
    }
}