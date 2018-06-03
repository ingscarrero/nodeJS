import fetch from "node-fetch";
import {
  ACRCloudClient,
  Gracenote,
  spotify as spotifyClient,
  saveSampleRecord
} from "../../sampling";
import { SampleMetadata, SampleRecord } from "../../@types";

const acrCloudConfig = require("../../../config/arcCloud.json");
const gracenoteConfig = require("../../../config/gracenote.json");
const spotifyConfig = require("../../../config/spotify.json");

export class Matching {
  async match(
    url: string,
    clubId: string,
    deviceId: string
  ): Promise<SampleRecord> {
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
      let sample = await fetch(url);
      let buffer = await sample.buffer();

      //Match in ACRCloud
      let { access_key, access_secret } = acrCloudConfig;
      let acrCloudClient = new ACRCloudClient({ access_key, access_secret });

      let matches = await acrCloudClient.identify(buffer);


      if (!matches || matches.length == 0) {
        return Promise.reject(
          "E0005 - No matches were found for the provided sample. Please try again with another one with better quality, attenuated noise or longer time."
        );
      }

      let match = matches[0];
      match.matches = matches
        .map(m => ({
          album: m.album.name,
          artists: m.artists
            ? m.artists.map((a: any) => a.name).join(",")
            : "UNKNOWN ARTIST",
          title: m.title,
          genre: m.genres
            ? m.genres.map((g: any) => g.name).join(",")
            : "UNKNOWN GENRE"
        }))
        .map(
          ({ album, artists, title, genre }) =>
            `${title} by ${artists} :: ${genre}. Available at ${album}`
        )
        .join("\n");

      let identified = true;
      let {
        title,
        album,
        artists,
        external_ids,
        external_metadata,
        release_date
      } = match;

      let sampleInfo = {
        sampleUri: url,
        clubId,
        createdAt: new Date(Date.now()),
        identified,
        metadata: {
          album: album ? { name: album.name as string } : null,
          artists: artists ? artists.map((a: any) => ({ name: a.name })) : null,
          date: new Date(release_date),
          name: title as string,
          spotify:
            external_metadata && external_metadata.spotify
              ? { trackId: external_metadata.spotify.track.id }
              : null,
          external_ids
        } as SampleMetadata
      } as SampleRecord;

      // Grace Note / Music Graph Integration
      let { client_id, client_tag, user_id } = gracenoteConfig;

      let gracenoteClient = new Gracenote(client_id, client_tag, user_id);

      if (
        sampleInfo.metadata &&
        sampleInfo.metadata!.artists &&
        sampleInfo.metadata!.artists.length > 0
      ) {
        let { name } = sampleInfo.metadata!.artists[0];

        let { genre, era } = await gracenoteClient.searchTrack(
          name,
          "",
          title,
          undefined
        );

        if (genre) {
          sampleInfo.metadata!.genres = genre.map((g: any) => ({
            name: g.text
          }));
        }

        if (era) {
          sampleInfo.metadata!.era = era.map((e: any) => ({
            name: e.text
          }));
        }
      }

      // Spotify Integration

      if (sampleInfo.metadata && sampleInfo.metadata!.spotify) {
        let spotifyAPIClient = await spotifyClient(spotifyConfig);
        
        let { trackId } = sampleInfo.metadata!.spotify!;
        
        let { popularity, albumPhotoUrl, preview_url } = await spotifyAPIClient.retrieveSongDetails(trackId);
        
        sampleInfo.metadata!.spotify!.albumPhotoUrl = albumPhotoUrl;
        sampleInfo.metadata!.spotify!.popularity = popularity;
        sampleInfo.metadata!.spotify!.preview_url = preview_url;
      }


      let { id } = await saveSampleRecord(sampleInfo);
      sampleInfo.id = id;

      return sampleInfo;

    } catch (error) {
      return Promise.reject(error);
    }
  }
}
