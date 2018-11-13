import { IIdentity, ILogger } from "../types";
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
export declare class ConsoleLogger implements ILogger<LogEntry> {
    reportInfo(entry: LogEntry): Promise<void>;
    reportError(entry: LogEntry): Promise<void>;
    reportWarning(entry: LogEntry): Promise<void>;
    read(_: () => {}): Promise<LogEntry[]>;
    findByKey(_: () => string): Promise<LogEntry>;
}
export declare class ApplicationLogger implements ILogger<LogEntry> {
    store: FirebaseStore<ApplicationLogEntry, LogEntry>;
    /**
     *
     */
    constructor(appName: string, actor: IIdentity);
    reportInfo(entry: LogEntry): Promise<void>;
    reportError(entry: LogEntry): Promise<void>;
    reportWarning(entry: LogEntry): Promise<void>;
    read(filter: () => {}): Promise<LogEntry[]>;
    findByKey(key: () => string): Promise<LogEntry>;
}
