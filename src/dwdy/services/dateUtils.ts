import { MoveDirection, MoveDateUnit, MoveAlignment } from "~/dwdy/types/core";

export type GetNeighborOption = {
  direction?: MoveDirection;
  unit?: MoveDateUnit;
  step?: number;
  alignment?: MoveAlignment;
};

const ONE_DAY_MS = 86400000;

function getAlignedDt(
  baseDt: Date,
  alignment: MoveAlignment,
  unit: MoveDateUnit
): Date {
  if (unit === "month") {
    if (alignment === "begin") {
      return new Date(baseDt.getFullYear(), baseDt.getMonth(), 1);
    } else if (alignment === "end") {
      return new Date(
        baseDt.getFullYear(),
        baseDt.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );
    }
  } else {
    if (alignment === "begin") {
      return new Date(
        baseDt.getFullYear(),
        baseDt.getMonth(),
        baseDt.getDate()
      );
    } else if (alignment === "end") {
      return new Date(
        baseDt.getFullYear(),
        baseDt.getMonth(),
        baseDt.getDate(),
        23,
        59,
        59,
        999
      );
    }
  }
  return baseDt;
}

export function getNeighborDt(
  baseDt: Date,
  options: GetNeighborOption = {}
): Date {
  const opts = Object.assign(
    {
      direction: "next",
      unit: "day",
      step: 1,
      alignment: "none",
    },
    options
  );

  if (opts.direction === "current" && opts.alignment === "none") {
    return baseDt;
  }
  let newMonth = baseDt.getMonth();
  let newDate = baseDt.getDate();
  if (opts.unit === "day") {
    if (opts.direction === "next") {
      newDate = baseDt.getDate() + opts.step;
    } else if (opts.direction === "prev") {
      newDate = baseDt.getDate() - opts.step;
    }
  } else if (opts.unit === "month") {
    if (opts.direction === "next") {
      newMonth = baseDt.getMonth() + opts.step;
    } else if (opts.direction === "prev") {
      newMonth = baseDt.getMonth() - opts.step;
    }
    const calculatedDt = new Date(baseDt.getFullYear(), newMonth, newDate);
    if (calculatedDt.getMonth() === newMonth + 1) {
      newMonth = newMonth + 1;
      newDate = 0;
    } else if (calculatedDt.getMonth() === newMonth - 1) {
      newDate = 1;
    }
  }
  const resultDt = new Date(baseDt);
  resultDt.setMonth(newMonth);
  resultDt.setDate(newDate);
  return getAlignedDt(resultDt, opts.alignment, opts.unit);
}

export function getNeighborTs(
  timestamp: number,
  options: GetNeighborOption = {}
): number {
  const baseDt = entryTsToDt(timestamp);
  return dtToEntryTs(getNeighborDt(baseDt, options));
}

export function getNeighborDs(
  ds: string,
  options: GetNeighborOption = {}
): string {
  const baseDt = dsToDt(ds);
  return dtToDs(getNeighborDt(baseDt, options));
}

export function isSameDt(
  dt1: Date,
  dt2: Date,
  range: "day" | "month" | "year" = "day"
): boolean {
  if (range === "year" || dt1.getFullYear() !== dt2.getFullYear()) {
    return dt1.getFullYear() === dt2.getFullYear();
  }
  if (range === "month" || dt1.getMonth() !== dt2.getMonth()) {
    return dt1.getMonth() === dt2.getMonth();
  }
  return dt1.getDate() === dt2.getDate();
}

export function isToday(givenDt: Date): boolean {
  return isSameDt(givenDt, new Date());
}

export function getBeginningOfDayTs(ts: number): number {
  return ts - (ts % ONE_DAY_MS);
}

export function dtToEntryTs(givenDt: Date): number {
  return Date.UTC(givenDt.getFullYear(), givenDt.getMonth(), givenDt.getDate());
}

export function entryTsToDt(ts: number): Date {
  const tsDt = new Date(ts);
  return new Date(tsDt.getUTCFullYear(), tsDt.getUTCMonth(), tsDt.getUTCDate());
}

export function dtToDs(givenDt: Date): string {
  const dtY = new Intl.DateTimeFormat("en", { year: "numeric" }).format(
    givenDt
  );
  const dtM = new Intl.DateTimeFormat("en", { month: "2-digit" }).format(
    givenDt
  );
  const dtD = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(givenDt);
  return `${dtY}-${dtM}-${dtD}`;
}

export function dsToDt(dateStr: string): Date {
  const [year, month, date] = dateStr.split("-");
  return new Date(Number(year), Number(month) - 1, Number(date));
}

export function getWeekOfYear(givenDt: Date): number {
  const yFirstDt = new Date(givenDt.getFullYear(), 0, 1);
  return Math.ceil(
    ((givenDt.getTime() - yFirstDt.getTime()) / 86400000 +
      yFirstDt.getDay() +
      1) /
      7
  );
}

export function getWeekOfYearFirstDt(baseDt: Date, week: number): Date {
  const yFirstDt = new Date(baseDt.getFullYear(), 0, 1);
  const days = (week - 1) * 7 - yFirstDt.getDay() + 1;
  return new Date(baseDt.getFullYear(), 0, days);
}

export function isWeekOfYearFirstDt(givenDt: Date): boolean {
  const yFirstDt = new Date(givenDt.getFullYear(), 0, 1);
  return (
    ((givenDt.getTime() - yFirstDt.getTime()) / 86400000 +
      yFirstDt.getDay() +
      1) %
      7 ===
    1
  );
}

export function getQuarter(givenDt: Date): number {
  return Math.floor((givenDt.getMonth() + 1) / 4) + 1;
}

export function getQuarterFirstDt(baseDt: Date, quarter: number): Date {
  const month = (quarter - 1) * 3;
  return new Date(baseDt.getFullYear(), Number(month), 1);
}

export function getHalfYear(givenDt: Date): number {
  return Math.floor((givenDt.getMonth() + 1) / 6) + 1;
}

export function getHalfYearFirstDt(baseDt: Date, halfYear: number): Date {
  const month = (halfYear - 1) * 6;
  return new Date(baseDt.getFullYear(), Number(month), 1);
}
