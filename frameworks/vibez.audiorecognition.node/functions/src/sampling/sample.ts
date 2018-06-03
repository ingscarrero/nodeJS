import * as admin from 'firebase-admin';
import * as firebase from 'firebase';
import { UploadResult, SampleRecord } from "../@types/index";
import * as fileupload from 'express-fileupload';


const FINGERPRINT_PATH = 'fingerprints/';
// admin.initializeApp(functions.config().firebase!);
const db = admin.firestore();


// firebase.initializeApp(functions.config().firebase!);


export function uploadSample(file:fileupload.UploadedFile) : Promise<UploadResult|never> {
    return new Promise<UploadResult>((resolve, reject)=>{
        try {
            

            let metadata = { contentType: file.mimetype };
            let storageRef = firebase.storage().ref();
            let sampleRef = storageRef.child(file.name);
            let sampleAudioRef = storageRef.child(`${FINGERPRINT_PATH}${file.name}`);
            sampleRef.name = sampleAudioRef.name;
            sampleRef.fullPath = sampleAudioRef.fullPath;
    
    
            sampleRef.put(file.data, metadata)
            .then(snapshot=>{
                let result = {
                    result: 'File successfully uploaded',
                    url: snapshot.downloadURL
                } as UploadResult;
                resolve(result);
            }).catch(err=>{
                reject(err);
            });
        } catch (error) {
            reject(error);
        }
        
    });
}

export function fetchSampleRecords(filter: any) : Promise<Array<SampleRecord>> {
    return new Promise<Array<SampleRecord>>((resolve, reject)=>{
        try {
            let { query, params } = filter;
            let { limit, skip, fields } = query;
            if (params) { }

            let collectionRef = db.collection('samples');
            let queryObject;

            if (skip && skip > 0) {
                queryObject = collectionRef.offset(skip);
            }
            if (limit && limit > 0) {
                queryObject = queryObject ? queryObject.limit(limit) : collectionRef.limit(limit);
            }
            if (fields && fields.length > 0) {
                queryObject = queryObject ? queryObject.select(fields.split(',')) : collectionRef.select(fields.split(','));
            }

            let dataPromise = queryObject ? queryObject.get() : collectionRef.get();
            
            dataPromise.then(snapshot=>{ 
                let sampleRecords = snapshot.docs
                .map(doc=>{
                    let { clubId, createdAt, identified, sampleUri, metadata } = doc.data();
                    let { id } = doc;
                    return { 
                        id, 
                        clubId,
                        createdAt, 
                        sampleUri, 
                        identified, 
                        metadata 
                    };
                });
                resolve(sampleRecords);    
            }).catch(err=>{
                reject(err);
            });
        } catch (error) {
            reject(error);
        }
    });
}



export function saveSampleRecord(sampleRecord: SampleRecord) : Promise<SampleRecord|never> {
    return new Promise<SampleRecord>((resolve, reject)=>{
        try {
            db.collection('samples').add(sampleRecord).then(({id})=>{
                sampleRecord.id = id;
                resolve(sampleRecord);    
            }).catch(err=>{
                reject(err);
            });
        } catch (error) {
            reject(error);
        }
    });
}


export function updateSampleRecord(id: string, sampleRecord: SampleRecord) : Promise<SampleRecord|never> {
    return new Promise<SampleRecord>((resolve, reject)=>{
        try {
            db.collection('samples')
            .doc(id)
            .update(sampleRecord)
            .then(()=>{
                sampleRecord.id = id;
                resolve(sampleRecord);    
            }).catch(err=>{
                reject(err);
            });
        } catch (error) {
            reject(error);
        }
    });
}