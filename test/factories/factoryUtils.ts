export function prepareModelFactory<
  ModelKlass extends { save: () => Promise<{ target: ModelKlass }> },
  ModelParams
>(
  attrBuiler: (args?: ModelParams) => ModelParams,
  ctorProc: (args?: ModelParams) => ModelKlass,
  prepareSaveProc?: (inst: ModelKlass) => ModelKlass
): {
  build: (givenAttrs?: ModelParams) => ModelKlass;
  create: (givenAttrs?: ModelParams) => Promise<ModelKlass>;
} {
  return {
    build: (givenAttrs) => {
      const modelAttrs = attrBuiler(givenAttrs);
      return ctorProc(modelAttrs);
    },
    create: async (givenAttrs) => {
      const modelAttrs = attrBuiler(givenAttrs);
      let modelInst = ctorProc(modelAttrs);
      if (prepareSaveProc) {
        modelInst = prepareSaveProc(modelInst);
      }
      return (await modelInst.save()).target;
    },
  };
}
