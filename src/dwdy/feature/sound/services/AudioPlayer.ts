import { nextEntry, prevEntry } from "~/services/loopArray";
import { SoundSource, SoundTrack } from "~/dwdy/feature/sound/def";

const PLAYER_REPEAT_MODES = ["off", "all", "once"] as const;
type PlayerRepeatMode = typeof PLAYER_REPEAT_MODES[number];

export class AudioPlayer {
  private _status: "stopped" | "playing" | "paused" = "stopped";
  private _repeatMode: PlayerRepeatMode = "off";
  private _soundTracks: SoundTrack[] = [];
  private _currentTrackIndex = 0;

  get status(): string {
    return this._status;
  }

  get repeatMode(): string {
    return this._repeatMode;
  }

  get currentTrack(): SoundTrack {
    return this._soundTracks[this._currentTrackIndex];
  }

  get tracks(): SoundTrack[] {
    return this._soundTracks;
  }

  get currentTrackIndex(): number {
    return this._currentTrackIndex;
  }

  init(sources: SoundSource[], trackIndex = 0): void {
    this._status = "stopped";
    this._repeatMode = "off";
    this._soundTracks = [];
    sources.forEach((source) => {
      this._soundTracks.push(Object.assign({}, source, { duration: 0 }));
    });
    this._currentTrackIndex = trackIndex;
  }

  play(trackIndex: number | undefined = undefined): void {
    if (!this.isReady) {
      return;
    }
    if (trackIndex) {
      this._currentTrackIndex = trackIndex;
    }
    this._status = "playing";
  }

  stop(): void {
    if (!this.isReady) {
      return;
    }
    this._status = "stopped";
    this.currentTrack.duration = 0;
  }

  pause(): void {
    if (!this.isReady) {
      return;
    }
    this._status = "paused";
  }

  playNext(): void {
    if (!this.isReady) {
      return;
    }
    this._currentTrackIndex = nextEntry<number>(
      [...Array(this._soundTracks.length).keys()],
      this._currentTrackIndex
    );
    this.currentTrack.duration = 0;
    this.play();
  }

  playPrev(): void {
    if (!this.isReady) {
      return;
    }
    this._currentTrackIndex = prevEntry<number>(
      [...Array(this._soundTracks.length).keys()],
      this._currentTrackIndex
    );
    this.currentTrack.duration = 0;
    this.play();
  }

  switchRepeatMode(): void {
    this._repeatMode = nextEntry<PlayerRepeatMode>(
      PLAYER_REPEAT_MODES,
      this._repeatMode
    );
  }

  private isReady(): boolean {
    return this._soundTracks.length > 0;
  }
}
