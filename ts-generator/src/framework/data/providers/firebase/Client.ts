// import * as client from 'firebase';
// import DataStore, { IDocument } from '../../../common/DataStore';
// import { IFilterCriteria, Comparer } from "../../../common/Filters";
// import { IContext, IDataStoreOptions, ILogger, ISearchOptions, ERRORS, IIndexable } from '../../../types';


// export type FirebaseSettings = {
//     databaseURL: string,
//     projectId: string,
//     serviceAccountId: string,
//     storageBucket: string
// }
// export function firebase(appName: string, settings?: FirebaseSettings) {
//     if (client.apps.length) {
//         return client.app(appName);
//     }

//     let app: client.app.App;

//     app = client.initializeApp({
//         ...settings
//     }, appName);

//     app.firestore().settings({
//         timestampsInSnapshots: true
//     });

//     return app;
// };

// class FirebaseStore<T extends IDocument, LogEntry> extends DataStore<T, LogEntry> {
//     private collection: client.firestore.CollectionReference;
//     /**
//      *
//      */
//     constructor(
//         appName: string,
//         options: IDataStoreOptions,
//         context: IContext,
//         logger: ILogger<LogEntry>,
//         entryParser: (entryType: string, context: IContext, description: string) => LogEntry
//     ) {
//         super(
//             options,
//             context,
//             logger,
//             entryParser
//         );
//         this.collection = firebase(appName).firestore().collection(this.options.storeName);
//     }


//     private generateFilterQuery(query: client.firestore.Query, criteria: IFilterCriteria) {
//         return Object.keys(criteria)
//             .reduce((prev: client.firestore.Query, next: string) => {
//                 if (criteria[next] instanceof Comparer) {
//                     let criterion = criteria[next] as Comparer;
//                     if (criterion.operator === "!=") {
//                         return prev;
//                     }
//                     return prev.where(next, criterion.operator, criterion.value);
//                 }
//                 return prev.where(next, "==", criteria[next]);
//             }, query);
//     }

//     private generateOrderByQuery(query: client.firestore.Query, orderBy: string[]) {
//         return orderBy.reduce((prev: client.firestore.Query, next) => {
//             const [field, direction] = next.split(" ");
//             return prev.orderBy(field, direction === "asc" ? "asc" : "desc");
//         }, query);
//     }
//     private generateOptionsBasedQuery(query: client.firestore.Query, options: ISearchOptions) {
//         if (options.orderBy) {
//             query = this.generateOrderByQuery(query, options.orderBy);
//         }
//         if (options.limit) {
//             query = query.limit(options.limit);
//         }
//         return query;
//     }
//     protected async read(filter?: () => IIndexable, options?: ISearchOptions): Promise<T[]> {
//         let documents: undefined | client.firestore.QuerySnapshot;

//         let query: client.firestore.Query = this.collection;

//         if (filter) {
//             let { id, ...criteria } = filter();
//             query = this.generateFilterQuery(query, criteria);
//         }

//         if (options) {
//             query = this.generateOptionsBasedQuery(query, options);
//         }

//         documents = await query.get();
//         return documents.docs.map(d => Object.assign({} as T, { id: d.id }, d.data()));
//     }


//     protected async find(filter: () => IFilterCriteria, options?: ISearchOptions): Promise<T[]> {

//         let { id, ...criteria } = filter();
//         let query = this.generateFilterQuery(this.collection, criteria);

//         if (options) {
//             query = this.generateOptionsBasedQuery(query, options);
//         }

//         const documents = await query.get();

//         if (documents.empty) {
//             const error = new Error("No documents found");
//             error.name = ERRORS.NO_DATA_ERROR;
//             Error.captureStackTrace(error);
//             return Promise.reject(error);
//         }

//         return documents.docs.map(d => Object.assign({} as T, { id: d.id }, d.data()));
//     }

//     protected async findOne(filter: () => IFilterCriteria, options?: ISearchOptions): Promise<T> {
//         let { id, ...criteria } = filter();
//         if (id) {
//             let document = await this.collection.doc(id).get();
//             let instance = Object.assign({} as T,
//                 { id },
//                 document.data()
//             );
//             if (criteria) {
//                 const match = Object.keys(criteria).every(k => {
//                     if (criteria[k] instanceof Comparer) {
//                         let criterion = criteria[k] as Comparer;
//                         return eval(`${instance[k]} ${criterion.operator} ${criterion.value}`);
//                     } else {
//                         return instance[k] === criteria[k];
//                     }
//                 });
//                 if (!match) {
//                     const error = new Error("No documents matching the provided criteria were found in the collection.");
//                     error.name = ERRORS.NO_MATCH_ERROR;
//                     Error.captureStackTrace(error);
//                     return Promise.reject(error);
//                 }
//                 return instance;
//             }

//         }

//         let query = this.generateFilterQuery(this.collection, criteria);

//         if (options) {
//             query = this.generateOptionsBasedQuery(query, options);
//         }

//         const documents = await query.get();
//         if (documents.empty) {
//             const error = new Error("No documents found.");
//             error.name = ERRORS.NO_DATA_ERROR;
//             Error.captureStackTrace(error);
//             return Promise.reject(error);
//         }
//         const [document] = documents.docs.map(d => Object.assign({} as T, { id: d.id }, d.data()));

//         return document;

//     }
//     protected async add(data: Partial<T>): Promise<T> {
//         const document = await this.collection.add(Object.assign({
//         } as client.firestore.DocumentData, data));
//         return Object.assign({} as T, data, { id: document.id });
//     }
//     protected async updateOne(filter: () => IFilterCriteria, data: Partial<T>): Promise<T> {
//         let { id, ...criteria } = filter();
//         if (id) {
//             let document = await this.collection.doc(id).get();

//             if (!document.exists) {
//                 const error = new Error("No documents found.");
//                 error.name = ERRORS.NO_DATA_ERROR;
//                 Error.captureStackTrace(error);
//                 return Promise.reject(error);
//             }

//             let instance = Object.assign({} as T,
//                 { id },
//                 document.data()
//             );
//             if (criteria) {
//                 const match = Object.keys(criteria).every(k => {
//                     if (criteria[k] instanceof Comparer) {
//                         let criterion = criteria[k] as Comparer;
//                         return eval(`${instance[k]} ${criterion.operator} ${criterion.value}`);
//                     } else {
//                         return instance[k] === criteria[k];
//                     }
//                 });
//                 if (!match) {
//                     const error = new Error("No documents matching the provided criteria were found in the collection.");
//                     error.name = ERRORS.NO_MATCH_ERROR;
//                     Error.captureStackTrace(error);
//                     return Promise.reject(error);
//                 }
//             }
//             document.ref.set(Object.assign({
//             } as client.firestore.DocumentData, data));

//             return Object.assign({} as T, data, { id: document.id });
//         }

//         let query: client.firestore.Query = this.collection;

//         query = this.generateFilterQuery(query, criteria);
//         let documents = await query.get();

//         if (!documents.empty) {
//             const error = new Error("No documents matching the provided criteria were found in the collection.");
//             error.name = ERRORS.NO_MATCH_ERROR;
//             Error.captureStackTrace(error);
//             return Promise.reject(error);
//         }

//         if (documents.size > 1) {
//             const error = new Error("More than one documents match the provided criteria. Try again with a more refined criteria.");
//             error.name = ERRORS.MULTIPLE_DOCUMENTS;
//             Error.captureStackTrace(error);
//             return Promise.reject(error);
//         }
//         let [docRef] = documents.docs;
//         await docRef.ref.set(Object.assign({
//         } as client.firestore.DocumentData, data));

//         return Object.assign({} as T, data, { id: docRef.id });
//     }
//     protected async update(filter: () => IFilterCriteria, data: Partial<T>): Promise<T[]> {
//         let { id, ...criteria } = filter();

//         let query: client.firestore.Query = this.collection;

//         query = this.generateFilterQuery(query, criteria);
//         let documents = await query.get();

//         if (!documents.empty) {
//             const error = new Error("No documents matching the provided criteria were found in the collection.");
//             error.name = ERRORS.NO_MATCH_ERROR;
//             Error.captureStackTrace(error);
//             return Promise.reject(error);
//         }

//         const batch = this.collection.firestore.batch();
//         documents.docs.map(doc => {
//             batch.set(doc.ref,
//                 Object.assign({
//                 } as client.firestore.DocumentData, data), { merge: true });
//         });
//         await batch.commit();

//         // await Promise.all(documents.docs.map(doc =>
//         //     doc.ref.set(Object.assign({
//         //     } as admin.firestore.DocumentData, data))
//         // ));

//         return documents.docs.map(doc => Object.assign({} as T, data, { id: doc.id }));
//     }
//     protected async deleteOne(filter: () => IFilterCriteria): Promise<T> {
//         let { id, ...criteria } = filter();
//         if (id) {
//             let document = await this.collection.doc(id).get();

//             if (!document.exists) {
//                 const error = new Error("No documents found.");
//                 error.name = ERRORS.NO_DATA_ERROR;
//                 Error.captureStackTrace(error);
//                 return Promise.reject(error);
//             }

//             let instance = Object.assign({} as T,
//                 { id },
//                 document.data()
//             );
//             if (criteria) {
//                 const match = Object.keys(criteria).every(k => {
//                     if (criteria[k] instanceof Comparer) {
//                         let criterion = criteria[k] as Comparer;
//                         return eval(`${instance[k]} ${criterion.operator} ${criterion.value}`);
//                     } else {
//                         return instance[k] === criteria[k];
//                     }
//                 });
//                 if (!match) {
//                     const error = new Error("No documents matching the provided criteria were found in the collection.");
//                     error.name = ERRORS.NO_MATCH_ERROR;
//                     Error.captureStackTrace(error);
//                     return Promise.reject(error);
//                 }
//             }
//             this.collection.doc(id).delete()

//             return Object.assign({} as T, document.data(), { id: document.id });
//         }

//         let query: client.firestore.Query = this.collection;

//         query = this.generateFilterQuery(query, criteria);
//         let documents = await query.get();

//         if (!documents.empty) {
//             const error = new Error("No documents matching the provided criteria were found in the collection.");
//             error.name = ERRORS.NO_MATCH_ERROR;
//             Error.captureStackTrace(error);
//             return Promise.reject(error);
//         }

//         if (documents.size > 1) {
//             const error = new Error("More than one documents match the provided criteria. Try again with a more refined criteria.");
//             error.name = ERRORS.MULTIPLE_DOCUMENTS;
//             Error.captureStackTrace(error);
//             return Promise.reject(error);
//         }
//         let [docRef] = documents.docs;
//         await docRef.ref.delete();

//         return Object.assign({} as T, docRef.data, { id: docRef.id });
//     }
//     protected async delete(filter?: (() => IFilterCriteria) | undefined): Promise<T[]> {

//         if (filter) {
//             let { id, ...criteria } = filter();

//             let query: client.firestore.Query = this.collection;

//             query = this.generateFilterQuery(query, criteria);

//             const documents = await query.get();

//             if (!documents.empty) {
//                 const error = new Error("No documents matching the provided criteria were found in the collection.");
//                 error.name = ERRORS.NO_MATCH_ERROR;
//                 Error.captureStackTrace(error);
//                 return Promise.reject(error);
//             }

//             await Promise.all(documents.docs.map(doc =>
//                 doc.ref.delete()));

//             return documents.docs.map(doc => Object.assign({} as T, { id: doc.id }));
//         }

//         const documents = await this.collection.get();
//         const batch = this.collection.firestore.batch();
//         documents.docs.map(doc => {
//             batch.delete(doc.ref);
//         });
//         await batch.commit();
//         return documents.docs.map(doc => Object.assign({} as T, { id: doc.id }));
//     }

//     init(): Promise<void> {
//         return Promise.resolve();
//     }
// }

// export default FirebaseStore;