export type Icon = {
  set: string;
  path: string;
};

export type SelectionOption = {
  label: string;
  labelShort?: string;
  value: string;
  icon?: Icon;
};
