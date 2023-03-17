import { ref, Ref } from "vue";

type AudioPlayerStatus = "init" | "stopped" | "playing" | "paused";

export class AudioPlayerProcessor {
  private _status: AudioPlayerStatus = "init";
  private _audioEle: HTMLAudioElement = new Audio();
  private _audioCtx: AudioContext = new AudioContext();
  private _audioAnalyser: AnalyserNode = new AnalyserNode(this._audioCtx);
  private _audioStereoPanner: StereoPannerNode = new StereoPannerNode(
    this._audioCtx,
    { pan: 0 }
  );
  private _duration = 0;
  private _isLoading = false;
  private _currentTime = 0;
  private _visualDataSet: Uint8Array = new Uint8Array();
  private _refreshKey = ref<number>(1);

  constructor() {
    this.initAudioGraph();
    this.setupAudioElement();
  }

  load(audioData: string): void {
    this._audioEle.src = audioData;
    this._audioEle.load();
  }

  reset(): void {
    this.stop();
    this._status = "init";
    this._visualDataSet = new Uint8Array();
    this._duration = 0;
    this._isLoading = false;
    this._currentTime = 0;
    this.refresh();
  }

  play(seekToTime: number | undefined = undefined): void {
    if (!this.isReady) {
      return;
    }
    if (seekToTime) {
      this._audioEle.currentTime = seekToTime;
    }
    this._audioEle.play();
  }

  pause(): void {
    if (!this.isReady) {
      return;
    }
    this._audioEle.pause();
  }

  stop(): void {
    if (!this.isReady) {
      return;
    }
    this._audioEle.currentTime = 0;
    this._audioEle.pause();
  }

  switchLoop(): boolean {
    if (!this.isReady) {
      return false;
    }
    this._audioEle.loop = !this._audioEle.loop;
    return this._audioEle.loop;
  }

  switchMuted(): boolean {
    if (!this.isReady) {
      return false;
    }
    this._audioEle.muted = !this._audioEle.muted;
    return this._audioEle.muted;
  }

  setCurrentTime(value: number): void {
    if (!this.isReady) {
      return;
    }
    this._audioEle.currentTime = value;
  }

  setVolume(value: number): void {
    if (!this.isReady) {
      return;
    }
    this._audioEle.volume = value;
  }

  setStereoPan(value: number): void {
    if (!this.isReady) {
      return;
    }
    this._audioStereoPanner.pan.value = value;
  }

  get isReady(): boolean {
    return this._status !== "init";
  }

  get status(): AudioPlayerStatus {
    return this._status;
  }

  get isLoop(): boolean {
    return this._audioEle.loop;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  get currentTime(): number {
    return this._currentTime;
  }

  get duration(): number {
    return this._duration;
  }

  get volume(): number {
    return this._audioEle.volume;
  }

  get stereoPan(): number {
    return this._audioStereoPanner.pan.value;
  }

  get visualDataSet(): Uint8Array {
    return this._visualDataSet;
  }

  get refreshKey(): Ref<number> {
    return this._refreshKey;
  }

  private refresh(): void {
    this._refreshKey.value = this._refreshKey.value * -1;
  }

  private setupAudioElement(): void {
    this._audioEle.addEventListener("loadeddata", () => {
      this._isLoading = false;
      this._status = "stopped";
      this._visualDataSet = new Uint8Array();
      this._currentTime = 0;
      this.refresh();
    });
    this._audioEle.addEventListener("loadedmetadata", () => {
      this._duration = this._audioEle.duration;
      this.refresh();
    });
    this._audioEle.addEventListener("loadstart", () => {
      this._isLoading = true;
      this.refresh();
    });
    this._audioEle.addEventListener("pause", () => {
      this._status = "paused";
      this.refresh();
    });
    this._audioEle.addEventListener("play", () => {
      this._status = "playing";
      this.refresh();
    });
    this._audioEle.addEventListener("timeupdate", () => {
      this._currentTime = this._audioEle.currentTime;
      if (this._status === "stopped") {
        this._visualDataSet = new Uint8Array();
      } else if (
        this._status === "paused" &&
        this._audioEle.currentTime === 0
      ) {
        this._visualDataSet = new Uint8Array();
        this._status = "stopped";
      } else {
        const bufferLength = this._audioAnalyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this._audioAnalyser.getByteTimeDomainData(dataArray);
        this._visualDataSet = dataArray;
      }
      this.refresh();
    });
    this._audioEle.addEventListener("emptied", () => {
      this.reset();
      this.refresh();
    });
    this._audioEle.addEventListener("ended", () => {
      this._currentTime = 0;
      this._visualDataSet = new Uint8Array();
      this._status = "stopped";
      this.refresh();
    });
  }

  private initAudioGraph(): void {
    const audioSrc = this._audioCtx.createMediaElementSource(this._audioEle);
    audioSrc
      .connect(this._audioAnalyser)
      .connect(this._audioStereoPanner)
      .connect(this._audioCtx.destination);
  }
}
