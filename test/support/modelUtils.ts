import { describe, expect, it, afterAll } from "vitest";
import { BaseModel } from "~/models/baseModel";
import { genUid } from "~/services/db";
import { randomAttrPick } from "./randomUtils";

export function checkFetchBehavior<
  ModelKlass extends BaseModel<ModelKlass, ModelDoc, ModelParams>,
  ModelDoc,
  ModelParams
>(
  modelFetchProc: (inst: ModelKlass) => Promise<ModelKlass | null>,
  dbClearProc: () => void,
  modelBuildProc: () => ModelKlass,
  modelCreateProc: () => Promise<ModelKlass>
) {
  describe(".fetch", () => {
    describe("when a model instance is found", () => {
      afterAll(() => {
        dbClearProc();
      });
      it("fetches the model instance by given uid", async () => {
        const storedInst = await modelCreateProc();
        const fetchedInst = (await modelFetchProc(storedInst)) as ModelKlass;
        expect(fetchedInst.uid).toEqual(storedInst.uid);
      });
    });
    describe("when no model instance is found", () => {
      it("returns null", async () => {
        const builtDiary = modelBuildProc();
        const fetchedInst = await modelFetchProc(builtDiary);
        expect(fetchedInst).toBeNull();
      });
    });
  });
}

export function checkConstructorBehavior<
  ModelKlass extends BaseModel<ModelKlass, ModelDoc, ModelParams>,
  ModelDoc extends ModelParams,
  ModelParams extends object
>(
  ctorProc: (attrs?: ModelParams) => ModelKlass,
  defaultAttrs: ModelParams,
  attrBuildProc: () => ModelParams,
  modelBuildProc: () => ModelKlass
) {
  describe(".new", () => {
    it("creates a model instance with given attributes", () => {
      const dAttrs = attrBuildProc();
      const modelInst = ctorProc(dAttrs);
      Object.keys(dAttrs).forEach((attr) => {
        expect(modelInst.doc[attr as keyof ModelParams]).toEqual(
          dAttrs[attr as keyof ModelParams]
        );
      });
      expect(modelInst.uid).toBeUndefined();
    });

    describe("when no attribute is given", () => {
      it("creates a model instance with undefined uid", () => {
        const modelInst = modelBuildProc();
        expect(modelInst.uid).toBeUndefined();
      });

      it("creates a model instance with default attributes", () => {
        const modelInst = ctorProc();
        Object.keys(defaultAttrs).forEach((attr) => {
          expect(modelInst.doc[attr as keyof ModelParams]).toEqual(
            defaultAttrs[attr as keyof ModelParams]
          );
        });
      });
    });
  });
}

export function checkUidBehavior<
  ModelKlass extends BaseModel<ModelKlass, ModelDoc, ModelParams>,
  ModelDoc,
  ModelParams
>(
  uidAssignProc: (uid: string) => ModelKlass,
  expectedUidProc: (instance: ModelKlass, givenUid: string) => string
) {
  describe("#uid", () => {
    it("returns uid from the doc", () => {
      const uid = genUid();
      const modelInst = uidAssignProc(uid);
      expect(modelInst.uid).toEqual(expectedUidProc(modelInst, uid));
    });
  });
}

export function checkIsStoredBehavior<
  ModelKlass extends BaseModel<ModelKlass, ModelDoc, ModelParams>,
  ModelDoc,
  ModelParams
>(
  dbClearProc: () => void,
  modelBuildProc: () => ModelKlass,
  modelCreateProc: () => Promise<ModelKlass>
) {
  describe("#isStored", () => {
    afterAll(() => {
      dbClearProc();
    });
    describe("when the model instance is a new instance without saving", () => {
      it("returns false", () => {
        const modelInst = modelBuildProc();
        expect(modelInst.isStored).toBeFalsy();
      });
    });
    describe("when the model instance is saved", () => {
      it("returns true", async () => {
        const modelInst = await modelCreateProc();
        expect(modelInst.isStored).toBeTruthy();
      });
    });
  });
}

export function checkAssignBehavior<
  ModelKlass extends BaseModel<ModelKlass, ModelDoc, ModelParams>,
  ModelDoc extends ModelParams,
  ModelParams extends object
>(attrBuildProc: () => ModelParams, modelBuildProc: () => ModelKlass) {
  describe("#assign", () => {
    it("assigns doc attributes with given ones", () => {
      const givenAttrs = randomAttrPick(attrBuildProc());
      const modelInst = modelBuildProc();
      modelInst.assign(givenAttrs);
      Object.keys(givenAttrs).forEach((attr) => {
        expect(modelInst.doc[attr as keyof ModelParams]).toEqual(
          givenAttrs[attr as keyof ModelParams]
        );
      });
    });
  });
}

export function checkSaveBehavior<
  ModelKlass extends BaseModel<ModelKlass, ModelDoc, ModelParams>,
  ModelDoc,
  ModelParams
>(
  dbClearProc: () => void,
  modelBuildProc: () => ModelKlass,
  modelCreateProc: () => Promise<ModelKlass>
) {
  describe("#save", () => {
    afterAll(() => {
      dbClearProc();
    });
    describe("when the instance is a new instance", () => {
      it("stores the doc with the 'create' action", async () => {
        const modelInst = modelBuildProc();
        const result = await modelInst.save();
        expect(result.action).toEqual("create");
      });

      it("stores the doc with a random-generated uid", async () => {
        const modelInst = modelBuildProc();
        const result = await modelInst.save();
        expect(result.target.uid).not.toBeUndefined();
      });
    });
    describe("when the instance is an existing instance", () => {
      it("stores the doc with the 'update' action", async () => {
        const storedInst = await modelCreateProc();
        const result = await storedInst.save();
        expect(result.action).toEqual("update");
      });

      it("keeps uid not changed", async () => {
        const storedInst = await modelCreateProc();
        const oriUid = storedInst.uid;
        const result = await storedInst.save();
        expect(result.target.uid).toEqual(oriUid);
      });
    });
  });
}

export function checkFetchCurrentConfigBehavior<
  ModelKlass extends BaseModel<ModelKlass, ModelDoc, ModelParams>,
  ModelDoc,
  ModelParams
>(
  modelFetchCurrentConfigProc: () => Promise<ModelKlass | null>,
  dbClearProc: () => void,
  modelCreateProc: () => Promise<ModelKlass>
) {
  describe(".fetch", () => {
    describe("when modelInst is found", () => {
      afterAll(() => {
        dbClearProc();
      });
      it("fetches the modelInst by given uid", async () => {
        const storedInst = await modelCreateProc();
        const fetchedInst = (await modelFetchCurrentConfigProc()) as ModelKlass;
        expect(fetchedInst.uid).toEqual(storedInst.uid);
      });
    });
    describe("when no modelInst is found", () => {
      it("returns null", async () => {
        const fetchedInst = await modelFetchCurrentConfigProc();
        expect(fetchedInst).toBeNull();
      });
    });
  });
}
