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
const xml2js_1 = require("xml2js");
const cache = require("memory-cache");
const node_fetch_1 = require("node-fetch");
const API_URL = 'https://c[[CLID]].web.cddbp.net/webapi/xml/1.0/';
const UNABLE_TO_PARSE_RESPONSE = 1; // The response couldn't be parsed. Maybe an error, or maybe the API changed.
const API_RESPONSE_ERROR = 1000; // There was a GN error code returned in the response.
const API_NO_MATCH = 1001; // The API returned a NO_MATCH (i.e. there were no results).
const API_NON_OK_RESPONSE = 1002; // There was some unanticipated non-"OK" response from the API.
const HTTP_REQUEST_ERROR = 2000; // An uncaught exception was raised while doing a cURL request.
const HTTP_REQUEST_TIMEOUT = 2001; // The external request timed out.
const HTTP_RESPONSE_ERROR_CODE = 2002; // There was a HTTP 400 error code returned.
const HTTP_RESPONSE_ERROR = 2003; // A cURL error that wasn't a timeout or HTTP400 response.
const INVALID_INPUT_SPECIFIED = 3000; // Some input the user gave wasn't valid.
const RANGE_NOT_VALID = 4000;
const BEST_MATCH_ONLY = 0;
const ALL_RESULTS = 1;
const MESSAGES = {
    // Generic Errors
    1: "Unable to parse response from Gracenote WebAPI.",
    // Specific API Errors
    1000: "The API returned an error code.",
    1001: "The API returned no results.",
    1002: "The API returned an unacceptable response.",
    // HTTP Errors
    2000: "There was an error while performing an external request.",
    2001: "Request to a Gracenote WebAPI timed out.",
    2002: "WebAPI response had a HTTP error code.",
    2003: "cURL returned an error when trying to make the request.",
    // Input Errors
    3000: "Invalid input.",
    4000: "Range was not valid (needs start & end)"
};
function GraceError(code, msg) {
    if (typeof msg !== 'undefined' && msg != null && msg !== '')
        msg = ' | ' + msg;
    else
        msg = '';
    var err = new Error(MESSAGES[code] + msg);
    //GraceError.super_.apply(this, arguments);
    err.statusCode = code;
    return err;
}
;
class Gracenote {
    constructor(clientId, clientTag, userId) {
        // if (requestDefaults){
        //     request = request.defaults(requestDefaults); 
        // }
        this.clientId = clientId;
        this.clientTag = clientTag;
        this.userId = userId;
        this.coverSize = 'MEDIUM';
        this.extendedData = 'COVER,REVIEW,ARTIST_BIOGRAPHY,ARTIST_IMAGE,ARTIST_OET,MOOD,TEMPO'; //COVER,REVIEW,ARTIST_BIOGRAPHY,ARTIST_IMAGE,ARTIST_OET,MOOD,TEMPO
        if (clientId === null || typeof clientId === 'undefined' || clientId === '') {
            throw GraceError(INVALID_INPUT_SPECIFIED, 'clientId');
        }
        if (clientTag === null || typeof clientTag === 'undefined' || clientTag === '') {
            throw GraceError(INVALID_INPUT_SPECIFIED, 'clientTag');
        }
        if (typeof userId === 'undefined' || userId === '') {
            if (cache.get('Gracenote.userId')) {
                userId = cache.get('Gracenote.userId');
            }
            else {
                this.userId = undefined;
            }
        }
        this.apiURL = API_URL.replace('[[CLID]]', clientId);
    }
    performRequest(body) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let headers = {
                    'User-Agent': 'nodejs-gracenote'
                };
                let response = yield node_fetch_1.default(this.apiURL, {
                    body,
                    method: 'POST',
                    headers
                });
                let result = yield response.text();
                return result;
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    formatXML(response) {
        response = response.replace(/\r\n+|\r\n|\n+|\n|\s+|\s$/, '');
        return response;
    }
    execute(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let response = yield this.performRequest(data);
                return response;
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    ;
    constructQueryRequest(body, command = 'ALBUM_SEARCH') {
        let request = `<QUERIES>
                <AUTH>
                    <CLIENT>${this.clientId}-${this.clientTag}</CLIENT>
                    <USER>${this.userId}</USER>
                </AUTH>
                ${this.lang ? `<LANG>${this.lang}</LANG>` : ''}
                <QUERY CMD="${command}">
                    ${body}
                </QUERY>
            </QUERIES>`;
        return request;
    }
    ;
    constructQueryBody(artist = '', album = '', track = '', gn_id = '', options = { matchMode: ALL_RESULTS }, command = 'ALBUM_SEARCH') {
        var body = "";
        if (command === 'ALBUM_FETCH') {
            body += `<GN_ID>${gn_id}</GN_ID>`;
        }
        else {
            if (options.matchMode === BEST_MATCH_ONLY) {
                body += '<MODE>SINGLE_BEST_COVER</MODE>';
            }
            if (options.hasOwnProperty('range')) {
                var range = options.range;
                if (!range.hasOwnProperty('start') || !range.hasOwnProperty('end')) {
                    throw GraceError(RANGE_NOT_VALID, 'clientTag');
                }
                body += `<RANGE>
                    <START>${options.range.start}</START>
                    <END>${options.range.end}</END>
                </RANGE>`;
            }
            if (artist != "") {
                body += `<TEXT TYPE="ARTIST">${artist}</TEXT>`;
            }
            if (track != "") {
                body += `<TEXT TYPE="TRACK_TITLE">${track}</TEXT>`;
            }
            if (album != "") {
                body += `<TEXT TYPE="ALBUM_TITLE">${album}</TEXT>`;
            }
        }
        body += `<OPTION>
                    <PARAMETER>SELECT_EXTENDED</PARAMETER>
                        <VALUE>${this.extendedData}</VALUE>
                </OPTION>`;
        body += `<OPTION>
                    <PARAMETER>SELECT_DETAIL</PARAMETER>
                        <VALUE>GENRE:3LEVEL,ARTIST_ORIGIN:4LEVEL,ARTIST_ERA:2LEVEL,ARTIST_TYPE:2LEVEL
                    </VALUE>
                </OPTION>`;
        // (LARGE,XLARGE,SMALL,MEDIUM,THUMBNAIL)
        body += `<OPTION>
                    <PARAMETER>COVER_SIZE</PARAMETER>
                    <VALUE>${this.coverSize}</VALUE>
                </OPTION>`;
        return body;
    }
    checkResponse(response, cb) {
        response = this.formatXML(response);
        xml2js_1.parseString(response, function (err, xml) {
            if (err !== null)
                throw GraceError(UNABLE_TO_PARSE_RESPONSE, '');
            var status = xml.RESPONSES.RESPONSE[0].$.STATUS;
            switch (status) {
                case "ERROR":
                    throw GraceError(API_RESPONSE_ERROR, xml.RESPONSES.MESSAGE[0]);
                case "NO_MATCH":
                    throw GraceError(API_NO_MATCH, '');
                default:
                    if (status !== "OK") {
                        throw GraceError(API_NON_OK_RESPONSE, status);
                    }
            }
            cb(xml.RESPONSES);
        });
    }
    parseResponse(response, cb) {
        response = this.formatXML(response);
        xml2js_1.parseString(response, (err, xml) => {
            if (err !== null) {
                throw GraceError(UNABLE_TO_PARSE_RESPONSE, '');
            }
            try {
                this.checkResponse(response, () => {
                    var output = [], entries = xml.RESPONSES.RESPONSE[0].ALBUM;
                    for (var i = 0; i < entries.length; i++) {
                        var entry = entries[i];
                        var obj = {
                            "album_gnid": entry.GN_ID[0],
                            'album_artist_name': entry.ARTIST[0],
                            'album_title': entry.TITLE[0],
                            'album_year': '',
                            'genre': this.getOETElem(entry.GENRE),
                            'album_art_url': '',
                            'artist_image_url': '',
                            'artist_bio_url': '',
                            'review_url': '',
                            'artist_era': '',
                            'artist_type': '',
                            'artist_origin': '',
                            'tracks': new Array()
                        };
                        if (entry.DATE) {
                            obj.album_year = entry.DATE[0];
                        }
                        if (entry.URL) {
                            obj.album_art_url = this.getAttribElem(entry.URL, "TYPE", "COVERART"),
                                obj.artist_image_url = this.getAttribElem(entry.URL, "TYPE", "ARTIST_IMAGE"),
                                obj.artist_bio_url = this.getAttribElem(entry.URL, "TYPE", "ARTIST_BIOGRAPHY"),
                                obj.review_url = this.getAttribElem(entry.URL, "TYPE", "REVIEW");
                        }
                        if (entry.ARTIST_ORIGIN) {
                            obj.artist_era = this.getOETElem(entry.ARTIST_ERA);
                            obj.artist_type = this.getOETElem(entry.ARTIST_TYPE);
                            obj.artist_origin = this.getOETElem(entry.ARTIST_ORIGIN);
                        }
                        else {
                            // NOT A GOOD APROACH TO ASK AN ASYNC CALL
                            //me.fetchOETData(entry.GN_ID[0], function(data) {
                            //	console.log("CALLBACK",data);
                            //})
                        }
                        var tracks = [];
                        if (entry.TRACK) {
                            for (var x = 0; x < entry.TRACK.length; x++) {
                                var t = entry.TRACK[x];
                                var track = {
                                    'track_number': t.TRACK_NUM[0],
                                    'track_gnid': t.GN_ID[0],
                                    'track_title': t.TITLE[0],
                                    'mood': '',
                                    'tempo': '',
                                    'track_artist_name': ''
                                };
                                if (t.MOOD) {
                                    track.mood = this.getOETElem(t.MOOD);
                                }
                                if (t.TEMPO) {
                                    track.tempo = this.getOETElem(t.TEMPO);
                                }
                                if (!t.ARTIST) {
                                    track.track_artist_name = obj.album_artist_name;
                                }
                                else {
                                    track.track_artist_name = t.ARTIST[0];
                                }
                                if (t.GENRE) {
                                    obj.genre = this.getOETElem(t.GENRE);
                                }
                                if (t.ARTIST_ERA) {
                                    obj.artist_era = this.getOETElem(t.ARTIST_ERA);
                                }
                                if (t.ARTIST_TYPE) {
                                    obj.artist_type = this.getOETElem(t.ARTIST_TYPE);
                                }
                                if (t.ARTIST_ORIGIN) {
                                    obj.artist_origin = this.getOETElem(t.ARTIST_ORIGIN);
                                }
                                tracks.push(track);
                            }
                        }
                        obj.tracks = tracks;
                        output.push(obj);
                    }
                    cb(null, output);
                });
            }
            catch (err) {
                if (err.statusCode == API_NO_MATCH)
                    return cb(null, []);
                cb(err.message);
            }
        });
    }
    getAttribElem(root, attribute, value) {
        for (var i = 0; i < root.length; i++) {
            var r = root[i];
            if (r.$[attribute] == value) {
                return r._;
            }
        }
        return '';
    }
    getOETElem(root) {
        if (root) {
            var out = [];
            for (var i = 0; i < root.length; i++) {
                var r = root[i];
                out.push({
                    'id': r.$.ID,
                    'text': r._,
                });
            }
            return out;
        }
        return '';
    }
    getAlbumDetails(gnId, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var body = this.constructQueryBody('', '', '', gnId, options, 'ALBUM_FETCH');
            let data = this.constructQueryRequest(body, 'ALBUM_FETCH');
            let response = yield this.execute(data);
            var parsingPromise = new Promise((resolve, reject) => {
                this.parseResponse(response, (err, info) => {
                    if (err) {
                        reject(err);
                    }
                    if (info && info.length > 0) {
                        resolve(info);
                    }
                    else {
                        reject(new Error(`There were no album information for album with ID: [${gnId}].`));
                    }
                });
            });
            let info = yield parsingPromise;
            return info;
        });
    }
    searchTrack(artistName, albumTitle, trackTitle, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var body = this.constructQueryBody(artistName, albumTitle, trackTitle, "", options);
            let data = this.constructQueryRequest(body);
            let result = yield this.execute(data);
            var parsingPromise = new Promise((resolve, reject) => {
                this.parseResponse(result, (err, info) => __awaiter(this, void 0, void 0, function* () {
                    if (err) {
                        reject(err);
                    }
                    if (info && info.length > 0) {
                        let { album_gnid } = info[0];
                        let albumDetails = yield this.getAlbumDetails(album_gnid, options);
                        let { genre, album_art_url, album_title, album_year, artist_era, album_artist_name } = albumDetails[0];
                        let trackDetails = {
                            year: album_year,
                            genre,
                            era: artist_era,
                            artist: album_artist_name,
                            title: trackTitle,
                            album: album_title,
                            coverUrl: album_art_url
                        };
                        resolve(trackDetails);
                    }
                    else {
                        reject(new Error(`There were no matches for ${trackTitle} by ${artistName}${albumTitle ? " on " + albumTitle : ""}.`));
                    }
                }));
            });
            let trackInfo = yield parsingPromise;
            return trackInfo;
        });
    }
    fetchOETData(gn_id) {
        return __awaiter(this, void 0, void 0, function* () {
            var body = '<GN_ID>' + gn_id + '</GN_ID>' +
                '<OPTION>' +
                '<PARAMETER>SELECT_EXTENDED</PARAMETER>' +
                '<VALUE>' + this.extendedData + '</VALUE>' +
                '</OPTION>' +
                '<OPTION>' +
                '<PARAMETER>SELECT_DETAIL</PARAMETER>' +
                '<VALUE>ARTIST_ORIGIN:4LEVEL,ARTIST_ERA:2LEVEL,ARTIST_TYPE:2LEVEL</VALUE>' +
                '</OPTION>';
            let data = this.constructQueryRequest(body);
            let result = yield this.performRequest(data);
            this.checkResponse(result, (xml) => {
                let output = {
                    'artist_origin': (xml.RESPONSE[0].ALBUM[0].ARTIST_ORIGIN[0]) ? this.getOETElem(xml.RESPONSE[0].ALBUM[0].ARTIST_ORIGIN[0]) : "",
                    'artist_era': (xml.RESPONSE[0].ALBUM[0].ARTIST_ERA[0]) ? this.getOETElem(xml.RESPONSE[0].ALBUM[0].ARTIST_ERA[0]) : "",
                    'artist_type': (xml.RESPONSE[0].ALBUM[0].ARTIST_TYPE[0]) ? this.getOETElem(xml.RESPONSE[0].ALBUM[0].ARTIST_TYPE[0]) : ""
                };
                return Promise.resolve(output);
            });
        });
    }
    ;
}
exports.Gracenote = Gracenote;
// Gracenote.prototype.searchTrack = function(artistName, albumTitle, trackTitle, cb, options) {
// 	var body = this._constructQueryBody(artistName, albumTitle, trackTitle, "", "ALBUM_SEARCH", options),
//     	data = this._constructQueryRequest(body);
//     this._execute(data, cb);
// };
// Gracenote.prototype.searchArtist = function(artistName, cb, options) {
// 	this.searchTrack(artistName, "", "", cb, options);
// };
// Gracenote.prototype.searchAlbum = function(artistName, albumTitle, cb, options) {
// 	this.searchTrack(artistName, albumTitle, "", cb, options);
// };
// Gracenote.prototype.fetchAlbum = function(gn_id, cb) {
// 	var body = this._constructQueryBody("", "", "", gn_id, "ALBUM_FETCH");
//     var data = this._constructQueryRequest(body, "ALBUM_FETCH");
//     this._execute(data, cb);
// };
// Gracenote.prototype.setExtended = function(str) {
// 	this._extendedData = str; 
// };
// Gracenote.prototype.setLanguage = function(iso) {
// 	this._lang = iso; 
// };
// Gracenote.prototype.setCoverSize = function(size) {
// 	this._coverSize = size; 
// };
// Gracenote.prototype.albumToc = function(toc, cb) {
// 	var body = '<TOC><OFFSETS>' + toc + '</OFFSETS></TOC>';
//     var data = this._constructQueryRequest(body, "ALBUM_TOC");
//     this._execute(data, cb);
// };
//# sourceMappingURL=graceNote.js.map