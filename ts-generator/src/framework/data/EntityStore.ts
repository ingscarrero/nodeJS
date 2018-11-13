import { IDocument, STORE_ACTIONS } from '../common/DataStore';
import DataStore, { StoreAction } from "../common/DataStore";
import { ApplicationLogEntry, ApplicationLogger, LogEntry } from "../application";
import { IContext, IDataStoreOptions, Action, IIndexable, ITaskResult, ERRORS } from "../types";
import { Data } from "..";

export interface IValidationResult {
    passed: boolean;
    description: string;
    resultDetails: string;
}
export abstract class EntityStore<T extends IDocument>{

    protected readonly store: DataStore<T, LogEntry>;
    protected isReady: boolean;
    /**
     *
     */
    constructor(
        appName: string,
        applicationContext: IContext,
        enableAuditing = false,
        includeDeleted = false,
        allowDelete = false
    ) {

        this.isReady = false;
        const entryParser: (
            entryType: string,
            context: IContext,
            description: string
        ) => ApplicationLogEntry = (
            entryType,
            context,
            description
        ) => {
                return {
                    date: new Date(),
                    type: entryType,
                    details: description,
                    comments: "Reported",
                    client: { id: context.actor },
                    component: { id: context.provider },
                    user: { id: context.user }
                } as ApplicationLogEntry;
            };

        const applicationLogger = new ApplicationLogger(appName, { id: this.getComponentId() });

        const options = {
            storeName: this.getCollectionName(),
            enableAuditing,
            includeDeleted,
            allowDelete
        } as IDataStoreOptions;

        this.store = new Data.Providers.Firebase.FirebaseStore(
            appName,
            options,
            applicationContext,
            applicationLogger,
            entryParser
        );
        this.store.init().then(() => {
            this.isReady = true;
        });
    }

    protected async read(
        fields?: string[],
        orderBy?: string[],
        limit?: number,
        page?: number): Promise<ITaskResult<T>> {

        const storeAction: StoreAction = "READ";

        let validationResult = await this.validateAction(storeAction);

        if (!validationResult.passed) {
            const error = new Error(`The task context hasn't met the task conditions to read the store [${this.getCollectionName()}]'s contents.`);
            error.name = ERRORS.VALIDATIONS_NOT_MET;
            Error.captureStackTrace(error);
            throw error;
        }

        const action: Action<T> = {
            storeAction,
            options: {
                fields,
                orderBy,
                limit,
                page
            }
        };

        const result = await this.store.executeAction(action);
        return result;
    }

    protected async find(
        filter: () => IIndexable,
        fields?: string[],
        orderBy?: string[],
        limit?: number,
        page?: number): Promise<ITaskResult<T>> {

        const storeAction: StoreAction = "FIND_ALL";

        let validationResult = await this.validateAction(storeAction);

        if (!validationResult.passed) {
            const error = new Error(`The task context hasn't met the task conditions to search on the store [${this.getCollectionName()}]'s contents.`);
            error.name = ERRORS.VALIDATIONS_NOT_MET;
            Error.captureStackTrace(error);
            throw error;
        }

        const action: Action<T> = {
            storeAction,
            options: {
                fields,
                orderBy,
                limit,
                page
            },
            filter
        };

        const result = await this.store.executeAction(action);
        return result;
    }

    protected async findOne(
        filter: () => IIndexable,
        fields?: string[],
        orderBy?: string[],
        page?: number): Promise<ITaskResult<T>> {

        const storeAction: StoreAction = "FIND";

        let validationResult = await this.validateAction(storeAction);

        if (!validationResult.passed) {
            const error = new Error(`The task context hasn't met the task conditions to search on the store [${this.getCollectionName()}]'s contents.`);
            error.name = ERRORS.VALIDATIONS_NOT_MET;
            Error.captureStackTrace(error);
            throw error;
        }

        const action: Action<T> = {
            storeAction,
            options: {
                fields,
                orderBy,
                page,
                limit: 1
            },
            filter
        };

        const result = await this.store.executeAction(action);
        return result;
    }

    protected async updateOne(
        filter: () => IIndexable,
        data: Partial<T>): Promise<ITaskResult<T>> {

        const storeAction: StoreAction = "UPDATE";

        let validationResult = await this.validateAction(storeAction);

        if (!validationResult.passed) {
            const error = new Error(`The task context hasn't met the task conditions to change the store [${this.getCollectionName()}]'s contents.`);
            error.name = ERRORS.VALIDATIONS_NOT_MET;
            Error.captureStackTrace(error);
            throw error;
        }

        const action: Action<T> = {
            storeAction,
            filter,
            data
        };

        const result = await this.store.executeAction(action);
        return result;
    }

    protected async update(
        filter: () => IIndexable,
        data: Partial<T>): Promise<ITaskResult<T>> {

        const storeAction: StoreAction = "UPDATE_ALL";

        let validationResult = await this.validateAction(storeAction);

        if (!validationResult.passed) {
            const error = new Error(`The task context hasn't met the task conditions to change the store [${this.getCollectionName()}]'s contents.`);
            error.name = ERRORS.VALIDATIONS_NOT_MET;
            Error.captureStackTrace(error);
            throw error;
        }

        const action: Action<T> = {
            storeAction,
            filter,
            data
        };

        const result = await this.store.executeAction(action);
        return result;
    }

    protected async add(
        data: Partial<T>): Promise<ITaskResult<T>> {

        const storeAction: StoreAction = "ADD";

        let validationResult = await this.validateAction(storeAction);

        if (!validationResult.passed) {
            const error = new Error(`The task context hasn't met the task conditions to add new contents the store [${this.getCollectionName()}]'.`);
            error.name = ERRORS.VALIDATIONS_NOT_MET;
            Error.captureStackTrace(error);
            throw error;
        }

        const action: Action<T> = {
            storeAction,
            data
        };

        const result = await this.store.executeAction(action);
        return result;
    }

    protected async remove(
        filter: () => IIndexable): Promise<ITaskResult<T>> {

        const storeAction: StoreAction = "DELETE";

        let validationResult = await this.validateAction(storeAction, undefined, filter);

        if (!validationResult.passed) {
            const error = new Error(`The task context hasn't met the task conditions to remove contents the store [${this.getCollectionName()}]'.`);
            error.name = ERRORS.VALIDATIONS_NOT_MET;
            Error.captureStackTrace(error);
            throw error;
        }

        const action: Action<T> = {
            storeAction,
            filter
        };

        const result = await this.store.executeAction(action);
        return result;
    }

    protected async removeAll(
        filter?: () => IIndexable): Promise<ITaskResult<T>> {

        const storeAction: StoreAction = "DELETE_ALL";
        const startedAt = new Date();

        let validationResult = await this.validateAction(storeAction, undefined, filter);

        if (!validationResult.passed) {
            const taskResult = {
                comments: `The task context hasn't met the task conditions to remove contents the store [${this.getCollectionName()}]'`,
                startedAt,
                concludedAt: new Date()
            } as ITaskResult<T>;
            return taskResult;
        }

        const action: Action<T> = {
            storeAction,
            filter
        };

        const result = await this.store.executeAction(action);
        return result;
    }


    private async validateAction(storeAction: StoreAction, input?: Partial<T>, target?: () => IIndexable): Promise<IValidationResult> {
        let validationResult: IValidationResult;
        switch (storeAction) {
            case STORE_ACTIONS.ADD:
                validationResult = await this.validateInsert(input!);
                break;
            case STORE_ACTIONS.UPDATE:
                validationResult = await this.validateUpdate(input!, target!);
                break;
            case STORE_ACTIONS.UPDATE_ALL:
                validationResult = await this.validateUpdateAll(input!, target!);
                break;
            case STORE_ACTIONS.DELETE:
                validationResult = await this.validateDelete(target!);
                break;
            case STORE_ACTIONS.DELETE_ALL:
                validationResult = await this.validateDeleteAll(target);
                break;
            default:
                validationResult = await this.validateReading(target);
                break;
        }
        if (!validationResult.passed) {
            const appLogEntry: ApplicationLogEntry = {
                type: "Warning",
                date: new Date(),
                details: `It wasn't possible to execute action [${storeAction}] on store [${this.getCollectionName()}]. The action's validation [${validationResult.description}] hasn't been satisfied. ${validationResult.resultDetails}`,
                comments: `Validations for action [${storeAction}] have failed.`,
                client: { id: this.store.context.actor },
                component: { id: this.store.context.provider },
                user: { id: this.store.context.user }
            }
            this.store.logger.reportWarning(appLogEntry);
        }
        return Promise.resolve(validationResult);
    };

    protected async validateInsert(input: Partial<T>): Promise<IValidationResult> {
        const validationResult: IValidationResult = {
            description: "Check input content for data insertion",
            passed: true,
            resultDetails: "No issues detected"
        }
        if (!input) {
            validationResult.passed = false;
            validationResult.resultDetails = "Undefined input";
        }
        return Promise.resolve(validationResult);
    }
    protected validateUpdate(input: Partial<T>, target: () => IIndexable): Promise<IValidationResult> {
        const validationResult: IValidationResult = {
            description: "Check input content and filter for data modification",
            passed: true,
            resultDetails: "No issues detected"
        }
        if (!input) {
            validationResult.passed = false;
            validationResult.resultDetails = "Undefined input";
        }
        if (!target) {
            validationResult.passed = false;
            validationResult.resultDetails = "Undefined filter";
        }
        return Promise.resolve(validationResult);
    }
    protected validateUpdateAll(input: Partial<T>, target: () => IIndexable): Promise<IValidationResult> {
        const validationResult: IValidationResult = {
            description: "Check input content and filter for massive data modification",
            passed: true,
            resultDetails: "No issues detected"
        }
        if (!input) {
            validationResult.passed = false;
            validationResult.resultDetails = "Undefined input";
        }
        if (!target) {
            validationResult.passed = false;
            validationResult.resultDetails = "Undefined filter";
        }
        return Promise.resolve(validationResult);
    }
    protected validateDelete(target: () => IIndexable): Promise<IValidationResult> {
        const validationResult: IValidationResult = {
            description: "Check filter for data remotion",
            passed: true,
            resultDetails: "No issues detected"
        }
        if (!target) {
            validationResult.passed = false;
            validationResult.resultDetails = "Undefined filter";
        }
        return Promise.resolve(validationResult);
    }
    protected validateDeleteAll(target?: () => IIndexable): Promise<IValidationResult> {
        if (!target) {
            const appLogEntry: ApplicationLogEntry = {
                type: "Warning",
                date: new Date(),
                details: `Action [${STORE_ACTIONS.DELETE_ALL}] on store [${this.getCollectionName()}] will be executed without filter`,
                comments: "No filter has been provided",
                client: { id: this.store.context.actor },
                component: { id: this.store.context.provider },
                user: { id: this.store.context.user }
            }
            this.store.logger.reportWarning(appLogEntry);
        }
        const validationResult: IValidationResult = {
            description: "Check massive data remotion",
            passed: false,
            resultDetails: "Massive remotion is disable by default."
        }
        return Promise.resolve(validationResult);
    }
    protected validateReading(target?: () => IIndexable): Promise<IValidationResult> {
        if (!target) {
            const appLogEntry: ApplicationLogEntry = {
                type: "Info",
                date: new Date(),
                details: `Search action on store [${this.getCollectionName()}] will be executed without filter`,
                comments: "No filter has been provided",
                client: { id: this.store.context.actor },
                component: { id: this.store.context.provider },
                user: { id: this.store.context.user }
            }
            this.store.logger.reportInfo(appLogEntry);
        }
        const validationResult: IValidationResult = {
            description: "Check data retrieval",
            passed: true,
            resultDetails: "No issues detected"
        }
        return Promise.resolve(validationResult);
    }
    protected abstract getComponentId(): string;
    protected abstract getCollectionName(): string;


}