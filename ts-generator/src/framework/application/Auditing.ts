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

export abstract class Auditable<T extends IIndexable> extends Entity<T>{

    protected stateDetails?: Array<IAuditEventChange<T>>;
    protected trace: Array<IAuditEvent<T>>;
    constructor(context: IContext, data?: T, trace?: Array<IAuditEvent<T>>) {
        super(data, context);
        this.trace = trace || new Array<IAuditEvent<T>>();
    }


    public setState(newState: Partial<T>) {

        const { actor, description, provider, user } = this.context!;

        this.stateDetails = new Array<IAuditEventChange<T>>();

        super.setState(newState);

        this.trace.push({
            actor,
            details: this.stateDetails,
            description,
            provider,
            user,
            date: new Date()
        });
    }

    protected handleSetProperty(name: keyof T, value: T[keyof T]): void {
        if (this.stateDetails) {
            this.stateDetails.push({
                field: name,
                from: this.getState()[name],
                to: value
            })
        }
    }
}