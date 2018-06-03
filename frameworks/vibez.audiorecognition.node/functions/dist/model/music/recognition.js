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
const node_fetch_1 = require("node-fetch");
const sampling_1 = require("../../sampling");
const acrCloudConfig = require("../../../config/arcCloud.json");
const gracenoteConfig = require("../../../config/gracenote.json");
const spotifyConfig = require("../../../config/spotify.json");
class Matching {
    match(url, clubId, deviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!url || url.length == 0) {
                    throw new Error("E0001 - No audio samples present in the request.");
                }
                if (!clubId || clubId.length == 0) {
                    throw new Error("E0002 - Invalid club identifier.");
                }
                if (!deviceId || deviceId.length == 0) {
                    throw new Error("E0003 - Invalid device identifier.");
                }
                //TODO: Club and device identification.
                //Fetch Sample
                let sample = yield node_fetch_1.default(url);
                let buffer = yield sample.buffer();
                //Match in ACRCloud
                let { access_key, access_secret } = acrCloudConfig;
                let acrCloudClient = new sampling_1.ACRCloudClient({ access_key, access_secret });
                let matches = yield acrCloudClient.identify(buffer);
                if (!matches || matches.length == 0) {
                    return Promise.reject("E0005 - No matches were found for the provided sample. Please try again with another one with better quality, attenuated noise or longer time.");
                }
                let match = matches[0];
                match.matches = matches
                    .map(m => ({
                    album: m.album.name,
                    artists: m.artists
                        ? m.artists.map((a) => a.name).join(",")
                        : "UNKNOWN ARTIST",
                    title: m.title,
                    genre: m.genres
                        ? m.genres.map((g) => g.name).join(",")
                        : "UNKNOWN GENRE"
                }))
                    .map(({ album, artists, title, genre }) => `${title} by ${artists} :: ${genre}. Available at ${album}`)
                    .join("\n");
                let identified = true;
                let { title, album, artists, external_ids, external_metadata, release_date } = match;
                let sampleInfo = {
                    sampleUri: url,
                    clubId,
                    createdAt: new Date(Date.now()),
                    identified,
                    metadata: {
                        album: album ? { name: album.name } : null,
                        artists: artists ? artists.map((a) => ({ name: a.name })) : null,
                        date: new Date(release_date),
                        name: title,
                        spotify: external_metadata && external_metadata.spotify
                            ? { trackId: external_metadata.spotify.track.id }
                            : null,
                        external_ids
                    }
                };
                // Grace Note / Music Graph Integration
                let { client_id, client_tag, user_id } = gracenoteConfig;
                let gracenoteClient = new sampling_1.Gracenote(client_id, client_tag, user_id);
                if (sampleInfo.metadata &&
                    sampleInfo.metadata.artists &&
                    sampleInfo.metadata.artists.length > 0) {
                    let { name } = sampleInfo.metadata.artists[0];
                    let { genre, era } = yield gracenoteClient.searchTrack(name, "", title, undefined);
                    if (genre) {
                        sampleInfo.metadata.genres = genre.map((g) => ({
                            name: g.text
                        }));
                    }
                    if (era) {
                        sampleInfo.metadata.era = era.map((e) => ({
                            name: e.text
                        }));
                    }
                }
                // Spotify Integration
                if (sampleInfo.metadata && sampleInfo.metadata.spotify) {
                    let spotifyAPIClient = yield sampling_1.spotify(spotifyConfig);
                    let { trackId } = sampleInfo.metadata.spotify;
                    let { popularity, albumPhotoUrl, preview_url } = yield spotifyAPIClient.retrieveSongDetails(trackId);
                    sampleInfo.metadata.spotify.albumPhotoUrl = albumPhotoUrl;
                    sampleInfo.metadata.spotify.popularity = popularity;
                    sampleInfo.metadata.spotify.preview_url = preview_url;
                }
                let { id } = yield sampling_1.saveSampleRecord(sampleInfo);
                sampleInfo.id = id;
                return sampleInfo;
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
}
exports.Matching = Matching;
//# sourceMappingURL=recognition.js.map