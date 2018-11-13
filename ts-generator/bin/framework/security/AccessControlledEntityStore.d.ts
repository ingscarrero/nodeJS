import { EntityStore, IValidationResult } from "../data";
import { IDocument, StoreAction } from "../common/DataStore";
import { IContext, IIndexable, IIdentity } from "../types";
export interface StoreAccessControl {
    role: IIdentity;
    storeActions: StoreAction[];
}
export declare abstract class AccessCotrolledEntityStore<T extends IDocument> extends EntityStore<T> {
    storeActionsForContext: StoreAccessControl[];
    protected contextUserRole: IIdentity;
    /**
     *
     */
    constructor(appName: string, context: IContext, storeActionsForContext: StoreAccessControl[], contextUserRole: IIdentity, enableAuditing?: boolean, includeDeleted?: boolean, allowDelete?: boolean);
    private validateActionInContext;
    protected validateUpdateAll(input: Partial<T>, target: () => IIndexable): Promise<IValidationResult>;
    protected validateUpdate(input: Partial<T>, target: () => IIndexable): Promise<IValidationResult>;
    protected validateInsert(input: Partial<T>): Promise<IValidationResult>;
    protected validateDelete(target: () => IIndexable): Promise<IValidationResult>;
    protected validateDeleteAll(target?: () => IIndexable): Promise<IValidationResult>;
    protected validateReading(target?: () => IIndexable): Promise<IValidationResult>;
}
