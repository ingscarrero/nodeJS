import * as admin from 'firebase-admin';
import { VGEAR } from './devices';

const db = admin.firestore();

export type MountStatus = 'ASSIGNED' | 'NEW' | 'OFFLINE' | 'ONLINE' | 'CANCELED';

export const MOUNT_STATUSES = {
    ASSIGNED: 'ASSIGNED',
    ONLINE: 'ONLINE',
    NEW: 'NEW',
    OFFLINE: 'OFFLINE',
    CANCELED: 'CANCELED',
}



export interface Mount {
    status: MountStatus;
    ownerId?: string;
    pathSuffix?: string;
}

export const DEFAULT_MOUNT = {
    status: MOUNT_STATUSES.NEW
} as Mount;

export async function register():Promise<Mount>{
    try {
        let mountCollectionRef = db.collection(`mounts`);

        let mount = Object.assign({} as Mount, DEFAULT_MOUNT);

        mount.pathSuffix = `${Math.random().toString(36).substr(2, 9)}`;

        let mountDocRef = await 
        mountCollectionRef.add(mount);

        let registeredMount = await mountDocRef.get();

        return Object.assign({} as Mount, registeredMount.data());

    } catch (error) {
        return Promise.reject(error);
    }
}


export async function assignToVGEAR(mountId: string, uuid: string):Promise<boolean>{
    try {
        let validStatuses = [ MOUNT_STATUSES.NEW, MOUNT_STATUSES.CANCELED ];

        let mountDocRef = db.collection(`mounts`).doc(mountId);
        let vGearDocRef = db.collection(`vgears`).doc(uuid);

        let mount = await mountDocRef.get();
        let vGear = await vGearDocRef.get();
        
        if (!mount.exists) {
            return Promise.reject(new Error('Invalid Mount'));
        }
    
        if (!vGear.exists) {
            return Promise.reject(new Error('Invalid VGEAR Device'));
        }

        let mountDetails = mount.data() as Mount;
        let { ownerId } = vGear.data() as VGEAR;
        
        let validStatus = validStatuses.find(s=>s == mountDetails.status);

        if ( !validStatus || mountDetails.ownerId ) {
            return Promise.reject(new Error('The pointed mount can\'t be assigned to the VGEAR Device beacuse it is already assigned to other Device.' ));
        }

        if (ownerId) {
            await mountDocRef.update({ status: MOUNT_STATUSES.ASSIGNED, ownerId });
        } else {
            await mountDocRef.update({ status: MOUNT_STATUSES.ASSIGNED });
        }

        await vGearDocRef.update({ mountId: mountId });

        return true;
    } catch (error) {

        console.log('Error at Mount\'s assignToVGEAR');
        return Promise.reject(error);
    }
}
export async function listAll(): Promise<Array<Mount>>{
    let mountsCollectionRef = db.collection(`mounts`);
    let mountsQuery = await mountsCollectionRef.get();
    let mounts = mountsQuery.docs.map(m=>{
        let fields = m.data();
        let mount = Object.assign({} as Mount, fields);
        return mount;
    });
    return mounts;
}

export async function listAvailable(): Promise<Array<Mount>>{
    let mountsCollectionRef = db.collection(`mounts`);
    let mountsQuery = await mountsCollectionRef.where('status','==','NEW').get();

    let mounts = mountsQuery.docs.map(m=>{
        let fields = m.data();
        let mount = Object.assign({} as Mount, fields);
        return mount;
    });
    return mounts;
}

export async function listByOwner(ownerId: string){
    let mountsCollectionRef = db.collection(`mounts`);
    let mountsQuery = await mountsCollectionRef.where('ownerId', '==', ownerId).get();

    let mounts = mountsQuery.docs.map(d=>{
        let fields = d.data();
        let mount = Object.assign({} as Mount, fields);
        return mount;
    });
    return mounts;
}

export async function mountById(id: string){
    let mountDocRef = db.collection(`mounts`).doc(id);
    let mountQuery = await mountDocRef.get();
    if (!mountQuery.exists) {
        return Promise.reject('There where no matches for the pointed mount');
    }
    return Object.assign({} as Mount, mountQuery.data());
}

