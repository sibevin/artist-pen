export class ArrayPaginator<T> {
  _array: readonly T[];
  _pageSize: number;
  _page: number;
  _totalPages: number;

  constructor(array: readonly T[], pageSize: number) {
    this._array = array;
    this._pageSize = pageSize;
    this._page = 1;
    this._totalPages = Math.ceil(this._array.length / this._pageSize);
  }

  get totalPages(): number {
    return this._totalPages;
  }

  get page(): number {
    return this._page;
  }

  set page(givenPage: number) {
    if (givenPage >= 1 && givenPage <= this._totalPages) {
      this._page = givenPage;
    }
  }

  currentEntries(): T[] {
    return this._array.slice(
      (this._page - 1) * this._pageSize,
      this._page * this._pageSize
    );
  }

  next(): T[] {
    if (this._page < this._totalPages) {
      this._page++;
      return this.currentEntries();
    } else {
      return [];
    }
  }

  prev(): T[] {
    if (this._page > 1) {
      this._page--;
      return this.currentEntries();
    } else {
      return [];
    }
  }
}
