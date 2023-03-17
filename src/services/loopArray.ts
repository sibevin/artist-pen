export function nextEntry<T>(arr: readonly T[], currentEntry?: T): T {
  if (!currentEntry) {
    return arr[0];
  }
  const foundIndex = arr.indexOf(currentEntry);
  if (foundIndex < 0 || foundIndex === arr.length - 1) {
    return arr[0];
  } else {
    return arr[foundIndex + 1];
  }
}

export function prevEntry<T>(arr: readonly T[], currentEntry?: T): T {
  if (!currentEntry) {
    return arr[arr.length - 1];
  }
  const foundIndex = arr.indexOf(currentEntry);
  if (foundIndex <= 0) {
    return arr[arr.length - 1];
  } else {
    return arr[foundIndex - 1];
  }
}
