import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as firebase from 'firebase';
firebase.initializeApp(functions.config().firebase!);
admin.initializeApp(functions.config().firebase!);



import * as express from 'express';
//import * as fileupload from 'express-fileupload';
import { Gracenote, ACRCloudClient } from './sampling';
import { NextFunction, Request, Response, RequestHandler } from 'express';
//import * as multer from 'multer';
import * as bodyParser from 'body-parser';
import { success, error } from './util/util';
import { saveSampleRecord, uploadSample, fetchSampleRecords } from './sampling/sample';
import { spotify as spotifyClient } from './sampling/spotify';
import { 
    SampleMetadata, 
    SampleRecord, 
    IdentifyRequest 
} from './@types';
import { DeviceSessionAction, SessionConfiguration, DEVICE_SESSION_ACTIONS, DEVICE_SESSION_STATUSES, DEFAULT_CONFIG, setup, Device, Session, SessionRecurrence } from './model/business/vibez/session';
import { check, activate, listAll, listByOwner, DEFAULT_VGEAR, DEVICE_STATUSES, preActivate, DeviceStatus, register, VGEAR } from './model/business/vibez/devices';

import * as Mounts from './model/business/vibez/mounts';

import { Matching } from './model/music/recognition';

//import * as formidable from 'formidable';

// CONFIGURATION FILES

const spotifyConfig = require('../config/spotify.json');
const gracenoteConfig = require('../config/gracenote.json');
const acrCloudConfig = require('../config/arcCloud.json');
const multipart = require('parse-multipart');

const asyncMiddleware = (fn: RequestHandler) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

const asyncAuthorizedMiddleWare = (fn: RequestHandler) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(asyncMiddleware(fn(req, res, next))).catch(next);
  };

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//let storage = multer.memoryStorage();
//let upload = multer();

//const multer = require('multer');
//var multerupload = multer({ dest: 'fingerprints/' })

//app.use(fileupload());


//app.use(upload.any());


app.put('/api/club/:id/device/:uuid/session/:action', asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    let { body, headers, params } = req;
    let { reason = '', config = DEFAULT_CONFIG } = body;
        let { uuid = '', id = '', action = '' } = params;
        let result : any = undefined; 
        switch (action.toUpperCase()) {
            case DEVICE_SESSION_ACTIONS.START:
                result = await setup(id, uuid, 'START', config);
                break;
            case DEVICE_SESSION_ACTIONS.STOP:
                result = await setup(id, uuid, 'STOP', undefined, reason);
                break;
            case DEVICE_SESSION_ACTIONS.PAUSE:
                result = await setup(id, uuid, 'PAUSE');
                break;
            case DEVICE_SESSION_ACTIONS.RESUME:
                result = await setup(id, uuid, 'RESUME');
                break;
            case DEVICE_SESSION_ACTIONS.COMMIT:
                result = await setup(id, uuid, 'COMMIT');
                break;
            case DEVICE_SESSION_ACTIONS.UPDATE:
                result = await setup(id, uuid, 'UPDATE');
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
        res.json(success(message));
}));

app.put('/api/club/:id/vgear/:uuid/check', asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    let { body, headers, params } = req;
        let { uuid, id } = params;

        let result = await check(id, uuid);
        let message = { 
            action: { 
                type: 'VGEAR_CHECK', 
                result: result ? 'SUCCESS' : 'FAILURE', 
                eventTime: new Date(Date.now()) 
            }, 
        };  
        res.json(success(message)); 
        

        
}));

app.put('/api/club/:id/vgear/:uuid/activate',asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    let { body, headers, params } = req;
        let { uuid, id } = params;
        let ownerId = await activate(uuid, id);
        let message = { 
            action: { 
                type: 'VGEAR_ACTIVATION', 
                result: { ownerId }, 
                eventTime: new Date(Date.now()) 
            }, 
        };
        res.json(success(message));
}));

app.put('/api/club/:id/vgear/:uuid/preactivate',asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    let { body, headers, params } = req;
    let { uuid, id } = params;
    let result = await preActivate(uuid, id);
    let message = { 
        action: { 
            type: 'VGEAR_PREACTIVATION', 
            result: result ? 'SUCCESS' : 'FAILURE', 
            eventTime: new Date(Date.now()) 
        }, 
    };
    res.json(success(message));
}));

app.post('/api/vgear/:uuid/register', asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    let { body, headers, params } = req;
        let { uuid } = params;
        let registrationResult = await register(uuid);

        let { pathSuffix, status } = await Mounts.mountById(registrationResult.mountId!);

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
        res.json(success(message));
}));

app.post('/api/mounts/register', asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    let { body, headers, params } = req;
        let result = await Mounts.register();
        let message = { 
            action: { 
                type: 'MOUNT_REGISTRATION', 
                result, 
                eventTime: new Date(Date.now()) 
            }, 
        };
        res.json(success(message));
}));

app.put('/api/mounts/:id/vgear/:uuid/assign',asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    let { body, headers, params } = req;
        let { id, uuid } = params;
        let result = await Mounts.assignToVGEAR(id, uuid);
        let message = { 
            action: { 
                type: 'VGEAR_MOUNT_ASSIGN', 
                result: result ? 'SUCCESS' : 'FAILURE', 
                eventTime: new Date(Date.now()) 
            }, 
        };
        res.json(success(message));
}));

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

app.post('/api/sample', (req: Request, res: Response, next: NextFunction)=>{
    try {
        let { body, headers, query } = req;
        let { clubId, deviceId, sampleUrl } = Object.assign<{}, IdentifyRequest>({}, body);


        let matchingClient = new Matching();

        matchingClient.match(sampleUrl, clubId, deviceId)
        .then((sampleInfo)=>{
            let message = { 
                action: { 
                    type: 'IDENTIFY SONG', 
                    result: 'OK', 
                    message: sampleInfo,
                    eventTime: new Date(Date.now()) 
                }, 
            };
            res.json(success(message));
            return;
        }).catch(err=>{
            console.warn(err);
            next(err as Error);
        })
    } catch (error) {
        console.warn(error);
        next(error as Error);
    }
})

app.post('/api/audio/identify', asyncMiddleware(async (req: Request, res: Response, next: NextFunction) =>{
        let { body/*, files/*, headers*/ } = req;
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
        let { url } = await uploadSample(sample);

        
        // ACR Cloud integration
        let { access_key, access_secret } = acrCloudConfig;
        let acrCloudClient = new ACRCloudClient({ access_key, access_secret });

        let matches = await acrCloudClient.identify(sample);
        if (!matches || matches.length == 0) {
            return Promise.reject('E0004 - No matches were found for the provided sample. Please try again with another one with better quality, attenuated noise or longer time.');
        }

        let match = matches[0];
        match.matches = matches.map(m=>({
            album: m.album.name, 
            artists: m.artists ? m.artists.map((a:any)=>a.name).join(',') : undefined, 
            title: m.title, 
            genre: m.genres ? m.genres.map((g:any)=>g.name).join(',') : undefined
          })).map(({album, artists, title, genre})=>`${title} by ${artists} :: ${genre}. Available at ${album}`).join('\n');

        let identified = true;
        let { title, album, artists, external_ids, external_metadata, release_date } = match;

        let sampleInfo = { 
            sampleUri: url,
            clubId,
            createdAt: new Date(Date.now()),
            identified,
            metadata: {
                album: album ? { name: album.name } : undefined,
                artists: artists ? artists.map(({name = 'Unknown'})=>({name})) : undefined,
                date: release_date ? new Date(release_date) : undefined,
                name: title,
                spotify: external_metadata && external_metadata.spotify ? { trackId: external_metadata.spotify.track.id } : undefined,
                external_ids
            } as SampleMetadata,

         } as SampleRecord;

        // Grace Note / Music Graph Integration
        let { client_id, client_tag, user_id } = gracenoteConfig;

        let gracenoteClient = new Gracenote(
            client_id, 
            client_tag, 
            user_id
        );

        let { genre, era } = await gracenoteClient.searchTrack(artists[0].name, "", name, undefined);

        sampleInfo.metadata!.genres = genre.map(({id='unknown', text='unknown'})=>({id, name: text}));
        sampleInfo.metadata!.era = era.map(({id='unknown', text='unknown'})=>({id, name: text}));

        // Spotify Integration

        if (sampleInfo.metadata!.spotify) {
            let spotifyAPIClient = await spotifyClient(spotifyConfig);
            let { popularity, albumPhotoUrl, preview_url } = await spotifyAPIClient.retrieveSongDetails(sampleInfo.metadata!.spotify!.trackId);
            sampleInfo.metadata!.spotify!.albumPhotoUrl = albumPhotoUrl;
            sampleInfo.metadata!.spotify!.popularity = popularity;
            sampleInfo.metadata!.spotify!.preview_url = preview_url;
        }

        // Register Sample Information        

        let { id } = await saveSampleRecord(sampleInfo);
        sampleInfo.id = id;
    

        let message = { 
            action: { 
                type: 'IDENTIFY SONG', 
                result: 'OK', 
                sample: sample,
                eventTime: new Date(Date.now()) 
            }, 
        };
        res.json(success(message));
}));

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

app.get('/api/audio/samples', (req: Request, res: Response, next: NextFunction) => {
    try {
        let { query, params } = req;
        fetchSampleRecords({ query, params}).then(records=>{
            let message = {
                action: { 
                    type: 'FETCH_SAMPLES', 
                    result: 'OK', 
                    samples: records,
                    eventTime: new Date(Date.now()) 
                }, 
            };
            res.json(success(message));
        }).catch(err=>{
            next(err);
        });

    } catch (err) {
        next(err);
    }
});

app.get('/api/audio/spotify/:id', (req: Request, res: Response, next: NextFunction) => {
    try {
        let { params } = req;
        let { id } = params;
        spotifyClient(spotifyConfig).then((spotify)=>{
            return spotify.retrieveSongDetails(id);
        }).then(result=>{
            let message = {
                action: { 
                    type: 'GET_TRACK_DETAILS', 
                    result: 'OK', 
                    trackInfo: result,
                    eventTime: new Date(Date.now()) 
                }, 
            };
            res.json(success(message));
        });
    } catch (err) {
        next(err);
    }
});

app.get('/api/audio/gracenote/find', (req: Request, res: Response, next: NextFunction) => {
    try {
        let { query } = req;
        let { artist_name, song_title } = query;
        let { client_id, client_tag, user_id } = gracenoteConfig;
        
        let gracenoteClient = new Gracenote(
            client_id, 
            client_tag, 
            user_id
        );
        
        gracenoteClient.searchTrack(artist_name, "", song_title, undefined).then(songData=>{
            let message = {
                action: { 
                    type: 'GET_TRACK_METADATA', 
                    result: 'OK', 
                    trackInfo: songData,
                    eventTime: new Date(Date.now()) 
                }
            };
            res.json(success(message));
        });
    } catch (err) {
        next(err);
    }
});

app.use((req: Request, res: Response, next: Function) => {
    var err: any = new Error(`[${req.path}] Not Found`);
    err.status = 404;
    res.writeHead(404, 'Not Found');
    next(err);
});
  
// error handler
app.use((err: Error, req: Request, res: Response, next: Function) => {
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
        let message = error(209, err, `It wasn't possible to handle the request.`, err.message);
        res.json(message);     
    } catch (error) {
        res.json({code:0, message: 'NO DATA', error });    
    }
    
    // render the error page    
    // res.status(err.status || 500);
    // res.render('error');
});


export default functions.https.onRequest(app);
