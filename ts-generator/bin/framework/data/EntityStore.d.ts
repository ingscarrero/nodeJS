import { IDocument } from '../common/DataStore';
import DataStore from "../common/DataStore";
import { LogEntry } from "../application";
import { IContext, IIndexable, ITaskResult } from "../types";
export interface IValidationResult {
    passed: boolean;
    description: string;
    resultDetails: string;
}
export declare abstract class EntityStore<T extends IDocument> {
    protected readonly store: DataStore<T, LogEntry>;
    protected isReady: boolean;
    /**
     *
     */
    constructor(appName: string, applicationContext: IContext, enableAuditing?: boolean, includeDeleted?: boolean, allowDelete?: boolean);
    protected read(fields?: string[], orderBy?: string[], limit?: number, page?: number): Promise<ITaskResult<T>>;
    protected find(filter: () => IIndexable, fields?: string[], orderBy?: string[], limit?: number, page?: number): Promise<ITaskResult<T>>;
    protected findOne(filter: () => IIndexable, fields?: string[], orderBy?: string[], page?: number): Promise<ITaskResult<T>>;
    protected updateOne(filter: () => IIndexable, data: Partial<T>): Promise<ITaskResult<T>>;
    protected update(filter: () => IIndexable, data: Partial<T>): Promise<ITaskResult<T>>;
    protected add(data: Partial<T>): Promise<ITaskResult<T>>;
    protected remove(filter: () => IIndexable): Promise<ITaskResult<T>>;
    protected removeAll(filter?: () => IIndexable): Promise<ITaskResult<T>>;
    private validateAction;
    protected validateInsert(input: Partial<T>): Promise<IValidationResult>;
    protected validateUpdate(input: Partial<T>, target: () => IIndexable): Promise<IValidationResult>;
    protected validateUpdateAll(input: Partial<T>, target: () => IIndexable): Promise<IValidationResult>;
    protected validateDelete(target: () => IIndexable): Promise<IValidationResult>;
    protected validateDeleteAll(target?: () => IIndexable): Promise<IValidationResult>;
    protected validateReading(target?: () => IIndexable): Promise<IValidationResult>;
    protected abstract getComponentId(): string;
    protected abstract getCollectionName(): string;
}
