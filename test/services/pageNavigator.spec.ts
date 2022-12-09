import { describe, expect, it } from "vitest";
import { randomPick } from "../support/randomUtils";
import { buildNavCell } from "../factories/pageNavi";
import {
  PageNavigator,
  NavPoint,
  NavCellID,
  NavCellSpec,
} from "~/services/pageNavigator";

// NOTE: The navi board for testing
//
// |---|---|---|
// | A | B |   |
// |---|---| C |
// | D | E |   |
// |---|---|---|
// |     F     |
// |-----------|
//
const tcCellSpecs: NavCellSpec[] = [
  { cell: { name: "A", start: [0, 0] } },
  { cell: { name: "B", start: [1, 0] } },
  { cell: { name: "C", start: [2, 0], end: [3, 2] } },
  { cell: { name: "D", start: [0, 1] } },
  { cell: { name: "E", start: [1, 1] } },
  { cell: { name: "F", start: [0, 2], end: [3, 3] } },
];

describe("PageNavigator", () => {
  describe(".move", () => {
    const moveTestCases: {
      origin: NavCellID;
      direction: NavPoint;
      result: NavCellID;
    }[] = [
      { origin: "E", direction: [1, 0], result: "C" },
      { origin: "E", direction: [0, 1], result: "F" },
      { origin: "E", direction: [-1, 0], result: "D" },
      { origin: "E", direction: [0, -1], result: "B" },
      { origin: "C", direction: [1, 0], result: "A" },
      { origin: "C", direction: [0, 1], result: "F" },
      { origin: "C", direction: [-1, 0], result: "B" },
      { origin: "C", direction: [0, -1], result: "F" },
      { origin: "F", direction: [1, 0], result: "F" },
      { origin: "F", direction: [0, 1], result: "A" },
      { origin: "F", direction: [-1, 0], result: "F" },
      { origin: "F", direction: [0, -1], result: "D" },
      { origin: "A", direction: [1, 0], result: "B" },
      { origin: "A", direction: [0, 1], result: "D" },
      { origin: "A", direction: [-1, 0], result: "C" },
      { origin: "A", direction: [0, -1], result: "F" },
    ];
    it("moves the current cell according to the given direction", () => {
      const pn = new PageNavigator(tcCellSpecs);
      moveTestCases.forEach((tc) => {
        pn.resetCurrent(tc.origin);
        pn.move(tc.direction);
        expect(pn.isCurrent(tc.result)).toBeTruthy();
      });
    });
    describe("when no current cell is set", () => {
      it("moves the current cell to the first cell", () => {
        const pn = new PageNavigator(tcCellSpecs);
        pn.move([1, 0]);
        expect(pn.isCurrent("A")).toBeTruthy();
      });
      describe("when no cell spec is given", () => {
        it("resets the current cell to undefined", () => {
          const pn = new PageNavigator([]);
          pn.move([1, 0]);
          expect(pn.isCurrent(undefined)).toBeTruthy();
        });
      });
    });
    describe("when triggerAfterMoving is true", () => {
      it("triggers the 'trigger' callback as well", () => {
        const cellSpecs = [
          {
            cell: buildNavCell(),
            callback: {
              trigger: () => {
                throw "triggerCallback";
              },
            },
          },
        ];
        const pn = new PageNavigator(cellSpecs);
        expect(() => {
          pn.move([1, 0], { triggerAfterMoving: true });
        }).toThrowError(/triggerCallback/);
      });
    });
    describe("when after callback is defined", () => {
      it("triggers the after callback", () => {
        const cellSpecs = [
          {
            cell: buildNavCell(),
            callback: {
              after: () => {
                throw "afterCallback";
              },
            },
          },
        ];
        const pn = new PageNavigator(cellSpecs);
        expect(() => {
          pn.move([1, 0]);
        }).toThrowError(/afterCallback/);
      });
    });
  });
  describe("#moveNext", () => {
    it("moves the current cell to the next cell", () => {
      const pn = new PageNavigator(tcCellSpecs);
      pn.resetCurrent("A");
      pn.moveNext();
      expect(pn.isCurrent("B")).toBeTruthy();
    });
    describe("when no current cell is set", () => {
      it("moves the current cell to the first cell", () => {
        const pn = new PageNavigator(tcCellSpecs);
        pn.moveNext();
        expect(pn.isCurrent("A")).toBeTruthy();
      });
      describe("when no cell spec is given", () => {
        it("resets the current cell to undefined", () => {
          const pn = new PageNavigator([]);
          pn.moveNext();
          expect(pn.isCurrent(undefined)).toBeTruthy();
        });
      });
    });
    describe("when triggerAfterMoving is true", () => {
      it("triggers the 'trigger' callback as well", () => {
        const cellSpecs = [
          {
            cell: buildNavCell(),
            callback: {
              trigger: () => {
                throw "triggerCallback";
              },
            },
          },
        ];
        const pn = new PageNavigator(cellSpecs);
        expect(() => {
          pn.moveNext({ triggerAfterMoving: true });
        }).toThrowError(/triggerCallback/);
      });
    });
    describe("when after callback is defined", () => {
      it("triggers the after callback", () => {
        const cellSpecs = [
          {
            cell: buildNavCell(),
            callback: {
              after: () => {
                throw "afterCallback";
              },
            },
          },
        ];
        const pn = new PageNavigator(cellSpecs);
        expect(() => {
          pn.moveNext();
        }).toThrowError(/afterCallback/);
      });
    });
  });
  describe("#resetCellSpec", () => {
    it("resets the page naviagtor according to given cell specs", () => {
      const pn = new PageNavigator(tcCellSpecs);
      const cell = buildNavCell();
      pn.resetCellSpec([{ cell }]);
      pn.moveNext();
      expect(pn.isCurrent(cell.name)).toBeTruthy();
    });
    it("resets the current cell to undefined", () => {
      const pn = new PageNavigator(tcCellSpecs);
      pn.moveNext();
      const cell = buildNavCell();
      pn.resetCellSpec([{ cell }]);
      expect(pn.isCurrent(undefined)).toBeTruthy();
    });
  });
  describe("#resetFirst", () => {
    describe("when a cell is given", () => {
      it("assigns the given cell to the first cell", () => {
        const pn = new PageNavigator(tcCellSpecs);
        const cellId = randomPick(
          tcCellSpecs.map((cellEvent) => cellEvent.cell.name)
        );
        pn.resetFirst(cellId);
        pn.moveNext();
        expect(pn.isCurrent(cellId)).toBeTruthy();
      });
    });
    describe("when no cell is given", () => {
      it("resets the first cell to the first cell from the given cell spec", () => {
        const pn = new PageNavigator(tcCellSpecs);
        const cellId = randomPick(
          tcCellSpecs.map((cellEvent) => cellEvent.cell.name)
        );
        pn.resetFirst(cellId);
        pn.resetFirst();
        pn.moveNext();
        expect(pn.isCurrent("A")).toBeTruthy();
      });
    });
    describe("when no cell spec is given", () => {
      it("resets the first cell to undefined", () => {
        const pn = new PageNavigator([]);
        pn.moveNext();
        expect(pn.isCurrent(undefined)).toBeTruthy();
      });
    });
  });
  describe("#resetCurrent, #isCurrent", () => {
    describe("when a cell is given", () => {
      it("assigns the given cell to the current cell", () => {
        const pn = new PageNavigator(tcCellSpecs);
        const cellId = randomPick(
          tcCellSpecs.map((cellEvent) => cellEvent.cell.name)
        );
        pn.resetCurrent(cellId);
        expect(pn.isCurrent(cellId)).toBeTruthy();
      });
    });
    describe("when no cell is given", () => {
      it("resets the current cell to undefined", () => {
        const pn = new PageNavigator(tcCellSpecs);
        const cellId = randomPick(
          tcCellSpecs.map((cellEvent) => cellEvent.cell.name)
        );
        pn.resetCurrent(cellId);
        pn.resetCurrent();
        expect(pn.isCurrent(cellId)).toBeFalsy();
        expect(pn.isCurrent(undefined)).toBeTruthy();
      });
    });
  });
  describe("#trigger", () => {
    describe("when a nav event callback is defined", () => {
      it("triggers the nav event callback according to the current point", () => {
        const cell = buildNavCell();
        const cellSpecs = [
          {
            cell,
            callback: {
              trigger: () => {
                throw "triggered";
              },
            },
          },
        ];
        const pn = new PageNavigator(cellSpecs);
        pn.resetCurrent(cell.name);
        expect(() => {
          pn.trigger();
        }).toThrowError(/triggered/);
      });
    });
    describe("when no nav event callback is defined at the current point", () => {
      it("dose nothting", () => {
        const cell = buildNavCell();
        const pn = new PageNavigator([{ cell }]);
        pn.resetCurrent(cell.name);
        expect(() => {
          pn.trigger();
        }).not.toThrowError();
      });
    });
  });
});
