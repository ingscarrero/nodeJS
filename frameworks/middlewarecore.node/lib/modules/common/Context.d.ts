import { ValidationResult, ContextAction, EventKind, Store, Event } from "./Common";
import { firestore } from "firebase-admin";
export declare abstract class Logger {
    logStore: Store<Event<"Warning" | "Error" | "Info">>;
    constructor(store: Store<Event<"Warning" | "Error" | "Info">>);
    abstract map<T extends EventKind, U>(event: Event<T>): U;
    log<T extends EventKind>(entry: Event<T>): Promise<void>;
    read<U>(from: Date, to?: Date, kind?: EventKind, actor?: string, component?: string): Promise<Array<U>>;
}
export declare abstract class Context {
    logger: Logger;
    constructor(logger: Logger);
    abstract performTask<U extends Context, T extends ContextAction, Result>(action: T, module: string, task: (context: U) => Promise<Result>): Promise<Result>;
}
export declare abstract class DataProvider {
    dataSource: firestore.Firestore;
    constructor(dataSource: firestore.Firestore);
}
export declare abstract class ValidableContext extends Context {
    constructor(logger: Logger);
    abstract validateContext(): Promise<ValidationResult>;
    abstract validateTask(action: ContextAction, componentName: string): Promise<ValidationResult>;
    abstract getActorInformation(): string;
    performTask<U extends Context, Result>(action: ContextAction, module: string, task: (context: U) => Promise<Result>): Promise<Result>;
}
