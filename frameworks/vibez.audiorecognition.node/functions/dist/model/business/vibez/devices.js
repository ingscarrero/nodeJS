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
const mounts_1 = require("./mounts");
const db = admin.firestore();
exports.DEVICE_STATUSES = {
    IDLE: 'IDLE',
    ACTIVE: 'ACTIVE',
    ONLINE: 'ONLINE',
    READY: 'READY',
    NEW: 'NEW',
    OFFLINE: 'OFFLINE',
};
exports.DEFAULT_VGEAR = {
    status: exports.DEVICE_STATUSES.NEW,
    coreVersion: '1.0.0',
    partNumber: (() => `VGEAR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`)(),
    lastUpdateTime: (() => new Date(Date.now()))()
};
function register(uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let mountCollectionRef = db.collection(`mounts`);
            let vGearCollectionRef = db.collection(`vgears`);
            let vGearDocRef = vGearCollectionRef.doc(uuid);
            let vGear = yield vGearDocRef.get();
            let mountsQuery = mountCollectionRef.where('status', '==', 'NEW');
            let mounts = yield mountsQuery.get();
            if (mounts.empty) {
                return Promise.reject(new Error('No mounts available. Please enable new mounts and then try again'));
            }
            let result = mounts.docs.slice(0, 1).pop();
            if (!result) {
                return Promise.reject(new Error('No mounts available. Please enable new mounts and then try again'));
            }
            let { id } = result;
            let { pathSuffix } = result.data();
            if (vGear.exists) {
                return Promise.reject(new Error('VGEAR is already registered'));
            }
            yield vGearDocRef.create(Object.assign({ mountId: id }, exports.DEFAULT_VGEAR));
            yield mounts_1.assignToVGEAR(id, uuid);
            let registeredVGEAR = yield vGearDocRef.get();
            return Object.assign({}, registeredVGEAR.data());
        }
        catch (error) {
            console.log('Error at Device\'s register');
            return Promise.reject(error);
        }
    });
}
exports.register = register;
function preActivate(uuid, customerId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let clubDocRef = db.collection(`clubs`).doc(customerId);
            let deviceDocRef = clubDocRef.collection(`devices`).doc(uuid);
            let vGearCollectionRef = db.collection(`vgears`);
            let vGearDocRef = vGearCollectionRef.doc(uuid);
            let club = yield clubDocRef.get();
            let device = yield deviceDocRef.get();
            if (!club.exists) {
                return Promise.reject(new Error('Invalid Club'));
            }
            if (device.exists) {
                return Promise.reject(new Error('Invalid VGEAR Device'));
            }
            let vGear = yield vGearDocRef.get();
            if (!vGear.exists) {
                return Promise.reject(new Error('The submitted uuid doesn\'t belong to a valid VGEAR device.'));
            }
            let { ownerId } = vGear.data();
            if (ownerId) {
                return Promise.reject(new Error('The submitted uuid can\'t be pre-activated because it already has an assigned owner id'));
            }
            yield vGearDocRef.update({ ownerId: customerId, status: exports.DEVICE_STATUSES.READY });
            yield deviceDocRef.create({ status: exports.DEVICE_STATUSES.READY });
            return true;
        }
        catch (error) {
            return Promise.reject(error);
        }
    });
}
exports.preActivate = preActivate;
function activate(uuid, customerId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let vGearCollectionRef = db.collection(`vgears`);
            let vGearDocRef = vGearCollectionRef.doc(uuid);
            let vGear = yield vGearDocRef.get();
            if (!vGear.exists) {
                return Promise.reject(new Error('The submitted uuid doesn\'t belong to a valid VGEAR device.'));
            }
            let { ownerId } = vGear.data();
            if (!ownerId) {
                return Promise.reject(new Error('The submitted uuid can\'t be activated because it hasn\'t been pre-activated to any customer'));
            }
            if (customerId !== ownerId) {
                return Promise.reject(new Error('The submitted uuid can\'t be activated because it doesn\'t match the provided customer id.'));
            }
            let clubDocRef = db.collection(`clubs`).doc(ownerId);
            let deviceDocRef = clubDocRef.collection(`devices`).doc(uuid);
            let club = yield clubDocRef.get();
            let device = yield deviceDocRef.get();
            if (!club.exists) {
                return Promise.reject(new Error('Invalid Club'));
            }
            if (!device.exists) {
                yield deviceDocRef.create({ status: exports.DEVICE_STATUSES.ACTIVE });
            }
            yield vGearDocRef.update({ status: exports.DEVICE_STATUSES.ACTIVE });
            yield deviceDocRef.update({ status: exports.DEVICE_STATUSES.ACTIVE });
            return ownerId;
        }
        catch (error) {
            return Promise.reject(error);
        }
    });
}
exports.activate = activate;
function listAll() {
    return __awaiter(this, void 0, void 0, function* () {
        let vGearCollectionRef = db.collection(`vgears`);
        let vGearsQuery = yield vGearCollectionRef.get();
        let vGears = vGearsQuery.docs.map(d => {
            let fields = d.data();
            let vGear = Object.assign({}, fields);
            return vGear;
        });
        return vGears;
    });
}
exports.listAll = listAll;
function listByOwner(ownerId) {
    return __awaiter(this, void 0, void 0, function* () {
        let vGearCollectionRef = db.collection(`vgears`);
        let vGearsQuery = yield vGearCollectionRef.where('ownerId', '==', ownerId).get();
        let vGears = vGearsQuery.docs.map(d => {
            let fields = d.data();
            let vGear = Object.assign({}, fields);
            return vGear;
        });
        return vGears;
    });
}
exports.listByOwner = listByOwner;
function check(customerId, vgearId) {
    return __awaiter(this, void 0, void 0, function* () {
        let vGearCollectionRef = db.collection(`vgears`);
        let vGearDocRef = vGearCollectionRef.doc(vgearId);
        let vGear = yield vGearDocRef.get();
        if (vGear.exists) {
            let { ownerId } = vGear.data();
            if (ownerId !== customerId) {
                return Promise.reject('Invalid Owner ID');
            }
        }
        return vGear.exists;
    });
}
exports.check = check;
//# sourceMappingURL=devices.js.map