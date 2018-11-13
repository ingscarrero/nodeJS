import { IContext, ITaskResult } from "../framework";
import { AccessCotrolledEntityStore, StoreAccessControl } from "../framework/security";
import { IValidationResult } from "../framework/data";
import { IIndexable, IIdentity, Entity } from "../framework/types";
import { IAuditEvent, Auditable } from "../framework/application";
import { DocumentStatus, IDocument } from '../framework/common/DataStore';
export interface IUser extends IDocument {
    name: string;
    password: string;
}
export declare class User implements IUser {
    readonly name: string;
    readonly password: string;
    readonly id?: string;
    readonly status?: DocumentStatus;
    /**
     *
     */
    constructor();
    static factory(context: IContext, data?: IUser, trace?: Array<IAuditEvent<IUser>>): ComponentFactory;
}
export declare class UserFactory extends Auditable<IUser> {
}
export declare class ComponentFactory extends Entity<IUser> {
}
export declare class Store extends AccessCotrolledEntityStore<User> {
    /**
     *
     */
    constructor(appName: string, context: IContext, acRules: Array<StoreAccessControl>, role: IIdentity, enableAuditing?: boolean, includeDeleted?: boolean);
    protected getComponentId(): string;
    protected getCollectionName(): string;
    getStores(): Promise<ITaskResult<User>>;
    protected validateReading(target?: () => IIndexable): Promise<IValidationResult>;
}
export declare function init(): void;
