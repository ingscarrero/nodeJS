"use strict";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2ZyYW1ld29yay9kYXRhL3Byb3ZpZGVycy9maXJlYmFzZS9DbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHNDQUFzQztBQUN0QyxvRUFBb0U7QUFDcEUsdUVBQXVFO0FBQ3ZFLDZHQUE2RztBQUc3RyxtQ0FBbUM7QUFDbkMsMkJBQTJCO0FBQzNCLHlCQUF5QjtBQUN6QixnQ0FBZ0M7QUFDaEMsNEJBQTRCO0FBQzVCLElBQUk7QUFDSiwyRUFBMkU7QUFDM0UsZ0NBQWdDO0FBQ2hDLHNDQUFzQztBQUN0QyxRQUFRO0FBRVIsK0JBQStCO0FBRS9CLG1DQUFtQztBQUNuQyxzQkFBc0I7QUFDdEIsbUJBQW1CO0FBRW5CLGlDQUFpQztBQUNqQyxzQ0FBc0M7QUFDdEMsVUFBVTtBQUVWLGtCQUFrQjtBQUNsQixLQUFLO0FBRUwsc0ZBQXNGO0FBQ3RGLGdFQUFnRTtBQUNoRSxVQUFVO0FBQ1YsU0FBUztBQUNULFVBQVU7QUFDVixtQkFBbUI7QUFDbkIsMkJBQTJCO0FBQzNCLHNDQUFzQztBQUN0Qyw2QkFBNkI7QUFDN0IscUNBQXFDO0FBQ3JDLCtGQUErRjtBQUMvRixVQUFVO0FBQ1YsaUJBQWlCO0FBQ2pCLHVCQUF1QjtBQUN2Qix1QkFBdUI7QUFDdkIsc0JBQXNCO0FBQ3RCLDBCQUEwQjtBQUMxQixhQUFhO0FBQ2IsOEZBQThGO0FBQzlGLFFBQVE7QUFHUiw4RkFBOEY7QUFDOUYsdUNBQXVDO0FBQ3ZDLHdFQUF3RTtBQUN4RSw0REFBNEQ7QUFDNUQsa0VBQWtFO0FBQ2xFLHlEQUF5RDtBQUN6RCx1Q0FBdUM7QUFDdkMsd0JBQXdCO0FBQ3hCLG9GQUFvRjtBQUNwRixvQkFBb0I7QUFDcEIsaUVBQWlFO0FBQ2pFLHlCQUF5QjtBQUN6QixRQUFRO0FBRVIsdUZBQXVGO0FBQ3ZGLDBFQUEwRTtBQUMxRSwwREFBMEQ7QUFDMUQsZ0ZBQWdGO0FBQ2hG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