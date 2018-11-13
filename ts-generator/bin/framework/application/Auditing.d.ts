import { IIndexable, IContext, Entity } from "../types";
export interface IAuditEventChange<T> {
    field: keyof T;
    from: T[keyof T];
    to: T[keyof T];
}
export interface IAuditEvent<T> extends IContext {
    details: Array<IAuditEventChange<T>>;
    date: Date;
}
export declare abstract class Auditable<T extends IIndexable> extends Entity<T> {
    protected stateDetails?: Array<IAuditEventChange<T>>;
    protected trace: Array<IAuditEvent<T>>;
    constructor(context: IContext, data?: T, trace?: Array<IAuditEvent<T>>);
    setState(newState: Partial<T>): void;
    protected handleSetProperty(name: keyof T, value: T[keyof T]): void;
}
