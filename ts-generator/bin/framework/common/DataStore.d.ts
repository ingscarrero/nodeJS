import { ITaskResult, IDataStoreOptions, IContext, ILogger, ISearchOptions, Action, IIdentity, IIndexable } from "../types";
import TaskContext from "./TaskContext";
import { IFilterCriteria } from "./Filters";
export declare type DocumentStatus = "NEW" | "ACTIVE" | "DELETED";
export interface IDocument extends IIdentity {
    status?: DocumentStatus;
}
export declare type StoreAction = "READ" | "FIND" | "FIND_ALL" | "ADD" | "UPDATE" | "UPDATE_ALL" | "DELETE" | "DELETE_ALL";
export declare const STORE_ACTIONS: {
    [key in StoreAction]: StoreAction;
};
declare abstract class DataStore<T extends IDocument, LogEntry> extends TaskContext<LogEntry> {
    readonly options: IDataStoreOptions;
    /**
     *
     */
    constructor(options: IDataStoreOptions, context: IContext, logger: ILogger<LogEntry>, entryParser: (eventType: string, context: IContext, description: string) => LogEntry);
    abstract init(): Promise<void>;
    protected abstract read(filter?: () => IIndexable, options?: ISearchOptions): Promise<Array<T>>;
    protected abstract find(filter: () => IFilterCriteria, options?: ISearchOptions): Promise<Array<T>>;
    protected abstract findOne(filter: () => IFilterCriteria, options?: ISearchOptions): Promise<T>;
    protected abstract add(data: Partial<T | IDocument>): Promise<T>;
    protected abstract updateOne(filter: () => IFilterCriteria, data: Partial<T | IDocument>): Promise<T>;
    protected abstract update(filter: () => IFilterCriteria, data: Partial<T | IDocument>): Promise<Array<T>>;
    protected abstract deleteOne(filter: () => IFilterCriteria): Promise<T>;
    protected abstract delete(filter?: () => IIndexable): Promise<Array<T>>;
    executeAction(action: Action<T>): Promise<ITaskResult<T>>;
    private runDeleteAction;
    private runDeleteAllAction;
    private runReadAction;
    private runFindAction;
    private runFindAllAction;
    private runUpdateAction;
    private runUpdateAllAction;
    private runAddAction;
}
export default DataStore;
