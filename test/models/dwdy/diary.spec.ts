import { describe } from "vitest";
import "fake-indexeddb/auto";
import { Diary, DEFAULT_ATTRS } from "~/models/dwdy/diary";
import { dbDwdy } from "~/services/db/dwdy";
import { genUid } from "~/services/db";
import { buildAttrs, build, create } from "../../factories/dwdy/diaries";
import {
  checkFetchBehavior,
  checkConstructorBehavior,
  checkUidBehavior,
  checkIsReadyToSaveBehavior,
  checkAssignBehavior,
  checkSaveBehavior,
} from "../../support/modelUtils";

describe("Diary", () => {
  checkFetchBehavior(
    (inst) => {
      return Diary.fetch(inst.uid as string);
    },
    () => {
      dbDwdy.diaries.clear();
    },
    () => {
      return new Diary({ dUid: genUid() });
    },
    create
  );
  checkConstructorBehavior(
    (attrs) => {
      return new Diary(attrs);
    },
    DEFAULT_ATTRS,
    buildAttrs,
    build
  );
  checkUidBehavior(
    (uid) => {
      return new Diary({ dUid: uid });
    },
    (_instance, uid) => {
      return uid;
    }
  );
  checkIsReadyToSaveBehavior(
    () => {
      dbDwdy.diaries.clear();
    },
    build,
    create
  );
  checkAssignBehavior(buildAttrs, build);
  checkSaveBehavior(
    () => {
      dbDwdy.diaries.clear();
    },
    build,
    create
  );
});
