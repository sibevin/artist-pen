import { genUid } from "~/services/db";

export type FileSizeDisplay = {
  unit: "gb" | "mb" | "kb";
  amount: string;
};

const GB_SIZE = 1024 * 1024 * 1024;
const MB_SIZE = 1024 * 1024;
const KB_SIZE = 1024;

export function displayFileSize(fileSize: number): FileSizeDisplay {
  if (fileSize > GB_SIZE) {
    return {
      unit: "gb",
      amount: (fileSize / GB_SIZE).toFixed(2),
    };
  }
  if (fileSize > MB_SIZE) {
    return {
      unit: "mb",
      amount: (fileSize / MB_SIZE).toFixed(2),
    };
  }
  return { unit: "kb", amount: (fileSize / KB_SIZE).toFixed(2) };
}

export type FileNameDisplay = {
  base: string;
  ext?: string;
};

export function displayFileName(fileName: string): FileNameDisplay {
  const fileNameArr = fileName.split(".");
  const [rest, ext] = [fileNameArr.slice(0, -1), fileNameArr.at(-1)];
  return { base: rest.join("."), ext };
}

export function getStringBytes(value: string): number {
  return new TextEncoder().encode(value).length;
}

export function genRandomFileName(ext?: string): string {
  const extStr = ext ? `.${ext}` : "";
  return `${genUid()}${extStr}`;
}
