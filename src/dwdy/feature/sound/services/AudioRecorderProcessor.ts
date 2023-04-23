// import fixWebmDuration from "fix-webm-duration";
import { AudioRecord } from "~/dwdy/feature/sound/def";

const RECORD_TIME_SLICE = 100;

class RecordingTimer {
  private _duration = 0;
  private _startTimestamp?: number;

  reset(): void {
    this._duration = 0;
  }

  start(): void {
    this._startTimestamp = Date.now();
  }

  stop(): void {
    if (this._startTimestamp) {
      this._duration += Date.now() - this._startTimestamp;
      this._startTimestamp = undefined;
    }
  }

  get duration(): number {
    return this._duration;
  }
}

export class AudioRecorderProcessor {
  private _status:
    | "init"
    | "error"
    | "ready"
    | "recording"
    | "paused"
    | "stopped" = "init";
  private _errorReason?: string;
  private _errorExcep?: DOMException;
  private _recorder?: MediaRecorder;
  private _audioCtx: AudioContext = new AudioContext();
  private _audioAnalyser: AnalyserNode = new AnalyserNode(this._audioCtx);
  private _audioChunks: Array<Blob> = [];
  private _visualDataSet: Uint8Array = new Uint8Array();
  private _duration = 0;
  private _storedAudio?: AudioRecord;
  private _recordingTimer: RecordingTimer = new RecordingTimer();
  private _tickFn?: () => void = undefined;
  private _stopCallback?: (record: AudioRecord) => void = undefined;

  async setupRecorder(): Promise<void> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this._status = "error";
      this._errorReason = "not_supported";
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      if (stream) {
        this.buildRecorder(stream);
        this.setupAudioGraph(stream);
        this._status = "ready";
        this.tick();
      }
    } catch (err) {
      this.setupErrorState(err as DOMException);
    }
  }

  get isReady(): boolean {
    return this._recorder !== undefined;
  }

  get isInRecording(): boolean {
    return this._status === "recording" || this._status === "paused";
  }

  get error(): { reason?: string; excep?: DOMException } {
    return { reason: this._errorReason, excep: this._errorExcep };
  }

  get status(): string {
    return this._status;
  }

  get storedAudio(): AudioRecord | undefined {
    return this._storedAudio;
  }

  get errorExcep(): DOMException | undefined {
    return this._errorExcep;
  }

  get visualDataSet(): Uint8Array {
    return this._visualDataSet;
  }

  get duration(): number {
    return this._duration;
  }

  set tickFn(givenFn: () => void) {
    this._tickFn = givenFn;
  }

  set stopCallback(givenFn: (record: AudioRecord) => void) {
    this._stopCallback = givenFn;
  }

  async start(): Promise<void> {
    if (this._recorder && this._status === "ready") {
      this._duration = 0;
      this._recordingTimer.reset();
      this._recordingTimer.start();
      try {
        this._recorder.start(RECORD_TIME_SLICE);
        this._status = "recording";
      } catch (e) {
        this.setupErrorState(e as DOMException);
      }
    }
    this.tick();
  }

  pause(): void {
    if (this._recorder && this._status === "recording") {
      this._recordingTimer.stop();
      this._recorder.pause();
      this._status = "paused";
    }
    this.tick();
  }

  stop(): void {
    if (this._recorder && this._status === "recording") {
      this._recorder.stop();
      this._recordingTimer.stop();
      this._status = "stopped";
    }
    this.tick();
  }

  resume(): void {
    if (this._recorder && this._status === "paused") {
      this._recordingTimer.start();
      this._recorder.resume();
      this._status = "recording";
    }
    this.tick();
  }

  private isChunkEmpty(): boolean {
    if (this._audioChunks.length === 0) {
      return true;
    }
    if (this._audioChunks[0] && this._audioChunks[0].size === 0) {
      return true;
    }
    return false;
  }

  private buildRecorder(stream: MediaStream): void {
    this._recorder = new MediaRecorder(stream);
    this._recorder.ondataavailable = (event) => {
      this._audioChunks.push(event.data);
      this.buildVisualData();
      this._duration += RECORD_TIME_SLICE / 1000;
      this.tick();
    };
    this._recorder.onstop = async () => {
      this.tick();
      this._tickFn = undefined;
      if (this.isChunkEmpty()) {
        return;
      }
      this._storedAudio = {
        chunks: this._audioChunks,
        duration: this._recordingTimer.duration,
      };
      // const rawBlob = new Blob(this._audioChunks, {
      //   type: "audio/webm;codecs=opus",
      // });
      // const blob = await fixWebmDuration(
      //   rawBlob,
      //   this._recordingTimer.duration
      // );
      // this._visualDataSet = new Uint8Array();
      // this._storedAudio = {
      //   chunks: this._audioChunks,
      //   dataUrl: URL.createObjectURL(blob),
      //   duration: this._recordingTimer.duration,
      //   blob: blob,
      // };
      if (this._stopCallback) {
        this._stopCallback(this._storedAudio);
        this._stopCallback = undefined;
      }
    };
  }

  showRecorderSupportedTypes(): void {
    const types = [
      'audio/webm;codecs="vorbis"',
      'audio/webm;codecs="opus"',
      'audio/ogg;codecs="vorbis"',
      'audio/ogg;codecs="opus"',
      'audio/ogg;codecs="flac"',
      "audio/mpeg",
    ];
    types.forEach((type) => {
      console.log(type, MediaRecorder.isTypeSupported(type));
    });
  }

  private setupAudioGraph(stream: MediaStream): void {
    const audioSrc = this._audioCtx.createMediaStreamSource(stream);
    audioSrc.connect(this._audioAnalyser);
  }

  private buildVisualData(): void {
    const bufferLength = this._audioAnalyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this._audioAnalyser.getByteTimeDomainData(dataArray);
    this._visualDataSet = dataArray;
  }

  private setupErrorState(e: DOMException): void {
    this._status = "error";
    this._errorExcep = e as DOMException;
    switch (e.name) {
      case "SecurityError":
        this._errorReason = "permission_denied";
        break;
      case "InvalidModificationError":
        this._errorReason = "media_error";
        break;
      case "NotSupportedError":
        this._errorReason = "media_not_supported";
        break;
      default:
        this._errorReason = "unknown";
        break;
    }
  }

  private tick(): void {
    if (this._tickFn) {
      this._tickFn();
    }
  }
}
