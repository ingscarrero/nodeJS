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
const devices_1 = require("./devices");
const db = admin.firestore();
exports.DEVICE_SESSION_ACTIONS = {
    START: 'START',
    STOP: 'STOP',
    PAUSE: 'PAUSE',
    RESUME: 'RESUME',
    COMMIT: 'COMMIT',
    UPDATE: 'UPDATE',
};
exports.DEVICE_SESSION_STATUSES = {
    ACTIVE: 'ACTIVE',
    PAUSED: 'PAUSED',
    FULFILLED: 'FULFILLED',
    STOPPED: 'STOPPED',
    SCHEDULED: 'SCHEDULED'
};
exports.DEFAULT_CONFIG = {
    start: (() => new Date(Date.now()))(),
    durationInMinutes: -1,
    recurrence: 'NONE',
    broadcastingUrl: 'NONE',
    isBroadcasting: true,
    isSampling: true,
    samplingDurationInSeconds: 15,
    samplingIntervalInMinutes: 2
};
function getDeviceDocument(clubId, deviceId) {
    return __awaiter(this, void 0, void 0, function* () {
        let clubDocRef = db.collection(`clubs`).doc(clubId);
        let deviceDocRef = clubDocRef.collection(`devices`).doc(deviceId);
        let club = yield clubDocRef.get();
        let device = yield deviceDocRef.get();
        if (!club.exists) {
            return Promise.reject(new Error('Invalid Club'));
        }
        if (!device.exists) {
            return Promise.reject(new Error('Invalid Device'));
        }
        return deviceDocRef;
    });
}
function changeSession(clubId, deviceId, config) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let validStatuses = [
                exports.DEVICE_SESSION_STATUSES.SCHEDULED,
                exports.DEVICE_SESSION_STATUSES.ACTIVE,
                exports.DEVICE_SESSION_STATUSES.PAUSED
            ];
            let deviceDocRef = yield getDeviceDocument(clubId, deviceId);
            let device = yield deviceDocRef.get();
            if (!device.exists) {
                return Promise.reject(new Error('Invalid Device'));
            }
            let { status = devices_1.DEVICE_STATUSES.ACTIVE, session } = device.data();
            if (status != devices_1.DEVICE_STATUSES.ACTIVE) {
                return Promise.reject(new Error(`The selected device is not activated. Please check device setup`));
            }
            if (!session) {
                return Promise.reject(new Error(`There is no session to change at this time`));
            }
            let validStatus = validStatuses.find(s => s == session.status);
            if (!(validStatus)) {
                return Promise.reject(new Error(`Cannot start session with an active session on status [${status}]`));
            }
            let newSessionInfo = Object.assign(session, config);
            yield deviceDocRef.update({
                session: { status: newSessionInfo }
            });
            return true;
        }
        catch (error) {
            return Promise.reject(error);
        }
    });
}
function commitSession(clubId, deviceId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let validStatuses = [
                exports.DEVICE_SESSION_STATUSES.SCHEDULED
            ];
            let deviceDocRef = yield getDeviceDocument(clubId, deviceId);
            let device = yield deviceDocRef.get();
            if (!device.exists) {
                return Promise.reject(new Error('Invalid Device'));
            }
            let { status = devices_1.DEVICE_STATUSES.ACTIVE, session } = device.data();
            if (status != devices_1.DEVICE_STATUSES.ACTIVE) {
                return Promise.reject(new Error(`The selected device is not activated. Please check device setup`));
            }
            if (!session) {
                return Promise.reject(new Error(`There is no session to commit, please setup a new session first`));
            }
            let validStatus = validStatuses.find(s => s == session.status);
            if (!(validStatus)) {
                return Promise.reject(new Error(`Cannot commit session with an active session on status [${status}]`));
            }
            yield deviceDocRef.update({
                status: devices_1.DEVICE_STATUSES.ONLINE,
                session: { status: exports.DEVICE_SESSION_STATUSES.ACTIVE }
            });
            return true;
        }
        catch (error) {
            return Promise.reject(error);
        }
    });
}
function startSession(clubId, deviceId, config) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let validStatuses = [
                exports.DEVICE_SESSION_STATUSES.FULFILLED,
                exports.DEVICE_SESSION_STATUSES.STOPPED,
                exports.DEVICE_SESSION_STATUSES.SCHEDULED
            ];
            let deviceDocRef = yield getDeviceDocument(clubId, deviceId);
            let device = yield deviceDocRef.get();
            if (!device.exists) {
                return Promise.reject(new Error('Invalid Device'));
            }
            let { status = devices_1.DEVICE_STATUSES.ACTIVE, session } = device.data();
            if (status != devices_1.DEVICE_STATUSES.ACTIVE) {
                return Promise.reject(new Error(`The selected device is not activated. Please check device setup`));
            }
            if (session) {
                let validStatus = validStatuses.find(s => s == session.status);
                if (!validStatus) {
                    return Promise.reject(new Error(`Cannot start a session with an active session on status [${status}]`));
                }
            }
            yield deviceDocRef.update({
                session: Object.assign({ status: exports.DEVICE_SESSION_STATUSES.SCHEDULED }, config)
            });
            return true;
        }
        catch (error) {
            return Promise.reject(error);
        }
    });
}
function resumeSession(clubId, deviceId) {
    return __awaiter(this, void 0, void 0, function* () {
        let validStatuses = [
            exports.DEVICE_SESSION_STATUSES.PAUSED,
        ];
        let deviceDocRef = yield getDeviceDocument(clubId, deviceId);
        let device = yield deviceDocRef.get();
        if (!device.exists) {
            return Promise.reject(new Error('Invalid Device'));
        }
        let { status = exports.DEVICE_SESSION_STATUSES.ACTIVE, session } = device.data();
        if (status != devices_1.DEVICE_STATUSES.ACTIVE) {
            return Promise.reject(new Error(`The selected device is not activated. Please check device setup`));
        }
        if (!session) {
            return Promise.reject(new Error(`No session can be resumed in this device at this time.`));
        }
        let validStatus = validStatuses.find(s => s == status);
        if (!validStatus) {
            return Promise.reject(new Error(`Cannot resume a session on status [${status}]`));
        }
        let newSessionInfo = Object.assign(session, { status: exports.DEVICE_SESSION_STATUSES.ACTIVE });
        yield deviceDocRef.update({
            session: newSessionInfo
        });
        return true;
    });
}
function pauseSession(clubId, deviceId) {
    return __awaiter(this, void 0, void 0, function* () {
        let validStatuses = [
            exports.DEVICE_SESSION_STATUSES.ACTIVE,
        ];
        let deviceDocRef = yield getDeviceDocument(clubId, deviceId);
        let device = yield deviceDocRef.get();
        if (!device.exists) {
            return Promise.reject(new Error('Invalid Device'));
        }
        let { status = devices_1.DEVICE_STATUSES.ACTIVE, session } = device.data();
        if (status != devices_1.DEVICE_STATUSES.ACTIVE) {
            return Promise.reject(new Error(`The selected device is not activated. Please check device setup`));
        }
        if (!session) {
            return Promise.reject(new Error(`There is no session to pause at this time`));
        }
        let newSessionInfo = Object.assign(session, { status: exports.DEVICE_SESSION_STATUSES.PAUSED });
        let validStatus = validStatuses.find(s => s == status);
        if (!validStatus) {
            return Promise.reject(new Error(`Cannot pause session with device's current status [${status}]`));
        }
        yield deviceDocRef.update({
            session: newSessionInfo
        });
        return true;
    });
}
function stopSession(clubId, deviceId, reason) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let validStatuses = [
                exports.DEVICE_SESSION_STATUSES.SCHEDULED,
                exports.DEVICE_SESSION_STATUSES.ACTIVE,
                exports.DEVICE_SESSION_STATUSES.PAUSED
            ];
            let deviceDocRef = yield getDeviceDocument(clubId, deviceId);
            let device = yield deviceDocRef.get();
            if (!device.exists) {
                return Promise.reject(new Error('Invalid Device'));
            }
            let { status = devices_1.DEVICE_STATUSES.ACTIVE, session } = device.data();
            if (status != devices_1.DEVICE_STATUSES.ACTIVE) {
                return Promise.reject(new Error(`The selected device is not activated. Please check device setup`));
            }
            if (!session) {
                return Promise.reject(new Error(`There is no session to stop at this time`));
            }
            let validStatus = validStatuses.find(s => s == status);
            if (!validStatus) {
                return Promise.reject(new Error(`Cannot stop session with device's current status [${status}]`));
            }
            let newSessionInfo = Object.assign(session, { status: exports.DEVICE_SESSION_STATUSES.STOPPED, reason });
            yield deviceDocRef.update({
                status: devices_1.DEVICE_STATUSES.ACTIVE,
                session: newSessionInfo
            });
            return true;
        }
        catch (error) {
            return Promise.reject(error);
        }
    });
}
function setup(clubId, deviceId, action, config = exports.DEFAULT_CONFIG, stoppingReason) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = false;
        console.log(`${config}`);
        try {
            switch (action) {
                case exports.DEVICE_SESSION_ACTIONS.START:
                    result = yield startSession(clubId, deviceId, config);
                    break;
                case exports.DEVICE_SESSION_ACTIONS.STOP:
                    result = yield stopSession(clubId, deviceId, stoppingReason);
                    break;
                case exports.DEVICE_SESSION_ACTIONS.PAUSE:
                    result = yield pauseSession(clubId, deviceId);
                    break;
                case exports.DEVICE_SESSION_ACTIONS.RESUME:
                    result = yield resumeSession(clubId, deviceId);
                    break;
                case exports.DEVICE_SESSION_ACTIONS.COMMIT:
                    result = yield commitSession(clubId, deviceId);
                    break;
                case exports.DEVICE_SESSION_ACTIONS.UPDATE:
                    result = yield changeSession(clubId, deviceId, config);
                    break;
                default:
                    break;
            }
            if (result) {
                return {
                    action: `${action}_SESSION`,
                    result: 'SUCCEED',
                    eventTime: new Date(Date.now())
                };
            }
            else {
                return {
                    action: `${action}_SESSION`,
                    result: 'INVALID',
                    eventTime: new Date(Date.now())
                };
            }
        }
        catch (error) {
            console.error(error);
            return {
                action: `${action}_SESSION`,
                result: 'ERROR',
                message: `Error on ${action} session. ${error.message}.`,
                eventTime: new Date(Date.now())
            };
        }
    });
}
exports.setup = setup;
//# sourceMappingURL=session.js.map