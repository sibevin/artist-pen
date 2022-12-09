export interface Icon {
  set: string;
  path: string;
}

export interface SelectionOption {
  label: string;
  value: string;
  icon?: Icon;
}
