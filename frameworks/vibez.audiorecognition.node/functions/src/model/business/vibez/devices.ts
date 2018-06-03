import * as admin from 'firebase-admin';
import { assignToVGEAR, DEFAULT_MOUNT, MOUNT_STATUSES, Mount } from './mounts'; 

const db = admin.firestore();

export type DeviceStatus = 'ACTIVE' | 'IDLE' | 'NEW' | 'OFFLINE' | 'ONLINE' | 'READY';

export const DEVICE_STATUSES = {
    IDLE: 'IDLE',
    ACTIVE: 'ACTIVE',
    ONLINE: 'ONLINE',
    READY: 'READY',
    NEW: 'NEW',
    OFFLINE: 'OFFLINE',
}

export interface VGEAR {
    status: DeviceStatus;
    ownerId?: string;
    macAddress?: string;
    lastStatusReportTime?: Date;
    lastUpdateTime?: Date;
    coreVersion?: string;
    mountId?: string;
    partNumber: string;
}

export const DEFAULT_VGEAR = {
    status: DEVICE_STATUSES.NEW,
    coreVersion: '1.0.0',
    partNumber: (()=>`VGEAR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`)(),
    lastUpdateTime: (()=>new Date(Date.now()))()
} as VGEAR;

export async function register(uuid: string):Promise<VGEAR>{
    try {
        let mountCollectionRef = db.collection(`mounts`);
        let vGearCollectionRef = db.collection(`vgears`);
        let vGearDocRef = vGearCollectionRef.doc(uuid);

        let vGear = await vGearDocRef.get();
        let mountsQuery = mountCollectionRef.where('status','==','NEW');

        let mounts = await mountsQuery.get();

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

        await vGearDocRef.create({ mountId: id, ...DEFAULT_VGEAR });
        
        await assignToVGEAR(id, uuid);

        let registeredVGEAR = await vGearDocRef.get();

        return Object.assign({} as VGEAR, registeredVGEAR.data());

    } catch (error) {

        console.log('Error at Device\'s register');
        return Promise.reject(error);
    }
}

export async function preActivate(uuid: string, customerId: string):Promise<boolean>{
    try {
        let clubDocRef= db.collection(`clubs`).doc(customerId);

        let deviceDocRef = clubDocRef.collection(`devices`).doc(uuid);

        let vGearCollectionRef = db.collection(`vgears`);

        let vGearDocRef = vGearCollectionRef.doc(uuid);

        let club = await clubDocRef.get();
        let device = await deviceDocRef.get();
        
        if (!club.exists) {
            return Promise.reject(new Error('Invalid Club'));
        }
    
        if (device.exists) {
            return Promise.reject(new Error('Invalid VGEAR Device'));
        }

        let vGear = await vGearDocRef.get();

        if (!vGear.exists) {
            return Promise.reject(new Error('The submitted uuid doesn\'t belong to a valid VGEAR device.'));
        }
        
        let { ownerId } = vGear.data();
        if (ownerId) {
            return Promise.reject(new Error('The submitted uuid can\'t be pre-activated because it already has an assigned owner id'));
        }

        await vGearDocRef.update({ownerId: customerId, status: DEVICE_STATUSES.READY});

        await deviceDocRef.create({status: DEVICE_STATUSES.READY});

        return true;
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function activate(uuid: string, customerId: string):Promise<string>{
    try {
        
        let vGearCollectionRef = db.collection(`vgears`);

        let vGearDocRef = vGearCollectionRef.doc(uuid);

        let vGear = await vGearDocRef.get();

        if (!vGear.exists) {
            return Promise.reject(new Error('The submitted uuid doesn\'t belong to a valid VGEAR device.'));
        }

        let { ownerId } = vGear.data();

        if (!ownerId) {
            return Promise.reject(new Error('The submitted uuid can\'t be activated because it hasn\'t been pre-activated to any customer'));
        }

        if ( customerId !== ownerId) {
            return Promise.reject(new Error('The submitted uuid can\'t be activated because it doesn\'t match the provided customer id.'));
        }
        
        let clubDocRef= db.collection(`clubs`).doc(ownerId);
        
        let deviceDocRef = clubDocRef.collection(`devices`).doc(uuid);

        let club = await clubDocRef.get();
        let device = await deviceDocRef.get();

        if (!club.exists) {
            return Promise.reject(new Error('Invalid Club'));
        }

        if (!device.exists) {
            await deviceDocRef.create({status: DEVICE_STATUSES.ACTIVE});
        }

        await vGearDocRef.update({status: DEVICE_STATUSES.ACTIVE});

        await deviceDocRef.update({status: DEVICE_STATUSES.ACTIVE});
        
        return ownerId;
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function listAll(): Promise<Array<VGEAR>>{
    let vGearCollectionRef = db.collection(`vgears`);
    let vGearsQuery = await vGearCollectionRef.get();
    let vGears = vGearsQuery.docs.map(d=>{
        let fields = d.data();
        let vGear = Object.assign({} as VGEAR, fields);
        return vGear;
    });
    return vGears;
}

export async function listByOwner(ownerId: string){
    let vGearCollectionRef = db.collection(`vgears`);
    let vGearsQuery = await vGearCollectionRef.where('ownerId', '==', ownerId).get();

    let vGears = vGearsQuery.docs.map(d=>{
        let fields = d.data();
        let vGear = Object.assign({} as VGEAR, fields);
        return vGear;
    });
    return vGears;
}
export async function check(customerId: string, vgearId: string){
    let vGearCollectionRef = db.collection(`vgears`);
    let vGearDocRef = vGearCollectionRef.doc(vgearId);

    let vGear = await vGearDocRef.get();
    if (vGear.exists) {
        let { ownerId } = vGear.data();
        if (ownerId !== customerId) {
            return Promise.reject('Invalid Owner ID');    
        }
        
    }
    return vGear.exists;
}
