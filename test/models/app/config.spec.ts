import { describe } from "vitest";
import "fake-indexeddb/auto";
import { AppConfig, DEFAULT_ATTRS } from "~/models/app/config";
import { dbApp } from "~/services/db/app";
import { genUid } from "~/services/db";
import { buildAttrs, build, create } from "../../factories/app/configs";
import {
  checkFetchCurrentConfigBehavior,
  checkFetchBehavior,
  checkConstructorBehavior,
  checkUidBehavior,
  checkIsStoredBehavior,
  checkAssignBehavior,
  checkSaveBehavior,
} from "../../support/modelUtils";

describe("AppConfig", () => {
  checkFetchCurrentConfigBehavior(
    () => {
      return AppConfig.fetchCurrentConfig();
    },
    () => {
      dbApp.configs.clear();
    },
    create
  );
  checkFetchBehavior(
    (inst) => {
      return AppConfig.fetch(inst.uid as string);
    },
    () => {
      dbApp.configs.clear();
    },
    () => {
      return new AppConfig({ acUid: genUid() });
    },
    create
  );
  checkConstructorBehavior(
    (attrs) => {
      return new AppConfig(attrs);
    },
    DEFAULT_ATTRS,
    buildAttrs,
    build
  );
  checkUidBehavior(
    (uid) => {
      return new AppConfig({ acUid: uid });
    },
    (_instance, uid) => {
      return uid;
    }
  );
  checkIsStoredBehavior(
    () => {
      dbApp.configs.clear();
    },
    build,
    create
  );
  checkAssignBehavior(buildAttrs, build);
  checkSaveBehavior(
    () => {
      dbApp.configs.clear();
    },
    build,
    create
  );
});
