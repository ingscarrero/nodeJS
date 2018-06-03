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
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const firebase = require("firebase");
firebase.initializeApp(functions.config().firebase);
admin.initializeApp(functions.config().firebase);
const express = require("express");
//import * as fileupload from 'express-fileupload';
const sampling_1 = require("./sampling");
//import * as multer from 'multer';
const bodyParser = require("body-parser");
const util_1 = require("./util/util");
const sample_1 = require("./sampling/sample");
const spotify_1 = require("./sampling/spotify");
const session_1 = require("./model/business/vibez/session");
const devices_1 = require("./model/business/vibez/devices");
const Mounts = require("./model/business/vibez/mounts");
const recognition_1 = require("./model/music/recognition");
//import * as formidable from 'formidable';
// CONFIGURATION FILES
const spotifyConfig = require('../config/spotify.json');
const gracenoteConfig = require('../config/gracenote.json');
const acrCloudConfig = require('../config/arcCloud.json');
const multipart = require('parse-multipart');
const asyncMiddleware = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
const asyncAuthorizedMiddleWare = (fn) => (req, res, next) => {
    Promise.resolve(asyncMiddleware(fn(req, res, next))).catch(next);
};
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//let storage = multer.memoryStorage();
//let upload = multer();
//const multer = require('multer');
//var multerupload = multer({ dest: 'fingerprints/' })
//app.use(fileupload());
//app.use(upload.any());
app.put('/api/club/:id/device/:uuid/session/:action', asyncMiddleware((req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let { body, headers, params } = req;
    let { reason = '', config = session_1.DEFAULT_CONFIG } = body;
    let { uuid = '', id = '', action = '' } = params;
    let result = undefined;
    switch (action.toUpperCase()) {
        case session_1.DEVICE_SESSION_ACTIONS.START:
            result = yield session_1.setup(id, uuid, 'START', config);
            break;
        case session_1.DEVICE_SESSION_ACTIONS.STOP:
            result = yield session_1.setup(id, uuid, 'STOP', undefined, reason);
            break;
        case session_1.DEVICE_SESSION_ACTIONS.PAUSE:
            result = yield session_1.setup(id, uuid, 'PAUSE');
            break;
        case session_1.DEVICE_SESSION_ACTIONS.RESUME:
            result = yield session_1.setup(id, uuid, 'RESUME');
            break;
        case session_1.DEVICE_SESSION_ACTIONS.COMMIT:
            result = yield session_1.setup(id, uuid, 'COMMIT');
            break;
        case session_1.DEVICE_SESSION_ACTIONS.UPDATE:
            result = yield session_1.setup(id, uuid, 'UPDATE');
            break;
        default:
            return Promise.reject(new Error('Invalid action.'));
    }
    let message = {
        action: {
            type: result.action,
            result: 'OK',
            message: result.message,
            eventTime: result.eventTime
        },
    };
    res.json(util_1.success(message));
})));
app.put('/api/club/:id/vgear/:uuid/check', asyncMiddleware((req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let { body, headers, params } = req;
    let { uuid, id } = params;
    let result = yield devices_1.check(id, uuid);
    let message = {
        action: {
            type: 'VGEAR_CHECK',
            result: result ? 'SUCCESS' : 'FAILURE',
            eventTime: new Date(Date.now())
        },
    };
    res.json(util_1.success(message));
})));
app.put('/api/club/:id/vgear/:uuid/activate', asyncMiddleware((req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let { body, headers, params } = req;
    let { uuid, id } = params;
    let ownerId = yield devices_1.activate(uuid, id);
    let message = {
        action: {
            type: 'VGEAR_ACTIVATION',
            result: { ownerId },
            eventTime: new Date(Date.now())
        },
    };
    res.json(util_1.success(message));
})));
app.put('/api/club/:id/vgear/:uuid/preactivate', asyncMiddleware((req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let { body, headers, params } = req;
    let { uuid, id } = params;
    let result = yield devices_1.preActivate(uuid, id);
    let message = {
        action: {
            type: 'VGEAR_PREACTIVATION',
            result: result ? 'SUCCESS' : 'FAILURE',
            eventTime: new Date(Date.now())
        },
    };
    res.json(util_1.success(message));
})));
app.post('/api/vgear/:uuid/register', asyncMiddleware((req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let { body, headers, params } = req;
    let { uuid } = params;
    let registrationResult = yield devices_1.register(uuid);
    let { pathSuffix, status } = yield Mounts.mountById(registrationResult.mountId);
    let message = {
        action: {
            type: 'VGEAR_REGISTRATION',
            result: {
                VGEAR: registrationResult,
                mount: {
                    pathSuffix,
                    status
                }
            },
            eventTime: new Date(Date.now())
        },
    };
    res.json(util_1.success(message));
})));
app.post('/api/mounts/register', asyncMiddleware((req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let { body, headers, params } = req;
    let result = yield Mounts.register();
    let message = {
        action: {
            type: 'MOUNT_REGISTRATION',
            result,
            eventTime: new Date(Date.now())
        },
    };
    res.json(util_1.success(message));
})));
app.put('/api/mounts/:id/vgear/:uuid/assign', asyncMiddleware((req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let { body, headers, params } = req;
    let { id, uuid } = params;
    let result = yield Mounts.assignToVGEAR(id, uuid);
    let message = {
        action: {
            type: 'VGEAR_MOUNT_ASSIGN',
            result: result ? 'SUCCESS' : 'FAILURE',
            eventTime: new Date(Date.now())
        },
    };
    res.json(util_1.success(message));
})));
// app.post('/api/audio/test', (req: Request, res: Response, next: NextFunction) => {
//     try {
//         // let form = new formidable.IncomingForm();
//         // let fields: any = {};
//         // let files = new Array<any>();
//         // console.log('Started');
//         // form.on('field', (name: string, value: any)=>{
//         //     fields[name] = value;
//         // });
//         // form.on('file', (name: string, value: File)=>{
//         //     files.push({name, value});
//         // });
//         // form.on('end',()=>{
//         //     let message = { 
//         //         action: { 
//         //             type: 'TEST SONG', 
//         //             result: 'OK', 
//         //             message: { hasSample: false, fields },
//         //             eventTime: new Date(Date.now()) 
//         //         }, 
//         //     };
//         //     res.json(success(message));
//         // });
//         // form.parse(req);
//         let { body, headers } = req; 
//         let contentTypeHeader = headers['content-type'].toString();
//         let boundary = multipart.getBoundary(contentTypeHeader);
//         let rawBody = new Buffer(body).toString();
//         let parts = multipart.Parse(rawBody, boundary) as Array<any>;
//         let partsMetadata = parts.map(p => p.filename).join(', ');
//         let message = { 
//             action: { 
//                 type: 'TEST SONG', 
//                 result: 'OK', 
//                 message: { hasSample: false, partsMetadata },
//                 eventTime: new Date(Date.now()) 
//             }, 
//         };
//         res.json(success(message));
//     } catch (error) {
//         next(error);
//     }
// });
app.post('/api/sample', (req, res, next) => {
    try {
        let { body, headers, query } = req;
        let { clubId, deviceId, sampleUrl } = Object.assign({}, body);
        let matchingClient = new recognition_1.Matching();
        matchingClient.match(sampleUrl, clubId, deviceId)
            .then((sampleInfo) => {
            let message = {
                action: {
                    type: 'IDENTIFY SONG',
                    result: 'OK',
                    message: sampleInfo,
                    eventTime: new Date(Date.now())
                },
            };
            res.json(util_1.success(message));
            return;
        }).catch(err => {
            console.warn(err);
            next(err);
        });
    }
    catch (error) {
        console.warn(error);
        next(error);
    }
});
app.post('/api/audio/identify', asyncMiddleware((req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let { body /*, files/*, headers*/ } = req;
    // if (!files) {
    //     throw new Error('E0001 - No audio samples present in the request.');
    // }
    let { clubId, deviceId, sample } = body;
    if (!clubId) {
        throw new Error('E0002 - Invalid club identifier.');
    }
    if (!deviceId) {
        throw new Error('E0003 - Invalid device identifier.');
    }
    if (!sample) {
        throw new Error('E0003 - Invalid device identifier.');
    }
    // TODO: CLUB VALIDATION
    // TODO: DEVICE VALIDATION
    // Sample storing
    //let sample = (files.sample as fileupload.UploadedFile);
    let { url } = yield sample_1.uploadSample(sample);
    // ACR Cloud integration
    let { access_key, access_secret } = acrCloudConfig;
    let acrCloudClient = new sampling_1.ACRCloudClient({ access_key, access_secret });
    let matches = yield acrCloudClient.identify(sample);
    if (!matches || matches.length == 0) {
        return Promise.reject('E0004 - No matches were found for the provided sample. Please try again with another one with better quality, attenuated noise or longer time.');
    }
    let match = matches[0];
    match.matches = matches.map(m => ({
        album: m.album.name,
        artists: m.artists ? m.artists.map((a) => a.name).join(',') : undefined,
        title: m.title,
        genre: m.genres ? m.genres.map((g) => g.name).join(',') : undefined
    })).map(({ album, artists, title, genre }) => `${title} by ${artists} :: ${genre}. Available at ${album}`).join('\n');
    let identified = true;
    let { title, album, artists, external_ids, external_metadata, release_date } = match;
    let sampleInfo = {
        sampleUri: url,
        clubId,
        createdAt: new Date(Date.now()),
        identified,
        metadata: {
            album: album ? { name: album.name } : undefined,
            artists: artists ? artists.map(({ name = 'Unknown' }) => ({ name })) : undefined,
            date: release_date ? new Date(release_date) : undefined,
            name: title,
            spotify: external_metadata && external_metadata.spotify ? { trackId: external_metadata.spotify.track.id } : undefined,
            external_ids
        },
    };
    // Grace Note / Music Graph Integration
    let { client_id, client_tag, user_id } = gracenoteConfig;
    let gracenoteClient = new sampling_1.Gracenote(client_id, client_tag, user_id);
    let { genre, era } = yield gracenoteClient.searchTrack(artists[0].name, "", name, undefined);
    sampleInfo.metadata.genres = genre.map(({ id = 'unknown', text = 'unknown' }) => ({ id, name: text }));
    sampleInfo.metadata.era = era.map(({ id = 'unknown', text = 'unknown' }) => ({ id, name: text }));
    // Spotify Integration
    if (sampleInfo.metadata.spotify) {
        let spotifyAPIClient = yield spotify_1.spotify(spotifyConfig);
        let { popularity, albumPhotoUrl, preview_url } = yield spotifyAPIClient.retrieveSongDetails(sampleInfo.metadata.spotify.trackId);
        sampleInfo.metadata.spotify.albumPhotoUrl = albumPhotoUrl;
        sampleInfo.metadata.spotify.popularity = popularity;
        sampleInfo.metadata.spotify.preview_url = preview_url;
    }
    // Register Sample Information        
    let { id } = yield sample_1.saveSampleRecord(sampleInfo);
    sampleInfo.id = id;
    let message = {
        action: {
            type: 'IDENTIFY SONG',
            result: 'OK',
            sample: sample,
            eventTime: new Date(Date.now())
        },
    };
    res.json(util_1.success(message));
})));
// app.post('/api/audio/samples', (req: Request, res: Response, next: NextFunction) => {
//     try {
//         let { body/*, query, params*/, files } = req;
//         let { client_id, client_tag, user_id } = gracenoteConfig;
//         if (!files) {
//             throw new Error('No files uploaded');
//         }
//         let file = (files.sample as fileupload.UploadedFile);
//         uploadSample(file).then( async ({ url }) => {
//             let { 
//                 identified, 
//                 album, 
//                 artists,
//                 //genres, 
//                 date,
//                 spotify,
//                 name, 
//             } = body;
//             let gracenoteClient = new Gracenote(
//                 client_id, 
//                 client_tag, 
//                 user_id
//             );
//             let { genre, era } = await gracenoteClient.searchTrack(artists[0].name, "", name, undefined);
//             let record = { 
//                 createdAt: new Date(Date.now()),
//                 sampleUri: url,
//                 identified: identified,
//                 metadata: identified ? {
//                     album,
//                     artists,
//                     genres: genre.map(({id, text})=>({id, name: text})),
//                     name,
//                     date,
//                     spotify,
//                     era 
//                 } as SampleMetadata: undefined
//             } as SampleRecord;
//             return  saveSampleRecord(record);
//         }).then(({id})=>{
//             let message = { 
//                 action: { 
//                     type: 'UPLOAD_SAMPLE', 
//                     result: 'OK', 
//                     sampleRecordID: id,
//                     eventTime: new Date(Date.now()) 
//                 }, 
//             };
//             res.json(success(message));
//         }).catch(err=>{
//             next(err);
//         });
//     } catch (err) {
//         next(err);
//     }
// });
app.get('/api/audio/samples', (req, res, next) => {
    try {
        let { query, params } = req;
        sample_1.fetchSampleRecords({ query, params }).then(records => {
            let message = {
                action: {
                    type: 'FETCH_SAMPLES',
                    result: 'OK',
                    samples: records,
                    eventTime: new Date(Date.now())
                },
            };
            res.json(util_1.success(message));
        }).catch(err => {
            next(err);
        });
    }
    catch (err) {
        next(err);
    }
});
app.get('/api/audio/spotify/:id', (req, res, next) => {
    try {
        let { params } = req;
        let { id } = params;
        spotify_1.spotify(spotifyConfig).then((spotify) => {
            return spotify.retrieveSongDetails(id);
        }).then(result => {
            let message = {
                action: {
                    type: 'GET_TRACK_DETAILS',
                    result: 'OK',
                    trackInfo: result,
                    eventTime: new Date(Date.now())
                },
            };
            res.json(util_1.success(message));
        });
    }
    catch (err) {
        next(err);
    }
});
app.get('/api/audio/gracenote/find', (req, res, next) => {
    try {
        let { query } = req;
        let { artist_name, song_title } = query;
        let { client_id, client_tag, user_id } = gracenoteConfig;
        let gracenoteClient = new sampling_1.Gracenote(client_id, client_tag, user_id);
        gracenoteClient.searchTrack(artist_name, "", song_title, undefined).then(songData => {
            let message = {
                action: {
                    type: 'GET_TRACK_METADATA',
                    result: 'OK',
                    trackInfo: songData,
                    eventTime: new Date(Date.now())
                }
            };
            res.json(util_1.success(message));
        });
    }
    catch (err) {
        next(err);
    }
});
app.use((req, res, next) => {
    var err = new Error(`[${req.path}] Not Found`);
    err.status = 404;
    res.writeHead(404, 'Not Found');
    next(err);
});
// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    // res.locals.message = err.message;
    // res.locals.error = req.app.get('env') === 'development' ? err : {};
    if (req) {
        console.log(req.path);
    }
    if (next) {
        console.log('Error handled in Error Handler');
    }
    try {
        let message = util_1.error(209, err, `It wasn't possible to handle the request.`, err.message);
        res.json(message);
    }
    catch (error) {
        res.json({ code: 0, message: 'NO DATA', error });
    }
    // render the error page    
    // res.status(err.status || 500);
    // res.render('error');
});
exports.default = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map