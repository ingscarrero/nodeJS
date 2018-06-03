import { Logger, EventKind, Store, Event } from "../common";
export declare class ApplicationLogger extends Logger {
    constructor(store: Store<Event<"Warning" | "Error" | "Info">>);
    map<T extends EventKind, U>(event: Event<T>): U;
}
