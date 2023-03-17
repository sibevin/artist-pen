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
