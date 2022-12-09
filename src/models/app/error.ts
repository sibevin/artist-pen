type ErrorAttr = {
  code?: string;
  message?: string;
  extra?: Record<string, any>;
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AppError extends ErrorAttr {}
export class AppError {
  public constructor(params: ErrorAttr) {
    Object.assign(this, params);
  }
}

type InvalidParamsErrorAttr = ErrorAttr & {
  params: string[];
  reason?: string;
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InvalidParamsError extends InvalidParamsErrorAttr {}
export class InvalidParamsError extends AppError {
  public constructor(params: InvalidParamsErrorAttr) {
    super(params);
    this.code = this.code || "invalid_params";
    this.params = params.params;
  }
}

export class InternalError extends AppError {
  public constructor(params: InvalidParamsErrorAttr) {
    super(params);
    this.code = this.code || "internal";
  }
}
