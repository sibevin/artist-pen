import { describe } from "vitest";
import "fake-indexeddb/auto";
import { DwdyConfig, DEFAULT_ATTRS } from "~/models/dwdy/config";
import { dbDwdy } from "~/services/db/dwdy";
import { genUid } from "~/services/db";
import { buildAttrs, build, create } from "../../factories/dwdy/configs";
import {
  checkFetchCurrentConfigBehavior,
  checkFetchBehavior,
  checkConstructorBehavior,
  checkUidBehavior,
  checkIsStoredBehavior,
  checkAssignBehavior,
  checkSaveBehavior,
} from "../../support/modelUtils";

describe("DwdyConfig", () => {
  checkFetchCurrentConfigBehavior(
    () => {
      return DwdyConfig.fetchCurrentConfig();
    },
    () => {
      dbDwdy.configs.clear();
    },
    create
  );
  checkFetchBehavior(
    (inst) => {
      return DwdyConfig.fetch(inst.uid as string);
    },
    () => {
      dbDwdy.configs.clear();
    },
    () => {
      return new DwdyConfig({ dcUid: genUid() });
    },
    create
  );
  checkConstructorBehavior(
    (attrs) => {
      return new DwdyConfig(attrs);
    },
    DEFAULT_ATTRS,
    buildAttrs,
    build
  );
  checkUidBehavior(
    (uid) => {
      return new DwdyConfig({ dcUid: uid });
    },
    (_instance, uid) => {
      return uid;
    }
  );
  checkIsStoredBehavior(
    () => {
      dbDwdy.configs.clear();
    },
    build,
    create
  );
  checkAssignBehavior(buildAttrs, build);
  checkSaveBehavior(
    () => {
      dbDwdy.configs.clear();
    },
    build,
    create
  );
});
