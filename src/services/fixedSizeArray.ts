export function pushEntry<T>(arr: T[], entry: T, size?: number): T[] {
  const newArr: T[] = JSON.parse(JSON.stringify(arr)) as T[];
  const givenSize = size || arr.length;
  newArr.push(entry);
  if (newArr.length > givenSize) {
    newArr.splice(0, newArr.length - givenSize);
  }
  return newArr;
}

export function unshiftEntry<T>(arr: T[], entry: T, size?: number): T[] {
  const newArr: T[] = JSON.parse(JSON.stringify(arr)) as T[];
  const givenSize = size || arr.length;
  newArr.unshift(entry);
  if (newArr.length > givenSize) {
    newArr.splice(givenSize, newArr.length - givenSize);
  }
  return newArr;
}
