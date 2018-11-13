import { ITaskResult, IDataStoreOptions, IContext, ILogger, ISearchOptions, Action, IIdentity, IIndexable } from "../types";
import TaskContext from "./TaskContext";
import { IFilterCriteria } from "./Filters";
import { DeleteAction, UpdateAction, SearchAction, AddAction } from "../types/StoreAction";

export type DocumentStatus = "NEW" | "ACTIVE" | "DELETED";
export interface IDocument extends IIdentity {
    status?: DocumentStatus
}


export type StoreAction = "READ" | "FIND" | "FIND_ALL" | "ADD" | "UPDATE" | "UPDATE_ALL" | "DELETE" | "DELETE_ALL";

export const STORE_ACTIONS: { [key in StoreAction]: StoreAction } = {
    READ: "READ",
    FIND: "FIND",
    FIND_ALL: "FIND_ALL",
    ADD: "ADD",
    UPDATE: "UPDATE",
    UPDATE_ALL: "UPDATE_ALL",
    DELETE: "DELETE",
    DELETE_ALL: "DELETE_ALL"
}

abstract class DataStore<T extends IDocument, LogEntry> extends TaskContext<LogEntry>{

    public readonly options: IDataStoreOptions;

    /**
     *
     */
    constructor(
        options: IDataStoreOptions,
        context: IContext,
        logger: ILogger<LogEntry>,
        entryParser: (eventType: string, context: IContext, description: string) => LogEntry
    ) {
        super(context, logger, entryParser)
        this.options = options;
    }

    abstract init(): Promise<void>;
    protected abstract read(filter?: () => IIndexable, options?: ISearchOptions): Promise<Array<T>>;
    protected abstract find(filter: () => IFilterCriteria, options?: ISearchOptions): Promise<Array<T>>;
    protected abstract findOne(filter: () => IFilterCriteria, options?: ISearchOptions): Promise<T>;
    protected abstract add(data: Partial<T | IDocument>): Promise<T>;
    protected abstract updateOne(filter: () => IFilterCriteria, data: Partial<T | IDocument>): Promise<T>;
    protected abstract update(filter: () => IFilterCriteria, data: Partial<T | IDocument>): Promise<Array<T>>;
    protected abstract deleteOne(filter: () => IFilterCriteria): Promise<T>
    protected abstract delete(filter?: () => IIndexable): Promise<Array<T>>

    public executeAction(action: Action<T>): Promise<ITaskResult<T>> {
        switch (action.storeAction) {
            case STORE_ACTIONS.ADD:
                return this.runAddAction(action);
            case STORE_ACTIONS.UPDATE:
                return this.runUpdateAction(action);
            case STORE_ACTIONS.UPDATE_ALL:
                return this.runUpdateAllAction(action);
            case STORE_ACTIONS.DELETE:
                return this.runDeleteAction(action);
            case STORE_ACTIONS.DELETE_ALL:
                return this.runDeleteAllAction(action);
            case STORE_ACTIONS.READ:
                return this.runReadAction(action);
            case STORE_ACTIONS.FIND:
                return this.runFindAction(action);
            default:
                return this.runFindAllAction(action);
        }
    }


    private runDeleteAction(action: Action<T>): Promise<ITaskResult<T>> {
        const deleteAction = action as DeleteAction;
        if (!this.options.allowDelete) {
            return this.executeAction({
                filter: deleteAction.filter,
                data: { status: "DELETED" },
                storeAction: STORE_ACTIONS.UPDATE
            } as UpdateAction<T>)
        }
        return this.execute(() => this.deleteOne(deleteAction.filter!), `Remove the document in the store [${this.options.storeName}] with the id [${deleteAction.filter!().id!}].\n`);
    }

    private runDeleteAllAction(action: Action<T>): Promise<ITaskResult<T>> {
        const deleteAllAction = action as DeleteAction;
        if (!this.options.allowDelete) {
            return this.executeAction({
                filter: deleteAllAction.filter,
                data: {},
                storeAction: "UPDATE"
            } as UpdateAction<T>)
        }
        return this.execute(() => this.delete(deleteAllAction.filter!), `Remove the documents in the store [${this.options.storeName}] matching the following criteria:\n${JSON.stringify(deleteAllAction.filter!(), undefined, "\t")}\n`);
    }

    private runReadAction(action: Action<T>): Promise<ITaskResult<T>> {
        const readAction = action as SearchAction;
        return this.execute(() => this.read(readAction.filter, readAction.options), `Read the documents in the store [${this.options.storeName}]${readAction.filter ? ` matching the following criteria:\n${JSON.stringify(readAction.filter!(), undefined, "\t")}.\n` :
            ".\n"}`);
    }

    private runFindAction(action: Action<T>): Promise<ITaskResult<T>> {
        const findAction = action as SearchAction;
        return this.execute(() => this.findOne(findAction.filter!, findAction.options), `Find the document in the store [${this.options.storeName}] with the id [${findAction.filter!().id!}].\n`);
    }

    private runFindAllAction(action: Action<T>): Promise<ITaskResult<T>> {
        const readAllAction = action as SearchAction;
        return this.execute(() => this.find(readAllAction.filter!, readAllAction.options), `Find the documents in the store [${this.options.storeName}] matching the following criteria:\n${JSON.stringify(readAllAction.filter!(), undefined, "\t")}\n`);
    }

    private runUpdateAction(action: Action<T>): Promise<ITaskResult<T>> {
        const updateAction = action as UpdateAction<T>;
        return this.execute(() => this.updateOne(updateAction.filter!, updateAction.data), `Update the document in the store [${this.options.storeName}] with the id [${updateAction.filter!().id!}].\n`);
    }

    private runUpdateAllAction(action: Action<T>): Promise<ITaskResult<T>> {
        const updateAllAction = action as UpdateAction<T>;
        return this.execute(() => this.update(updateAllAction.filter!, updateAllAction.data), `Update the documents in the store [${this.options.storeName}] matching the following criteria:\n${JSON.stringify(updateAllAction.filter!(), undefined, "\t")}\n`);
    }

    private runAddAction(action: Action<T>): Promise<ITaskResult<T>> {
        const addAction = action as AddAction<T>;
        return this.execute(() => this.add(addAction.data), `Add a new document to the store [${this.options.storeName}].\n`);
    }
}

export default DataStore;