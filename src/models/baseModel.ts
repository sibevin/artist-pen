export interface BaseModel<ModelKlass, ModelDoc, ModelParams> {
  doc: ModelDoc;
  uid: string | undefined;
  isStored: boolean;
  assign: (params: Partial<ModelParams>) => ModelKlass;
  save: () => Promise<{ target: ModelKlass; action: string }>;
}
