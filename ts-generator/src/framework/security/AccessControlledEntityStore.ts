import { EntityStore, IValidationResult } from "../data";
import { IDocument, StoreAction, STORE_ACTIONS } from "../common/DataStore";
import { IContext, IIndexable, IIdentity } from "../types";

export interface StoreAccessControl {
    role: IIdentity;
    storeActions: StoreAction[];
}
export abstract class AccessCotrolledEntityStore<T extends IDocument> extends EntityStore<T>{

    public storeActionsForContext: StoreAccessControl[];
    protected contextUserRole: IIdentity;

    /**
     *
     */
    constructor(
        appName: string,
        context: IContext,
        storeActionsForContext: StoreAccessControl[],
        contextUserRole: IIdentity,
        enableAuditing = false,
        includeDeleted = false,
        allowDelete = false) {

        super(appName, context, enableAuditing, includeDeleted, allowDelete);
        this.storeActionsForContext = storeActionsForContext;
        this.contextUserRole = contextUserRole;
    }

    private validateActionInContext(
        previousValidationResult: IValidationResult,
        validatingAction: StoreAction) {

        if (!previousValidationResult.passed) {
            return previousValidationResult;
        }
        previousValidationResult.passed = this.storeActionsForContext.
            some(sa => sa.role.id === this.contextUserRole.id &&
                sa.storeActions.some(a => a === validatingAction));

        if (!previousValidationResult.passed) {
            previousValidationResult.resultDetails = `The user's role for this context cannot execute action [${validatingAction}] on the store [${this.getCollectionName()}].`
        }

        return previousValidationResult;
    }


    protected async validateUpdateAll(input: Partial<T>, target: () => IIndexable): Promise<IValidationResult> {

        let validationResult = await super.validateUpdateAll(input, target);
        const validatingAction = STORE_ACTIONS.UPDATE_ALL;
        return this.validateActionInContext(validationResult, validatingAction);
    }

    protected async validateUpdate(input: Partial<T>, target: () => IIndexable): Promise<IValidationResult> {
        let validationResult = await super.validateUpdate(input, target);
        const validatingAction = STORE_ACTIONS.UPDATE;
        return Promise.resolve(this.validateActionInContext(validationResult, validatingAction));
    }

    protected async validateInsert(input: Partial<T>): Promise<IValidationResult> {
        let validationResult = await super.validateInsert(input);
        const validatingAction = STORE_ACTIONS.ADD;
        return Promise.resolve(this.validateActionInContext(validationResult, validatingAction));
    }

    protected async validateDelete(target: () => IIndexable): Promise<IValidationResult> {
        let validationResult = await super.validateDelete(target);
        const validatingAction = STORE_ACTIONS.DELETE;
        return Promise.resolve(this.validateActionInContext(validationResult, validatingAction));
    }

    protected async validateDeleteAll(target?: () => IIndexable): Promise<IValidationResult> {
        let validationResult = await super.validateDeleteAll(target);
        const validatingAction = STORE_ACTIONS.DELETE_ALL;
        return Promise.resolve(this.validateActionInContext(validationResult, validatingAction));
    }

    protected async validateReading(target?: () => IIndexable): Promise<IValidationResult> {
        let validationResult = await super.validateReading(target);
        const validatingAction = STORE_ACTIONS.READ;
        return Promise.resolve(this.validateActionInContext(validationResult, validatingAction));
    }


}