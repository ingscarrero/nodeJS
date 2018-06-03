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
const crypto = require("crypto");
const request = require("request");
const MILLISECONDS_PER_SECOND = 1000;
const ACRC_METHOD = 'POST';
const ACRC_HOST = 'identify-us-west-2.acrcloud.com';
const ACRC_ENDPOINT = '/v1/identify';
const ACRC_DATA_TYPE = 'audio';
const ACRC_SIGNATURE_VERSION = '1';
const ACRC_SECURE_PROTOCOL = true;
const ACRC_SUCCESS_STATUS = 'Success';
function buildSignatureString(method, uri, accessKey, dataType, signatureVersion, timestamp) {
    //let timestamp = new Date().getTime()/1000;
    return [
        method,
        uri,
        accessKey,
        dataType,
        signatureVersion,
        timestamp
    ].join('\n');
}
function sign(signString, accessSecret) {
    return crypto.createHmac('sha1', accessSecret)
        .update(new Buffer(signString, 'utf-8'))
        .digest().toString('base64');
}
class ACRCloudClient {
    constructor(options) {
        this.options = options;
        let { endpoint, data_type, host, signature_version, secure } = this.options;
        this.options.endpoint = endpoint || ACRC_ENDPOINT;
        this.options.data_type = data_type || ACRC_DATA_TYPE;
        this.options.host = host || ACRC_HOST;
        this.options.signature_version = signature_version || ACRC_SIGNATURE_VERSION;
        this.options.secure = secure || ACRC_SECURE_PROTOCOL;
    }
    /**
     * Fetch sample's metadata from ARCCloud
     * Return matches retrieved from  ARCCloud
     * @param {*} sample
     * @returns {Promise<any>}
     * @memberof ARCCloudClient
     */
    identify(sample) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let current_date = new Date();
                let timestamp = current_date.getTime() / MILLISECONDS_PER_SECOND;
                let stringToSign = buildSignatureString(ACRC_METHOD, this.options.endpoint, this.options.access_key, this.options.data_type, this.options.signature_version, timestamp);
                let signature = sign(stringToSign, this.options.access_secret);
                var formData = {
                    sample,
                    access_key: this.options.access_key,
                    data_type: this.options.data_type,
                    signature_version: this.options.signature_version,
                    signature,
                    sample_bytes: sample.length,
                    timestamp: timestamp
                };
                let identifyPromise = new Promise((resolve, reject) => request.post({
                    url: `http://${this.options.host}${this.options.endpoint}`,
                    method: ACRC_METHOD,
                    formData
                }, (error, response, body) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        if (response.statusCode == 200) {
                            let result = JSON.parse(body);
                            resolve(result);
                        }
                        else {
                            reject(new Error(`There was an error when retrieving sample's information from ACR Cloud. Server Returned Code: ${response.statusCode}: ${response.statusMessage}`));
                        }
                    }
                }));
                let result = yield identifyPromise;
                if (result.status.msg != ACRC_SUCCESS_STATUS) {
                    return Promise.reject(new Error(`It wasn't possible to retrieve sample's information at this time. ACR Cloud has returned with Error Code ${result.status.code}: ${result.status.msg}`));
                }
                return result.metadata.music;
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
}
exports.ACRCloudClient = ACRCloudClient;
//# sourceMappingURL=acrCloud.js.map