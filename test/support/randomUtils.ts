import { faker } from "@faker-js/faker";

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export function uniqueSort<T>(targetArr: T[]): Writeable<T[]> {
  let results = [...new Set(targetArr)];
  results = results.sort(
    (a: T, b: T) => targetArr.indexOf(a) - targetArr.indexOf(b)
  );
  return results;
}

export function randomSample<T>(targetArr: T[], size?: number): Writeable<T[]> {
  let numberToPick = size;
  if (!numberToPick) {
    numberToPick = genRandomIndex(targetArr.length) + 1;
  } else if (numberToPick && numberToPick >= targetArr.length) {
    numberToPick = targetArr.length;
  }
  let i = numberToPick;
  const remainingArr = [...targetArr];
  const sampledArr = [];
  while (i--) {
    const pickedIndex = genRandomIndex(remainingArr.length);
    sampledArr.push(remainingArr[pickedIndex]);
    remainingArr.splice(pickedIndex, 1);
  }
  return sampledArr;
}

export function randomAttrPick<T extends object>(targetObject: T): Partial<T> {
  const pickedAttrs = randomSample<string>(Object.keys(targetObject));
  const pickedObject: Partial<T> = {};
  pickedAttrs.forEach((attr) => {
    pickedObject[attr as keyof T] = targetObject[attr as keyof T];
  });
  return pickedObject;
}

export function randomPick<T>(targetArr: T[]): T {
  const pickedIndex = genRandomIndex(targetArr.length);
  return targetArr[pickedIndex];
}

export function genRandomIndex(len: number): number {
  return Math.floor(Math.random() * len);
}

export function genRandomSize<T>(
  generator: (index: number) => T,
  maxSize = 5
): T[] {
  const size = genRandomIndex(maxSize) + 1;
  return [...Array(size).keys()].map((index) => {
    return generator(index);
  });
}

export function genRandomBlobs(): Blob[] {
  return genRandomSize<Blob>(() => {
    return new Blob([faker.datatype.string()], { type: "text/plain" });
  });
}
