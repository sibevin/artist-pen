export type NavPoint = [number, number];
export type NavCellID = string;

export interface NavCell {
  name: NavCellID;
  start: NavPoint;
  end?: NavPoint;
  skip?: () => boolean;
}
interface NavStoredCell extends NavCell {
  end: NavPoint;
}

type NavCallback = () => void;
type NavCellCallbackMap = Record<NavCellID, NavCellCallback | undefined>;
interface NavCellCallback {
  enter?: NavCallback;
  trigger?: NavCallback;
  leave?: NavCallback;
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
        skip: cell.skip,
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
      const firstNotSkippedCell = Object.values(this.cellMap).filter((cell) => {
        if (cell.skip && cell.skip()) {
          return false;
        } else {
          return true;
        }
      })[0];
      if (firstNotSkippedCell) {
        this.firstCell = firstNotSkippedCell;
      } else {
        this.firstCell = Object.values(this.cellMap)[0];
      }
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
    if (cell.skip && cell.skip()) {
      return false;
    }
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

  public move(direction: NavPoint, preview = false): NavCellID | undefined {
    let targetCell;
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
        targetCell =
          currentIndex + 1 >= targetCells.length
            ? targetCells[0]
            : targetCells[currentIndex + 1];
      }
    } else {
      targetCell = this.firstCell;
    }
    if (preview) {
      return targetCell?.name;
    } else {
      this.currentCell = targetCell;
      return this.currentCell?.name;
    }
  }

  public moveNext(preview = false): NavCellID | undefined {
    let targetCell;
    if (this.currentCellId) {
      const allCellIds: NavCellID[] = Object.keys(this.cellMap).filter(
        (cellId) => {
          const skipFn = this.cellMap[cellId].skip;
          if (skipFn && skipFn()) {
            return false;
          } else {
            return true;
          }
        }
      ) as NavCellID[];
      const currentIndex = allCellIds.indexOf(this.currentCellId);
      targetCell =
        currentIndex + 1 >= allCellIds.length
          ? this.firstCell
          : this.cellMap[allCellIds[currentIndex + 1]];
    } else {
      targetCell = this.firstCell;
    }
    if (preview) {
      return targetCell?.name;
    } else {
      this.currentCell = targetCell;
      return this.currentCell?.name;
    }
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

  public resetCellSpec(
    cellSpecs: NavCellSpec[],
    resetCellId?: NavCellID | undefined
  ): void {
    this.navBoard = new NavBoard(cellSpecs.map((cellSpec) => cellSpec.cell));
    this.callbackMap = {};
    cellSpecs.forEach((cellSpec) => {
      this.callbackMap[cellSpec.cell.name] = cellSpec.callback;
    });
    this.resetCurrent(resetCellId);
  }

  public resetFirst(cellId?: NavCellID): void {
    this.navBoard.resetFirst(cellId);
  }

  public resetCurrent(cellId?: NavCellID): void {
    this.runCurrentLeaveCallback(cellId);
    this.navBoard.resetCurrent(cellId);
  }

  private runCurrentLeaveCallback(targetCellId?: NavCellID): void {
    if (targetCellId !== this.currentCellId) {
      const currentCallback = this.getCellCallback(this.currentCellId);
      if (currentCallback?.leave) {
        currentCallback.leave();
      }
    }
  }

  private getCellCallback(cellId?: NavCellID): NavCellCallback | undefined {
    if (cellId) {
      return this.callbackMap[cellId];
    } else {
      return undefined;
    }
  }

  public move(
    direction: NavPoint,
    { triggerAfterMoving = false }: NavMoveOption = {}
  ): void {
    const targetCellId = this.navBoard.move(direction, true);
    this.runCurrentLeaveCallback(targetCellId);
    const targetCallback = this.getCellCallback(targetCellId);
    if (targetCallback?.enter) {
      targetCallback.enter();
    }
    this.navBoard.move(direction);
    if (triggerAfterMoving) {
      this.trigger();
    }
  }

  public moveNext({ triggerAfterMoving = false }: NavMoveOption = {}): void {
    const targetCellId = this.navBoard.moveNext(true);
    this.runCurrentLeaveCallback(targetCellId);
    const targetCallback = this.getCellCallback(targetCellId);
    if (targetCallback?.enter) {
      targetCallback.enter();
    }
    this.navBoard.moveNext();
    if (triggerAfterMoving) {
      this.trigger();
    }
  }

  public trigger(): void {
    const currentCallback = this.getCellCallback(this.currentCellId);
    if (currentCallback?.trigger) {
      currentCallback.trigger();
    }
  }
}
