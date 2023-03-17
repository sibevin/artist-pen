export class GeoLocator {
  private _coords?: GeolocationCoordinates;
  private _errorReason?: string;
  private _errorExcep?: GeolocationPositionError;
  private _status: "init" | "fetching" | "done" | "error";

  constructor() {
    this._status = "init";
    if (!navigator.geolocation) {
      this._errorReason = "not_supported";
      this._status = "error";
    }
  }

  fetch(): Promise<GeolocationCoordinates | null> {
    this._status = "fetching";
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this._coords = position.coords;
          this._status = "done";
          resolve(this._coords);
        },
        (error) => {
          this._errorReason = "error";
          this._errorExcep = error;
          reject(null);
        }
      );
    });
  }

  get status(): string {
    return this._status;
  }

  get coords(): GeolocationCoordinates | undefined {
    return this._coords;
  }

  get error(): { reason?: string; excep?: GeolocationPositionError } {
    return {
      reason: this._errorReason,
      excep: this._errorExcep,
    };
  }
}
