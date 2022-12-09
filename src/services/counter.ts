export class Counter {
  private _count: number;
  public increaseA: () => void;
  public decreaseA: () => void;

  constructor(count: number) {
    this._count = count;

    this.increaseA = (): void => {
      this._count++;
    };

    this.decreaseA = (): void => {
      this._count--;
    };
  }

  get count(): number {
    return this._count;
  }

  public initMethods(): void {
    this.increaseA = (): void => {
      this._count++;
    };

    this.decreaseA = (): void => {
      this._count--;
    };
  }

  public increaseB(): void {
    this._count++;
  }

  public decreaseB(): void {
    this._count--;
  }
}
