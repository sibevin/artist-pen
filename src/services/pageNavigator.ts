export type NavPoint = [number, number];
export type NavCellID = string;

export interface NavCell {
  name: NavCellID;
  start: NavPoint;
  end?: NavPoint;
}
interface NavStoredCell extends NavCell {
  end: NavPoint;
}

type NavCallback = () => void;
type NavCellCallbackMap = Record<NavCellID, NavCellCallback | undefined>;
interface NavCellCallback {
  trigger?: NavCallback;
  after?: NavCallback;
}
export interface NavCellSpec {
  cell: NavCell;
  callback?: NavCellCallback;
}

interface NavMoveOption {
  triggerAfterMoving?: boolean;
}

const X_VAL = 0;
const Y_VAL = 1;

class NavBoard {
  private currentCell?: NavStoredCell;
  private cellMap: Record<NavCellID, NavStoredCell>;
  private firstCell?: NavStoredCell;

  constructor(navCells: NavCell[] = []) {
    this.cellMap = {};
    navCells.forEach((cell) => {
      this.cellMap[cell.name] = {
        name: cell.name,
        start: cell.start,
        end: cell.end || [cell.start[X_VAL] + 1, cell.start[Y_VAL] + 1],
      };
    });
    this.firstCell = Object.values(this.cellMap)[0];
    this.resetFirst();
  }

  public resetFirst(cellId?: NavCellID): void {
    if (cellId) {
      const cell = this.cellMap[cellId];
      if (cell) {
        this.firstCell = cell;
      }
    } else {
      this.firstCell = Object.values(this.cellMap)[0];
    }
  }

  public resetCurrent(cellId?: NavCellID): void {
    if (cellId) {
      const cell = this.cellMap[cellId];
      if (cell) {
        this.currentCell = cell;
      }
    } else {
      this.currentCell = undefined;
    }
  }

  public get currentCellId(): NavCellID | undefined {
    if (this.currentCell) {
      return this.currentCell.name;
    }
    return undefined;
  }

  private isSortTargets(cell: NavStoredCell, axis: number): boolean {
    if (this.currentCell) {
      return (
        (this.currentCell.start[axis] >= cell.start[axis] &&
          this.currentCell.start[axis] < cell.end[axis]) ||
        (this.currentCell.end[axis] <= cell.end[axis] &&
          this.currentCell.end[axis] > cell.start[axis])
      );
    } else {
      return false;
    }
  }

  private compareCell(
    cA: NavStoredCell,
    cB: NavStoredCell,
    direction: NavPoint,
    mainAxis: number,
    subAxis: number
  ): number {
    const mainD =
      direction[mainAxis] > 0
        ? cA.start[mainAxis] - cB.start[mainAxis]
        : cB.start[mainAxis] - cA.start[mainAxis];
    if (mainD !== 0) {
      return mainD;
    } else {
      return cA.start[subAxis] - cB.start[subAxis];
    }
  }

  private removeDuplicatedTargets(
    cells: NavStoredCell[],
    axis: number
  ): NavStoredCell[] {
    let axisIndex: number;
    const filteredCells: NavStoredCell[] = [];
    cells.forEach((cell) => {
      if (axisIndex !== undefined || cell.start[axis] !== axisIndex) {
        axisIndex = cell.start[axis];
        filteredCells.push(cell);
      }
    });
    return filteredCells;
  }

  public move(direction: NavPoint): NavCellID | undefined {
    if (this.currentCell) {
      const currentCell = this.currentCell;
      let targetCells: NavStoredCell[] = [];
      if (direction[X_VAL] !== 0) {
        targetCells = (Object.values(this.cellMap) as NavStoredCell[])
          .filter((cell) => this.isSortTargets(cell, Y_VAL))
          .sort((cA, cB) => this.compareCell(cA, cB, direction, X_VAL, Y_VAL));
        targetCells = this.removeDuplicatedTargets(targetCells, Y_VAL);
      } else if (direction[Y_VAL] !== 0) {
        targetCells = (Object.values(this.cellMap) as NavStoredCell[])
          .filter((cell) => this.isSortTargets(cell, X_VAL))
          .sort((cA, cB) => this.compareCell(cA, cB, direction, Y_VAL, X_VAL));
        targetCells = this.removeDuplicatedTargets(targetCells, X_VAL);
      }
      if (targetCells.length > 0) {
        const currentIndex = targetCells.findIndex(
          (targetCell) => targetCell.name === currentCell.name
        );
        const targetCell =
          currentIndex + 1 >= targetCells.length
            ? targetCells[0]
            : targetCells[currentIndex + 1];
        this.currentCell = targetCell;
      }
    } else {
      this.currentCell = this.firstCell;
    }
    return this.currentCell?.name;
  }

  public moveNext(): NavCellID | undefined {
    if (this.currentCellId) {
      const allCellIds: NavCellID[] = Object.keys(this.cellMap) as NavCellID[];
      const currentIndex = allCellIds.indexOf(this.currentCellId);
      const targetCell =
        currentIndex + 1 >= allCellIds.length
          ? this.firstCell
          : this.cellMap[allCellIds[currentIndex + 1]];
      this.currentCell = targetCell;
    } else {
      this.currentCell = this.firstCell;
    }
    return this.currentCell?.name;
  }
}

export class PageNavigator {
  private callbackMap: NavCellCallbackMap;
  private navBoard: NavBoard;

  constructor(cellSpecs: NavCellSpec[]) {
    this.navBoard = new NavBoard();
    this.callbackMap = {};
    this.resetCellSpec(cellSpecs);
  }

  public get currentCellId(): NavCellID | undefined {
    return this.navBoard.currentCellId;
  }

  public isCurrent(cellId: NavCellID | undefined): boolean {
    return cellId === this.navBoard.currentCellId;
  }

  public resetCellSpec(cellSpecs: NavCellSpec[]): void {
    this.navBoard = new NavBoard(cellSpecs.map((cellSpec) => cellSpec.cell));
    this.callbackMap = {};
    cellSpecs.forEach((cellSpec) => {
      this.callbackMap[cellSpec.cell.name] = cellSpec.callback;
    });
    this.resetCurrent();
  }

  public resetFirst(cellId?: NavCellID): void {
    this.navBoard.resetFirst(cellId);
  }

  public resetCurrent(cellId?: NavCellID): void {
    this.navBoard.resetCurrent(cellId);
  }

  private get currentCellCallback(): NavCellCallback | undefined {
    if (this.navBoard.currentCellId) {
      return this.callbackMap[this.navBoard.currentCellId];
    } else {
      return undefined;
    }
  }

  public move(
    direction: NavPoint,
    { triggerAfterMoving = false }: NavMoveOption = {}
  ): void {
    this.navBoard.move(direction);
    const cellCallback = this.currentCellCallback;
    if (cellCallback?.after) {
      cellCallback.after();
    }
    if (triggerAfterMoving) {
      this.trigger();
    }
  }

  public moveNext({ triggerAfterMoving = false }: NavMoveOption = {}): void {
    this.navBoard.moveNext();
    const cellCallback = this.currentCellCallback;
    if (cellCallback?.after) {
      cellCallback.after();
    }
    if (triggerAfterMoving) {
      this.trigger();
    }
  }

  public trigger(): void {
    const cellCallback = this.currentCellCallback;
    if (cellCallback?.trigger) {
      cellCallback.trigger();
    }
  }
}
