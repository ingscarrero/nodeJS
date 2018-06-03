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
const db = admin.firestore();
exports.MOUNT_STATUSES = {
    ASSIGNED: 'ASSIGNED',
    ONLINE: 'ONLINE',
    NEW: 'NEW',
    OFFLINE: 'OFFLINE',
    CANCELED: 'CANCELED',
};
exports.DEFAULT_MOUNT = {
    status: exports.MOUNT_STATUSES.NEW
};
function register() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let mountCollectionRef = db.collection(`mounts`);
            let mount = Object.assign({}, exports.DEFAULT_MOUNT);
            mount.pathSuffix = `${Math.random().toString(36).substr(2, 9)}`;
            let mountDocRef = yield mountCollectionRef.add(mount);
            let registeredMount = yield mountDocRef.get();
            return Object.assign({}, registeredMount.data());
        }
        catch (error) {
            return Promise.reject(error);
        }
    });
}
exports.register = register;
function assignToVGEAR(mountId, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let validStatuses = [exports.MOUNT_STATUSES.NEW, exports.MOUNT_STATUSES.CANCELED];
            let mountDocRef = db.collection(`mounts`).doc(mountId);
            let vGearDocRef = db.collection(`vgears`).doc(uuid);
            let mount = yield mountDocRef.get();
            let vGear = yield vGearDocRef.get();
            if (!mount.exists) {
                return Promise.reject(new Error('Invalid Mount'));
            }
            if (!vGear.exists) {
                return Promise.reject(new Error('Invalid VGEAR Device'));
            }
            let mountDetails = mount.data();
            let { ownerId } = vGear.data();
            let validStatus = validStatuses.find(s => s == mountDetails.status);
            if (!validStatus || mountDetails.ownerId) {
                return Promise.reject(new Error('The pointed mount can\'t be assigned to the VGEAR Device beacuse it is already assigned to other Device.'));
            }
            if (ownerId) {
                yield mountDocRef.update({ status: exports.MOUNT_STATUSES.ASSIGNED, ownerId });
            }
            else {
                yield mountDocRef.update({ status: exports.MOUNT_STATUSES.ASSIGNED });
            }
            yield vGearDocRef.update({ mountId: mountId });
            return true;
        }
        catch (error) {
            console.log('Error at Mount\'s assignToVGEAR');
            return Promise.reject(error);
        }
    });
}
exports.assignToVGEAR = assignToVGEAR;
function listAll() {
    return __awaiter(this, void 0, void 0, function* () {
        let mountsCollectionRef = db.collection(`mounts`);
        let mountsQuery = yield mountsCollectionRef.get();
        let mounts = mountsQuery.docs.map(m => {
            let fields = m.data();
            let mount = Object.assign({}, fields);
            return mount;
        });
        return mounts;
    });
}
exports.listAll = listAll;
function listAvailable() {
    return __awaiter(this, void 0, void 0, function* () {
        let mountsCollectionRef = db.collection(`mounts`);
        let mountsQuery = yield mountsCollectionRef.where('status', '==', 'NEW').get();
        let mounts = mountsQuery.docs.map(m => {
            let fields = m.data();
            let mount = Object.assign({}, fields);
            return mount;
        });
        return mounts;
    });
}
exports.listAvailable = listAvailable;
function listByOwner(ownerId) {
    return __awaiter(this, void 0, void 0, function* () {
        let mountsCollectionRef = db.collection(`mounts`);
        let mountsQuery = yield mountsCollectionRef.where('ownerId', '==', ownerId).get();
        let mounts = mountsQuery.docs.map(d => {
            let fields = d.data();
            let mount = Object.assign({}, fields);
            return mount;
        });
        return mounts;
    });
}
exports.listByOwner = listByOwner;
function mountById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        let mountDocRef = db.collection(`mounts`).doc(id);
        let mountQuery = yield mountDocRef.get();
        if (!mountQuery.exists) {
            return Promise.reject('There where no matches for the pointed mount');
        }
        return Object.assign({}, mountQuery.data());
    });
}
exports.mountById = mountById;
//# sourceMappingURL=mounts.js.map