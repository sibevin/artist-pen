import { onKeyStroke, KeyStrokeEventName } from "@vueuse/core";
import * as BuildInfo from "~/services/buildInfo";
import { PageNavigator } from "~/services/pageNavigator";

type HotkeyScope = string;
type HotkeyEventType = "press" | "up" | "down";
type HotkeyCallback = (params: { scope: string; event: KeyboardEvent }) => void;
type HotkeyEventCallback = (event: KeyboardEvent) => void;
type HotkeyScopeCallbackMap = Record<HotkeyScope, HotkeyEventCallback>;
type HotkeySpecMap = Record<
  string,
  { callbackMap: HotkeyScopeCallbackMap; removeBindingFn?: () => void }
>;

interface HotkeySpec {
  keys: string[];
  eventType?: HotkeyEventType;
  callback: HotkeyCallback;
  checkActivation?: boolean;
  scope?: HotkeyScope;
  preventDefault?: boolean;
}

const GLOBAL_SCOPE = "global";

export class HotkeyProvider {
  public inHotkeyMode: boolean;
  public activated: boolean;
  private currentScope: HotkeyScope;
  private prevScope: HotkeyScope;
  private blocking: boolean;
  private specMap: HotkeySpecMap;

  constructor() {
    this.inHotkeyMode = false;
    this.activated = true;
    this.currentScope = GLOBAL_SCOPE;
    this.prevScope = GLOBAL_SCOPE;
    this.blocking = false;
    this.specMap = {};
  }

  get scope(): HotkeyScope {
    return this.currentScope;
  }

  public setupHotKeys(
    givenScope: HotkeyScope,
    registerKeysProc?: () => void
  ): void {
    this.cleanKeyEvents();
    registerKeysProc?.();
    this.switchScope(givenScope);
    this.bindKeyEvents();
  }

  public registerKey({
    keys,
    eventType,
    checkActivation = true,
    scope,
    preventDefault = true,
    callback,
  }: HotkeySpec): void {
    keys.forEach((key) => {
      let specEventType = eventType;
      if (specEventType === undefined) {
        if (key === "Escape" || key === "Tab") {
          specEventType = "up";
        } else {
          specEventType = "press";
        }
      }
      const specKey = `${key}_${specEventType}`;
      if (!this.specMap[specKey]) {
        this.specMap[specKey] = { callbackMap: {} };
      }
      const eventCallback: HotkeyEventCallback = (event: KeyboardEvent) => {
        if (checkActivation && !this.activated) {
          return;
        }
        if (scope && !this.checkScope(scope)) {
          return;
        }
        callback({ scope: this.currentScope, event });
        if (preventDefault) {
          event.preventDefault();
        }
      };
      this.specMap[specKey]["callbackMap"][scope || GLOBAL_SCOPE] =
        eventCallback;
    });
  }

  public registerDefaultKeys(): void {
    this.registerKey({
      eventType: "down",
      keys: ["Alt"],
      preventDefault: true,
      callback: () => {
        if (BuildInfo.platform === "desktop") {
          this.inHotkeyMode = true;
        }
      },
    });
    this.registerKey({
      eventType: "up",
      keys: ["Alt"],
      preventDefault: true,
      callback: () => {
        if (BuildInfo.platform === "desktop") {
          this.inHotkeyMode = false;
        }
      },
    });
    this.registerKey({
      keys: ["."],
      callback: () => {
        this.inHotkeyMode = !this.inHotkeyMode;
      },
    });
  }

  public registerPageNavigatorKeys(
    pn: PageNavigator,
    scope: HotkeyScope
  ): void {
    this.registerKey({
      keys: ["k", "ArrowUp"],
      scope,
      callback: () => {
        pn.move([0, -1]);
      },
    });
    this.registerKey({
      keys: ["j", "ArrowDown"],
      scope,
      callback: () => {
        pn.move([0, 1]);
      },
    });
    this.registerKey({
      keys: ["h", "ArrowLeft"],
      scope,
      callback: () => {
        pn.move([-1, 0]);
      },
    });
    this.registerKey({
      keys: ["l", "ArrowRight"],
      scope,
      callback: () => {
        pn.move([1, 0]);
      },
    });
    this.registerKey({
      keys: ["Enter", " "],
      scope,
      callback: () => {
        if (pn.isCurrent(undefined)) {
          pn.moveNext();
        } else {
          pn.trigger();
        }
      },
    });
    this.registerKey({
      keys: ["q", "Escape"],
      eventType: "down",
      scope,
      callback: () => {
        pn.resetCurrent();
      },
    });
    this.registerKey({
      keys: ["n", "Tab"],
      eventType: "down",
      scope,
      callback: () => {
        pn.moveNext();
      },
    });
  }

  private bindKeyEvents(): void {
    Object.keys(this.specMap).forEach((specKey) => {
      const [key, eventType] = specKey.split("_");
      const eventName = `key${eventType}` as KeyStrokeEventName;
      const keyCallback = (event: KeyboardEvent) => {
        if (
          this.currentScope &&
          this.specMap[specKey]["callbackMap"][this.currentScope]
        ) {
          this.specMap[specKey]["callbackMap"][this.currentScope](event);
          return;
        }
        if (this.specMap[specKey]["callbackMap"][GLOBAL_SCOPE]) {
          this.specMap[specKey]["callbackMap"][GLOBAL_SCOPE](event);
          return;
        }
      };
      this.specMap[specKey]["removeBindingFn"] = onKeyStroke(key, keyCallback, {
        eventName,
      });
    });
  }

  private cleanKeyEvents(): void {
    Object.keys(this.specMap).forEach((specKey) => {
      this.specMap[specKey]["removeBindingFn"]?.();
    });
  }

  public checkScope(givenScope: HotkeyScope): boolean {
    return this.currentScope === givenScope;
  }

  public switchScope(givenScope: HotkeyScope): void {
    if (this.checkScope(givenScope)) {
      return;
    }
    this.prevScope = this.currentScope;
    this.currentScope = givenScope;
  }

  public switchBackScope(): void {
    const currentScope = this.currentScope;
    this.currentScope = this.prevScope;
    this.prevScope = currentScope;
  }

  public isMarkShown(givenScope: string): boolean {
    return this.checkScope(givenScope) && this.inHotkeyMode;
  }

  public block(): void {
    this.blocking = true;
  }
}
