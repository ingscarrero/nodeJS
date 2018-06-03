"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const firebase = require("firebase");
const FINGERPRINT_PATH = 'fingerprints/';
// admin.initializeApp(functions.config().firebase!);
const db = admin.firestore();
// firebase.initializeApp(functions.config().firebase!);
function uploadSample(file) {
    return new Promise((resolve, reject) => {
        try {
            let metadata = { contentType: file.mimetype };
            let storageRef = firebase.storage().ref();
            let sampleRef = storageRef.child(file.name);
            let sampleAudioRef = storageRef.child(`${FINGERPRINT_PATH}${file.name}`);
            sampleRef.name = sampleAudioRef.name;
            sampleRef.fullPath = sampleAudioRef.fullPath;
            sampleRef.put(file.data, metadata)
                .then(snapshot => {
                let result = {
                    result: 'File successfully uploaded',
                    url: snapshot.downloadURL
                };
                resolve(result);
            }).catch(err => {
                reject(err);
            });
        }
        catch (error) {
            reject(error);
        }
    });
}
exports.uploadSample = uploadSample;
function fetchSampleRecords(filter) {
    return new Promise((resolve, reject) => {
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
            dataPromise.then(snapshot => {
                let sampleRecords = snapshot.docs
                    .map(doc => {
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
            }).catch(err => {
                reject(err);
            });
        }
        catch (error) {
            reject(error);
        }
    });
}
exports.fetchSampleRecords = fetchSampleRecords;
function saveSampleRecord(sampleRecord) {
    return new Promise((resolve, reject) => {
        try {
            db.collection('samples').add(sampleRecord).then(({ id }) => {
                sampleRecord.id = id;
                resolve(sampleRecord);
            }).catch(err => {
                reject(err);
            });
        }
        catch (error) {
            reject(error);
        }
    });
}
exports.saveSampleRecord = saveSampleRecord;
function updateSampleRecord(id, sampleRecord) {
    return new Promise((resolve, reject) => {
        try {
            db.collection('samples')
                .doc(id)
                .update(sampleRecord)
                .then(() => {
                sampleRecord.id = id;
                resolve(sampleRecord);
            }).catch(err => {
                reject(err);
            });
        }
        catch (error) {
            reject(error);
        }
    });
}
exports.updateSampleRecord = updateSampleRecord;
//# sourceMappingURL=sample.js.map