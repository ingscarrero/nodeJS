import * as admin from 'firebase-admin/lib';
import DataStore, { IDocument } from '../../../common/DataStore';
import { IFilterCriteria } from "../../../common/Filters";
import { IContext, IDataStoreOptions, ILogger, ISearchOptions, IIndexable } from '../../../types';
export declare type FirebaseSettings = {
    databaseURL: string;
    projectId: string;
    serviceAccountId: string;
    storageBucket: string;
};
export declare function firebase(appName: string, settings?: FirebaseSettings, cert?: string | admin.ServiceAccount): admin.app.App;
declare class FirebaseStore<T extends IDocument, LogEntry> extends DataStore<T, LogEntry> {
    private collection;
    /**
     *
     */
    constructor(appName: string, options: IDataStoreOptions, context: IContext, logger: ILogger<LogEntry>, entryParser: (entryType: string, context: IContext, description: string) => LogEntry);
    private generateFilterQuery;
    private generateOrderByQuery;
    private generateOptionsBasedQuery;
    protected read(filter?: () => IIndexable, options?: ISearchOptions): Promise<T[]>;
    protected find(filter: () => IFilterCriteria, options?: ISearchOptions): Promise<T[]>;
    protected findOne(filter: () => IFilterCriteria, options?: ISearchOptions): Promise<T>;
    protected add(data: Partial<T>): Promise<T>;
    protected updateOne(filter: () => IFilterCriteria, data: Partial<T>): Promise<T>;
    protected update(filter: () => IFilterCriteria, data: Partial<T>): Promise<T[]>;
    protected deleteOne(filter: () => IFilterCriteria): Promise<T>;
    protected delete(filter?: (() => IFilterCriteria) | undefined): Promise<T[]>;
    init(): Promise<void>;
}
export default FirebaseStore;
