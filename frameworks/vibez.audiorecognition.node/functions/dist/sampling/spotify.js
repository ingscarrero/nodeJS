"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const CryptoJS = require("crypto-js");
const node_fetch_1 = require("node-fetch");
var spotifyClient;
class SpotifyClient {
    constructor(config) {
        this.config = config;
    }
    base64EncodeCredentials(login, password) {
        let bytes = CryptoJS.enc.Utf8.parse(`${login}:${password}`);
        return CryptoJS.enc.Base64.stringify(bytes);
    }
    retrieveSongDetails(trackId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let headers = {
                    Accept: "application/json",
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: `Bearer ${this.token}`
                };
                let response = yield node_fetch_1.default(`${this.config.endpoints.track}${trackId}`, {
                    method: "GET",
                    headers
                });
                let { album, preview_url, popularity, error, error_description } = yield response.json();
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
            }
            catch (error) {
                console.warn(error);
                return Promise.reject(error);
            }
        });
    }
    refreshToken() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let headers = {
                    Accept: "application/json",
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: `Basic ${this.base64EncodeCredentials(this.config.client_id, this.config.client_secret)}`
                };
                let response = yield node_fetch_1.default(this.config.endpoints.auth, {
                    method: "POST",
                    headers,
                    body: `grant_type=refresh_token&refresh_token=${this.token}`
                });
                let { access_token, expires_in, error, error_description } = yield response.json();
                setTimeout(() => {
                    this.refreshToken();
                }, parseInt(expires_in) * 1000);
                if (error) {
                    throw new Error(error_description);
                }
                this.token = access_token;
                return true;
            }
            catch (error) {
                console.warn(error);
                return Promise.reject(error);
            }
        });
    }
    authenticateSpotify() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let basicAuthHeader = `Basic ${this.base64EncodeCredentials(this.config.client_id, this.config.client_secret)}`;
                let headers = {
                    Accept: "application/json",
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: basicAuthHeader
                };
                let response = yield node_fetch_1.default(this.config.endpoints.auth, {
                    method: "POST",
                    headers,
                    body: "grant_type=client_credentials"
                });
                let { access_token, expires_in, error, error_description } = yield response.json();
                if (error) {
                    throw new Error(`Authentication error with credentials[${basicAuthHeader}]: ${error}/${error_description}`);
                }
                setTimeout(() => {
                    this.refreshToken();
                }, parseInt(expires_in) * 1000);
                this.token = access_token;
                return true;
            }
            catch (error) {
                console.warn(error);
                return Promise.reject(error);
            }
        });
    }
}
exports.SpotifyClient = SpotifyClient;
function spotify(config) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!spotifyClient) {
            try {
                spotifyClient = new SpotifyClient(config);
                let authorized = yield spotifyClient.authenticateSpotify();
                if (!authorized) {
                    let error = new Error("It wasn't possible get spotify authorization.");
                    return Promise.reject(error);
                }
                return spotifyClient;
            }
            catch (error) {
                console.warn(error);
                return Promise.reject(error);
            }
        }
        return spotifyClient;
    });
}
exports.spotify = spotify;
//# sourceMappingURL=spotify.js.map