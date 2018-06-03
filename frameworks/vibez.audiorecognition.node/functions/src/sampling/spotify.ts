import * as CryptoJS from "crypto-js";
import fetch from "node-fetch";
var spotifyClient: SpotifyClient;

export class SpotifyClient {
  isAuthorized: boolean;
  token: string;

  constructor(private config: any) {

  }
  base64EncodeCredentials(login: string, password: string) {
    let bytes = CryptoJS.enc.Utf8.parse(`${login}:${password}`);
    return CryptoJS.enc.Base64.stringify(bytes);
  }

  async retrieveSongDetails(trackId: string) {
    try {
      let headers = {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${this.token}`
      };

      let response = await fetch(`${this.config.endpoints.track}${trackId}`, {
        method: "GET",
        headers
      });

      let {
        album,
        preview_url,
        popularity,
        error,
        error_description
      } = await response.json();

      if (error) {
        console.warn(error);
        return Promise.reject(error_description);
      }

      let { images } = album;
      let image = images[0];

      return {
        albumPhotoUrl: image.url,
        popularity,
        preview_url
      };
    } catch (error) {
      console.warn(error);
      return Promise.reject(error);
    }
  }

  async refreshToken() {
    try {
      let headers = {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${this.base64EncodeCredentials(
          this.config.client_id,
          this.config.client_secret
        )}`
      };

      let response = await fetch(this.config.endpoints.auth, {
        method: "POST",
        headers,
        body: `grant_type=refresh_token&refresh_token=${this.token}`
      });
      let {
        access_token,
        expires_in,
        error,
        error_description
      } = await response.json();

      setTimeout(() => {
        this.refreshToken();
      }, parseInt(expires_in) * 1000);

      if (error) {
        throw new Error(error_description);
      }
      this.token = access_token;
      return true;
    } catch (error) {
      console.warn(error);
      return Promise.reject(error);
    }
  }
  async authenticateSpotify() {
    try {
      let basicAuthHeader = `Basic ${this.base64EncodeCredentials(
        this.config.client_id,
        this.config.client_secret
      )}`;
      let headers = {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: basicAuthHeader
      };

      let response = await fetch(this.config.endpoints.auth, {
        method: "POST",
        headers,
        body: "grant_type=client_credentials"
      });
      let {
        access_token,
        expires_in,
        error,
        error_description
      } = await response.json();

      if (error) {
        throw new Error(`Authentication error with credentials[${basicAuthHeader}]: ${error}/${error_description}`);
      }

      setTimeout(() => {
        this.refreshToken();
      }, parseInt(expires_in) * 1000);

      this.token = access_token;
      return true;
    } catch (error) {
      console.warn(error);
      return Promise.reject(error);
    }
  }
}

export async function spotify(config: any): Promise<SpotifyClient> {
  if (!spotifyClient) {
    try {
      spotifyClient = new SpotifyClient(config);
      let authorized = await spotifyClient.authenticateSpotify();
      if (!authorized) {
        let error = new Error("It wasn't possible get spotify authorization.");
        return Promise.reject(error);
      }
      return spotifyClient;
    } catch (error) {
      console.warn(error);
      return Promise.reject(error);
    }
  }
  return spotifyClient;
}
