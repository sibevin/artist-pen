import { genUid } from "~/services/db";
import { AudioRecord } from "~/dwdy/feature/sound/def";
import { AudioRecorderProcessor } from "./AudioRecorderProcessor";

export class AudioRecorder {
  private _currentProcessor?: AudioRecorderProcessor;
  private _currentPUid?: string;
  private _storedProcessorMap: Record<string, AudioRecorderProcessor> = {};
  private _tickFn?: () => void = undefined;
  private _stopCallback?: (record: AudioRecord) => void = undefined;

  get status(): string {
    if (this._currentProcessor) {
      return this._currentProcessor.status;
    } else {
      return "init";
    }
  }

  get visualDataSet(): Uint8Array {
    if (this._currentProcessor) {
      return this._currentProcessor.visualDataSet;
    } else {
      return new Uint8Array();
    }
  }

  get duration(): number {
    if (this._currentProcessor) {
      return this._currentProcessor.duration;
    } else {
      return 0;
    }
  }

  get isInRecording(): boolean {
    if (this._currentProcessor) {
      return this._currentProcessor.isInRecording;
    } else {
      return false;
    }
  }

  get errorReason(): string | undefined {
    if (this._currentProcessor && this._currentProcessor.error) {
      return this._currentProcessor.error.reason;
    }
  }

  get storedRecords(): Record<string, AudioRecord | undefined> {
    const recordMap: Record<string, AudioRecord | undefined> = {};
    Object.keys(this._storedProcessorMap).forEach((key) => {
      const storedP = this._storedProcessorMap[key];
      recordMap[key] = storedP.storedAudio;
    });
    return recordMap;
  }

  set tickFn(givenFn: () => void) {
    this._tickFn = givenFn;
  }

  set stopCallback(givenFn: ((record: AudioRecord) => void) | undefined) {
    this._stopCallback = givenFn;
  }

  public async start(): Promise<string | undefined> {
    if (!this._currentProcessor) {
      this._currentProcessor = new AudioRecorderProcessor();
      if (this._tickFn) {
        this._currentProcessor.tickFn = this._tickFn;
      }
      if (this._stopCallback) {
        this._currentProcessor.stopCallback = this._stopCallback;
      }
      await this._currentProcessor.setupRecorder();
      this._currentPUid = genUid();
    }
    if (this._currentProcessor.status === "ready") {
      this._currentProcessor.start();
      return this._currentPUid;
    }
  }

  public pause(): void {
    if (this._currentProcessor) {
      this._currentProcessor.pause();
    }
  }

  public resume(): void {
    if (this._currentProcessor) {
      this._currentProcessor.resume();
    }
  }

  public stop(): string | undefined {
    Object.keys(this._storedProcessorMap).forEach((key) => {
      const storedP = this._storedProcessorMap[key];
      storedP.stop();
    });
    if (this._currentProcessor && this._currentPUid) {
      const stoppedPUid = this._currentPUid;
      this._currentProcessor.stop();
      this._storedProcessorMap[stoppedPUid] = this._currentProcessor;
      this._currentProcessor = undefined;
      this._currentPUid = undefined;
      return stoppedPUid;
    }
  }

  public async stopAndStart(): Promise<string | undefined> {
    this.stop();
    return await this.start();
  }

  public pullStoredAudio(pUid: string): AudioRecord | undefined {
    const storedProcess = this._storedProcessorMap[pUid];
    if (!storedProcess) {
      return;
    }
    let record;
    if (storedProcess.storedAudio) {
      record = Object.assign({}, storedProcess.storedAudio);
    }
    delete this._storedProcessorMap[pUid];
    return record;
  }
}
