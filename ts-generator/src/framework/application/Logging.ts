import { IIdentity, ILogger, ERRORS, IContext, Action } from "../types";
import FirebaseStore from "../data/providers/firebase/Admin";
import { IDocument } from "../common/DataStore";

export interface LogEntry {
    date: Date;
    type: "Error" | "Info" | "Warning";
    comments: string;
    details: string;
}

export interface ApplicationLogEntry extends LogEntry, IDocument {
    client: IIdentity;
    component: IIdentity;
    user: IIdentity;
}

export class ConsoleLogger implements ILogger<LogEntry>{
    reportInfo(entry: LogEntry): Promise<void> {
        console.log(JSON.stringify(entry, undefined, "\t"));
        return Promise.resolve();
    }

    reportError(entry: LogEntry): Promise<void> {
        console.error(JSON.stringify(entry, undefined, "\t"));
        return Promise.resolve();
    }
    reportWarning(entry: LogEntry): Promise<void> {
        console.warn(JSON.stringify(entry, undefined, "\t"));
        return Promise.resolve();
    }
    read(_: () => {}): Promise<LogEntry[]> {
        const error = new Error("This operation is not supported.");
        error.name = ERRORS.NOT_SUPPORTED;
        Error.captureStackTrace(error);
        return Promise.reject(error);
    }
    findByKey(_: () => string): Promise<LogEntry> {
        const error = new Error("This operation is not supported.");
        error.name = ERRORS.NOT_SUPPORTED;
        Error.captureStackTrace(error);
        return Promise.reject(error);
    }


}

const entryParser: (entryType: string, context: IContext, description: string) => LogEntry = (entryType, context, description) => {
    return {
        date: new Date(),
        type: entryType,
        comments: description,
        details: `Processing "${context.description}" for "${context.actor}" at "${context.provider}".`
    } as LogEntry;
};
export class ApplicationLogger implements ILogger<LogEntry>{

    store: FirebaseStore<ApplicationLogEntry, LogEntry>;

    /**
     *
     */
    constructor(appName: string, actor: IIdentity) {
        const context = {
            actor: actor.id!,
            description: "Application events registration",
            provider: "Application Logger",
            user: "system"
        } as IContext

        this.store = new FirebaseStore<ApplicationLogEntry, LogEntry>(appName, { storeName: "app-log" }, context, new ConsoleLogger(), entryParser);

    }

    reportInfo(entry: LogEntry): Promise<void> {
        const action: Action<ApplicationLogEntry> = { storeAction: "ADD", data: entry };
        this.store.executeAction(action);
        return Promise.resolve();
    }

    reportError(entry: LogEntry): Promise<void> {
        const action: Action<ApplicationLogEntry> = { storeAction: "ADD", data: entry };
        this.store.executeAction(action);
        return Promise.resolve();
    }
    reportWarning(entry: LogEntry): Promise<void> {
        const action: Action<ApplicationLogEntry> = { storeAction: "ADD", data: entry };
        this.store.executeAction(action);
        return Promise.resolve();
    }
    async read(filter: () => {}): Promise<LogEntry[]> {
        const action: Action<ApplicationLogEntry> = {
            storeAction: "READ"
        };
        if (filter) {
            action.filter = filter;

        }
        const taskResult = await this.store.executeAction(action);

        if (taskResult.result instanceof Error) {
            const error = taskResult.result;
            error.name = ERRORS.NOT_SUPPORTED;
            Error.captureStackTrace(error);
            Promise.reject(error);
        }

        return Promise.resolve(taskResult.result as Array<ApplicationLogEntry>);
    }
    async findByKey(key: () => string): Promise<LogEntry> {
        const action: Action<ApplicationLogEntry> = {
            storeAction: "FIND",
            filter: () => ({ id: key() })
        };
        const taskResult = await this.store.executeAction(action);

        if (taskResult.result instanceof Error) {
            const error = taskResult.result;
            error.name = ERRORS.NOT_SUPPORTED;
            Error.captureStackTrace(error);
            Promise.reject(error);
        }

        return Promise.resolve(taskResult.result as ApplicationLogEntry);
    }


}