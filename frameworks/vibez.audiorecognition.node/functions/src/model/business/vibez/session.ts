import * as admin from 'firebase-admin';
import { DEVICE_STATUSES, DeviceStatus } from './devices';

const db = admin.firestore();

export type DeviceSessionAction = 'START' | 'STOP' | 'PAUSE' | 'RESUME' | 'COMMIT' | 'UPDATE';
export type SessionRecurrence = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
export const DEVICE_SESSION_ACTIONS = {
    START: 'START',
    STOP: 'STOP',
    PAUSE: 'PAUSE',
    RESUME: 'RESUME',
    COMMIT: 'COMMIT',
    UPDATE: 'UPDATE',
}

export const DEVICE_SESSION_STATUSES = {
    ACTIVE: 'ACTIVE',
    PAUSED: 'PAUSED',
    FULFILLED: 'FULFILLED',
    STOPPED: 'STOPPED',
    SCHEDULED: 'SCHEDULED'
}


export interface SessionConfiguration {
    start: Date;
    durationInMinutes: number;
    broadcastingUrl: string;
    samplingIntervalInMinutes: number;
    samplingDurationInSeconds: number;
    isBroadcasting: boolean;
    isSampling: boolean;
    recurrence: SessionRecurrence;
    recurrenceDays: Array<number>;
}

export interface Session extends SessionConfiguration {
    reason: string;
    status: string;
    lastUpdate: string;
    lastUpdatedBy: string;
}

export interface Device {
    status: DeviceStatus;
    uuid: string;
    session?: Session;
}

export const DEFAULT_CONFIG = {
    start: (()=>new Date(Date.now()))(),
    durationInMinutes: -1,
    recurrence: 'NONE',
    broadcastingUrl:'NONE',
    isBroadcasting: true,
    isSampling: true,
    samplingDurationInSeconds: 15,
    samplingIntervalInMinutes: 2
} as SessionConfiguration;

async function getDeviceDocument(clubId: string, deviceId: string) : Promise<FirebaseFirestore.DocumentReference> {
    let clubDocRef= db.collection(`clubs`).doc(clubId);
    let deviceDocRef = clubDocRef.collection(`devices`).doc(deviceId);

    let club = await clubDocRef.get();
    let device = await deviceDocRef.get();

    if (!club.exists) {
        return Promise.reject(new Error('Invalid Club'));
    }

    if (!device.exists) {
        return Promise.reject(new Error('Invalid Device'));
    }

    return deviceDocRef;
}

async function changeSession(clubId: string, deviceId: string, config: SessionConfiguration) : Promise<boolean>{
    try {
        let validStatuses = [
            DEVICE_SESSION_STATUSES.SCHEDULED,
            DEVICE_SESSION_STATUSES.ACTIVE,
            DEVICE_SESSION_STATUSES.PAUSED
        ];
    
        let deviceDocRef = await getDeviceDocument(clubId, deviceId);
    
        let device = await deviceDocRef.get();
    
        if (!device.exists) {
            return Promise.reject(new Error('Invalid Device'));
        }
    
        let { status = DEVICE_STATUSES.ACTIVE, session } = device.data();
    
        if ( status != DEVICE_STATUSES.ACTIVE) {
            return Promise.reject(new Error(`The selected device is not activated. Please check device setup`));
        }

        if (!session) {
            return Promise.reject(new Error(`There is no session to change at this time`));
        }

        let validStatus = validStatuses.find(s=>s == session.status);

        if (!(validStatus)) {
            return Promise.reject(new Error(`Cannot start session with an active session on status [${status}]`));
        } 
        
        let newSessionInfo = Object.assign( session, config );

        await deviceDocRef.update({
            session: { status: newSessionInfo }
        }); 
        
        return true;

    } catch (error) {
        return Promise.reject(error);
    }
    
}

async function commitSession(clubId: string, deviceId: string) : Promise<boolean>{
    try {
        let validStatuses = [
            DEVICE_SESSION_STATUSES.SCHEDULED
        ];
    
        let deviceDocRef = await getDeviceDocument(clubId, deviceId);
    
        let device = await deviceDocRef.get();
    
        if (!device.exists) {
            return Promise.reject(new Error('Invalid Device'));
        }
    
        let { status = DEVICE_STATUSES.ACTIVE, session } = device.data();
    
        if ( status != DEVICE_STATUSES.ACTIVE) {
            return Promise.reject(new Error(`The selected device is not activated. Please check device setup`));
        }

        if (!session) {
            return Promise.reject(new Error(`There is no session to commit, please setup a new session first`));
        }

        let validStatus = validStatuses.find(s=>s == session.status);

        if (!(validStatus)) {
            return Promise.reject(new Error(`Cannot commit session with an active session on status [${status}]`));
        } 
        
        await deviceDocRef.update({
            status: DEVICE_STATUSES.ONLINE,
            session: { status: DEVICE_SESSION_STATUSES.ACTIVE }
        }); 
        
        return true;
    } catch (error) {
        return Promise.reject(error);
    }
    
}

async function startSession(clubId: string, deviceId: string, config: SessionConfiguration) : Promise<boolean>{
    try {
        let validStatuses = [
            DEVICE_SESSION_STATUSES.FULFILLED,
            DEVICE_SESSION_STATUSES.STOPPED,
            DEVICE_SESSION_STATUSES.SCHEDULED
        ];
    
        let deviceDocRef = await getDeviceDocument(clubId, deviceId);
    
        let device = await deviceDocRef.get();
    
        if (!device.exists) {
            return Promise.reject(new Error('Invalid Device'));
        }
    
        let { status = DEVICE_STATUSES.ACTIVE, session } = device.data();

        if ( status != DEVICE_STATUSES.ACTIVE ) {
            return Promise.reject(new Error(`The selected device is not activated. Please check device setup`));
        }
    
        if (session) {
            let validStatus = validStatuses.find(s=>s == session.status);
            if (!validStatus) {
                return Promise.reject(new Error(`Cannot start a session with an active session on status [${status}]`));
            } 
        }
        
        await deviceDocRef.update({
            session: { status: DEVICE_SESSION_STATUSES.SCHEDULED, ...config }
        }); 

        return true;
    } catch (error) {
        return Promise.reject(error);
    }
    
}

async function resumeSession(clubId: string, deviceId: string) : Promise<boolean>{
    let validStatuses = [
        DEVICE_SESSION_STATUSES.PAUSED,
    ];

    let deviceDocRef = await getDeviceDocument(clubId, deviceId);

    let device = await deviceDocRef.get();

    if (!device.exists) {
        return Promise.reject(new Error('Invalid Device'));
    }

    let { status = DEVICE_SESSION_STATUSES.ACTIVE, session } = device.data();

    if ( status != DEVICE_STATUSES.ACTIVE ) {
        return Promise.reject(new Error(`The selected device is not activated. Please check device setup`));
    }
    
    if (!session) {
        return Promise.reject(new Error(`No session can be resumed in this device at this time.`));
    } 

    let validStatus = validStatuses.find(s=>s == status);

    if (!validStatus) {
        return Promise.reject(new Error(`Cannot resume a session on status [${status}]`));
    } 
    
    let newSessionInfo = Object.assign(session, { status: DEVICE_SESSION_STATUSES.ACTIVE } );

    await deviceDocRef.update({
        session: newSessionInfo
    }); 

    return true;
}

async function pauseSession(clubId: string, deviceId: string) : Promise<boolean>{
    let validStatuses = [
        DEVICE_SESSION_STATUSES.ACTIVE,
    ];

    let deviceDocRef = await getDeviceDocument(clubId, deviceId);

    let device = await deviceDocRef.get();

    if (!device.exists) {
        return Promise.reject(new Error('Invalid Device'));
    }

    let { status = DEVICE_STATUSES.ACTIVE, session } = device.data();

    if ( status != DEVICE_STATUSES.ACTIVE ) {
        return Promise.reject(new Error(`The selected device is not activated. Please check device setup`));
    }

    if (!session) {
        return Promise.reject(new Error(`There is no session to pause at this time`));
    } 

    let newSessionInfo = Object.assign(session, { status: DEVICE_SESSION_STATUSES.PAUSED } );

    let validStatus = validStatuses.find(s=>s == status);

    if (!validStatus) {
        return Promise.reject(new Error(`Cannot pause session with device's current status [${status}]`));
    } 
    
    await deviceDocRef.update({
        session: newSessionInfo
    }); 

    return true;
}

async function stopSession(clubId: string, deviceId: string, reason: string) : Promise<boolean>{

    try {
        let validStatuses = [
            DEVICE_SESSION_STATUSES.SCHEDULED,
            DEVICE_SESSION_STATUSES.ACTIVE,
            DEVICE_SESSION_STATUSES.PAUSED
        ];
    
        let deviceDocRef = await getDeviceDocument(clubId, deviceId);
    
        let device = await deviceDocRef.get();
    
        if (!device.exists) {
            return Promise.reject(new Error('Invalid Device'));
        }
    
        let { status = DEVICE_STATUSES.ACTIVE, session } = device.data();
    
        if ( status != DEVICE_STATUSES.ACTIVE) {
            return Promise.reject(new Error(`The selected device is not activated. Please check device setup`));
        }
    
        if (!session) {
            return Promise.reject(new Error(`There is no session to stop at this time`));
        }
    
        let validStatus = validStatuses.find(s=>s == status);
    
        if (!validStatus) {
            return Promise.reject(new Error(`Cannot stop session with device's current status [${status}]`));
        }
        
        let newSessionInfo = Object.assign(session, { status: DEVICE_SESSION_STATUSES.STOPPED, reason });
        
        await deviceDocRef.update({
            status: DEVICE_STATUSES.ACTIVE,
            session: newSessionInfo
        }); 
    
        return true;
    } catch (error) {
        return Promise.reject(error);
    }
    
}

export async function setup(clubId: string, deviceId:string, action: DeviceSessionAction, config: SessionConfiguration = DEFAULT_CONFIG, stoppingReason?: string){
    let result = false;
    console.log(`${config}`);
    try {
        switch (action) {
            case DEVICE_SESSION_ACTIONS.START:
                result = await startSession(clubId, deviceId, config!);
                break;
            case DEVICE_SESSION_ACTIONS.STOP:
                result = await stopSession(clubId, deviceId, stoppingReason!);
                break;
            case DEVICE_SESSION_ACTIONS.PAUSE:
                result = await pauseSession(clubId, deviceId);
                break;
            case DEVICE_SESSION_ACTIONS.RESUME:
                result = await resumeSession(clubId, deviceId);
                break;
            case DEVICE_SESSION_ACTIONS.COMMIT:
                result = await commitSession(clubId, deviceId);
                break;
            case DEVICE_SESSION_ACTIONS.UPDATE:
                result = await changeSession(clubId, deviceId, config!);
                break;
            default:
                break;
        }
        if (result) {
            return { 
                action: `${action}_SESSION`,
                result: 'SUCCEED',
                eventTime: new Date(Date.now())
            }
        } else {
            return { 
                action: `${action}_SESSION`,
                result: 'INVALID',
                eventTime: new Date(Date.now())
            }
        }
    } catch (error) {
        console.error(error);
        return { 
            action: `${action}_SESSION`,
            result: 'ERROR',
            message: `Error on ${action} session. ${error.message}.`,
            eventTime: new Date(Date.now())
        }
    }
    
}
