export interface BaseModel<ModelKlass, ModelDoc, ModelParams> {
  doc: ModelDoc;
  uid: string | undefined;
  isReadyToSave: boolean;
  assign: (params: Partial<ModelParams>) => ModelKlass;
  save: () => Promise<{ target: ModelKlass; action: string }>;
}
