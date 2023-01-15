import { DIndex } from "~/models/dwdy/diary";

export type MoveDirection = "prev" | "next" | "current";
export type MoveUnit = "month" | "day";

export function dIndexToDt(dIndex: DIndex): Date {
  return new Date(
    `${dIndex.slice(0, 4)}-${dIndex.slice(4, 6)}-${dIndex.slice(6, 8)}`
  );
}
export function dIndexToDtStr(dIndex: DIndex): string {
  return `${dIndex.slice(0, 4)}.${dIndex.slice(4, 6)}.${dIndex.slice(6, 8)}`;
}
export function dtToDIndex(givenDt: Date): string {
  const mm = String(givenDt.getMonth() + 1).padStart(2, "0");
  const dd = String(givenDt.getDate()).padStart(2, "0");
  return `${givenDt.getFullYear()}${mm}${dd}`;
}
export function getNeighborDt(
  baseDt: Date,
  moveDirection: MoveDirection,
  moveUnit: MoveUnit,
  moveAmount = 1
): Date {
  let newMonth = baseDt.getMonth();
  let newDate = baseDt.getDate();
  if (moveAmount === 0 || moveDirection === "current") {
    if (moveUnit === "month") {
      if (moveDirection === "next") {
        newDate = 0;
        newMonth = baseDt.getMonth() + 1;
      } else {
        newDate = 1;
        newMonth = baseDt.getMonth();
      }
    }
  } else if (moveUnit === "month") {
    if (moveDirection === "next") {
      newDate = 0;
      newMonth = baseDt.getMonth() + moveAmount + 1;
    } else {
      newDate = 1;
      newMonth = baseDt.getMonth() - moveAmount;
    }
  } else if (moveDirection === "next") {
    newDate = baseDt.getDate() + moveAmount;
  } else {
    newDate = baseDt.getDate() - moveAmount;
  }
  return new Date(baseDt.getFullYear(), newMonth, newDate, baseDt.getHours());
}
export function getNeighborDIndex(
  baseDIndex: DIndex,
  moveDirection: MoveDirection,
  moveUnit: MoveUnit,
  moveAmount = 1
): DIndex {
  const baseDt = dIndexToDt(baseDIndex);
  const newDt = getNeighborDt(baseDt, moveDirection, moveUnit, moveAmount);
  return dtToDIndex(newDt);
}
export function isInSameMonth(dt1: Date, dt2: Date): boolean {
  return (
    dt1.getFullYear() === dt2.getFullYear() && dt1.getMonth() === dt2.getMonth()
  );
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

export function isDateDIndex(givenDIndex?: DIndex): boolean {
  if (!givenDIndex) {
    return false;
  }
  return /^\d{8}$/.test(givenDIndex);
}
