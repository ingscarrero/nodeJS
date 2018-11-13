"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin = __importStar(require("firebase-admin/lib"));
const DataStore_1 = __importDefault(require("../../../common/DataStore"));
const Filters_1 = require("../../../common/Filters");
const types_1 = require("../../../types");
function firebase(appName, settings, cert) {
    if (admin.apps.length) {
        return admin.app(appName);
    }
    let credential;
    let app;
    if (cert) {
        credential = admin.credential.cert(cert);
    }
    if (settings) {
        app = admin.initializeApp(Object.assign({}, settings), appName);
    }
    else {
        app = admin.initializeApp({
            credential
        }, appName);
    }
    app.firestore().settings({
        timestampsInSnapshots: true
    });
    return app;
}
exports.firebase = firebase;
;
class FirebaseStore extends DataStore_1.default {
    /**
     *
     */
    constructor(appName, options, context, logger, entryParser) {
        super(options, context, logger, entryParser);
        this.collection = firebase(appName).firestore().collection(this.options.storeName);
    }
    generateFilterQuery(query, criteria) {
        return Object.keys(criteria)
            .reduce((prev, next) => {
            if (criteria[next] instanceof Filters_1.Comparer) {
                let criterion = criteria[next];
                if (criterion.operator === "!=") {
                    return prev;
                }
                return prev.where(next, criterion.operator, criterion.value);
            }
            return prev.where(next, "==", criteria[next]);
        }, query);
    }
    generateOrderByQuery(query, orderBy) {
        return orderBy.reduce((prev, next) => {
            const [field, direction] = next.split(" ");
            return prev.orderBy(field, direction === "asc" ? "asc" : "desc");
        }, query);
    }
    generateOptionsBasedQuery(query, options) {
        if (options.fields) {
            query = query.select(...options.fields);
        }
        if (options.orderBy) {
            query = this.generateOrderByQuery(query, options.orderBy);
        }
        if (options.limit) {
            query = query.limit(options.limit);
        }
        if (options.page) {
            query = query.offset(options.limit * options.page);
        }
        return query;
    }
    read(filter, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let documents;
            let query = this.collection;
            if (filter) {
                let _a = filter(), { id } = _a, criteria = __rest(_a, ["id"]);
                query = this.generateFilterQuery(query, criteria);
            }
            if (options) {
                query = this.generateOptionsBasedQuery(query, options);
            }
            documents = yield query.get();
            return documents.docs.map(d => Object.assign({}, { id: d.id }, d.data()));
        });
    }
    find(filter, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let _a = filter(), { id } = _a, criteria = __rest(_a, ["id"]);
            let query = this.generateFilterQuery(this.collection, criteria);
            if (options) {
                query = this.generateOptionsBasedQuery(query, options);
            }
            const documents = yield query.get();
            if (documents.empty) {
                const error = new Error("No documents found");
                error.name = types_1.ERRORS.NO_DATA_ERROR;
                Error.captureStackTrace(error);
                return Promise.reject(error);
            }
            return documents.docs.map(d => Object.assign({}, { id: d.id }, d.data()));
        });
    }
    findOne(filter, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let _a = filter(), { id } = _a, criteria = __rest(_a, ["id"]);
            if (id) {
                let document = yield this.collection.doc(id).get();
                let instance = Object.assign({}, { id }, document.data());
                if (criteria) {
                    const match = Object.keys(criteria).every(k => {
                        if (criteria[k] instanceof Filters_1.Comparer) {
                            let criterion = criteria[k];
                            return eval(`${instance[k]} ${criterion.operator} ${criterion.value}`);
                        }
                        else {
                            return instance[k] === criteria[k];
                        }
                    });
                    if (!match) {
                        const error = new Error("No documents matching the provided criteria were found in the collection.");
                        error.name = types_1.ERRORS.NO_MATCH_ERROR;
                        Error.captureStackTrace(error);
                        return Promise.reject(error);
                    }
                    return instance;
                }
            }
            let query = this.generateFilterQuery(this.collection, criteria);
            if (options) {
                query = this.generateOptionsBasedQuery(query, options);
            }
            const documents = yield query.get();
            if (documents.empty) {
                const error = new Error("No documents found.");
                error.name = types_1.ERRORS.NO_DATA_ERROR;
                Error.captureStackTrace(error);
                return Promise.reject(error);
            }
            const [document] = documents.docs.map(d => Object.assign({}, { id: d.id }, d.data()));
            return document;
        });
    }
    add(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const document = yield this.collection.add(Object.assign({}, data));
            return Object.assign({}, data, { id: document.id });
        });
    }
    updateOne(filter, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let _a = filter(), { id } = _a, criteria = __rest(_a, ["id"]);
            if (id) {
                let document = yield this.collection.doc(id).get();
                if (!document.exists) {
                    const error = new Error("No documents found.");
                    error.name = types_1.ERRORS.NO_DATA_ERROR;
                    Error.captureStackTrace(error);
                    return Promise.reject(error);
                }
                let instance = Object.assign({}, { id }, document.data());
                if (criteria) {
                    const match = Object.keys(criteria).every(k => {
                        if (criteria[k] instanceof Filters_1.Comparer) {
                            let criterion = criteria[k];
                            return eval(`${instance[k]} ${criterion.operator} ${criterion.value}`);
                        }
                        else {
                            return instance[k] === criteria[k];
                        }
                    });
                    if (!match) {
                        const error = new Error("No documents matching the provided criteria were found in the collection.");
                        error.name = types_1.ERRORS.NO_MATCH_ERROR;
                        Error.captureStackTrace(error);
                        return Promise.reject(error);
                    }
                }
                document.ref.set(Object.assign({}, data));
                return Object.assign({}, data, { id: document.id });
            }
            let query = this.collection;
            query = this.generateFilterQuery(query, criteria);
            let documents = yield query.get();
            if (!documents.empty) {
                const error = new Error("No documents matching the provided criteria were found in the collection.");
                error.name = types_1.ERRORS.NO_MATCH_ERROR;
                Error.captureStackTrace(error);
                return Promise.reject(error);
            }
            if (documents.size > 1) {
                const error = new Error("More than one documents match the provided criteria. Try again with a more refined criteria.");
                error.name = types_1.ERRORS.MULTIPLE_DOCUMENTS;
                Error.captureStackTrace(error);
                return Promise.reject(error);
            }
            let [docRef] = documents.docs;
            yield docRef.ref.set(Object.assign({}, data));
            return Object.assign({}, data, { id: docRef.id });
        });
    }
    update(filter, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let _a = filter(), { id } = _a, criteria = __rest(_a, ["id"]);
            let query = this.collection;
            query = this.generateFilterQuery(query, criteria);
            let documents = yield query.get();
            if (!documents.empty) {
                const error = new Error("No documents matching the provided criteria were found in the collection.");
                error.name = types_1.ERRORS.NO_MATCH_ERROR;
                Error.captureStackTrace(error);
                return Promise.reject(error);
            }
            const batch = this.collection.firestore.batch();
            documents.docs.map(doc => {
                batch.set(doc.ref, Object.assign({}, data), { merge: true });
            });
            yield batch.commit();
            // await Promise.all(documents.docs.map(doc =>
            //     doc.ref.set(Object.assign({
            //     } as admin.firestore.DocumentData, data))
            // ));
            return documents.docs.map(doc => Object.assign({}, data, { id: doc.id }));
        });
    }
    deleteOne(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            let _a = filter(), { id } = _a, criteria = __rest(_a, ["id"]);
            if (id) {
                let document = yield this.collection.doc(id).get();
                if (!document.exists) {
                    const error = new Error("No documents found.");
                    error.name = types_1.ERRORS.NO_DATA_ERROR;
                    Error.captureStackTrace(error);
                    return Promise.reject(error);
                }
                let instance = Object.assign({}, { id }, document.data());
                if (criteria) {
                    const match = Object.keys(criteria).every(k => {
                        if (criteria[k] instanceof Filters_1.Comparer) {
                            let criterion = criteria[k];
                            return eval(`${instance[k]} ${criterion.operator} ${criterion.value}`);
                        }
                        else {
                            return instance[k] === criteria[k];
                        }
                    });
                    if (!match) {
                        const error = new Error("No documents matching the provided criteria were found in the collection.");
                        error.name = types_1.ERRORS.NO_MATCH_ERROR;
                        Error.captureStackTrace(error);
                        return Promise.reject(error);
                    }
                }
                this.collection.doc(id).delete();
                return Object.assign({}, document.data(), { id: document.id });
            }
            let query = this.collection;
            query = this.generateFilterQuery(query, criteria);
            let documents = yield query.get();
            if (!documents.empty) {
                const error = new Error("No documents matching the provided criteria were found in the collection.");
                error.name = types_1.ERRORS.NO_MATCH_ERROR;
                Error.captureStackTrace(error);
                return Promise.reject(error);
            }
            if (documents.size > 1) {
                const error = new Error("More than one documents match the provided criteria. Try again with a more refined criteria.");
                error.name = types_1.ERRORS.MULTIPLE_DOCUMENTS;
                Error.captureStackTrace(error);
                return Promise.reject(error);
            }
            let [docRef] = documents.docs;
            yield docRef.ref.delete();
            return Object.assign({}, docRef.data, { id: docRef.id });
        });
    }
    delete(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            if (filter) {
                let _a = filter(), { id } = _a, criteria = __rest(_a, ["id"]);
                let query = this.collection;
                query = this.generateFilterQuery(query, criteria);
                const documents = yield query.get();
                if (!documents.empty) {
                    const error = new Error("No documents matching the provided criteria were found in the collection.");
                    error.name = types_1.ERRORS.NO_MATCH_ERROR;
                    Error.captureStackTrace(error);
                    return Promise.reject(error);
                }
                yield Promise.all(documents.docs.map(doc => doc.ref.delete()));
                return documents.docs.map(doc => Object.assign({}, { id: doc.id }));
            }
            const documents = yield this.collection.get();
            const batch = this.collection.firestore.batch();
            documents.docs.map(doc => {
                batch.delete(doc.ref);
            });
            yield batch.commit();
            return documents.docs.map(doc => Object.assign({}, { id: doc.id }));
        });
    }
    init() {
        return Promise.resolve();
    }
}
exports.default = FirebaseStore;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRtaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZnJhbWV3b3JrL2RhdGEvcHJvdmlkZXJzL2ZpcmViYXNlL0FkbWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMERBQTRDO0FBQzVDLDBFQUFpRTtBQUNqRSxxREFBb0U7QUFDcEUsMENBQTBHO0FBUzFHLFNBQWdCLFFBQVEsQ0FBQyxPQUFlLEVBQUUsUUFBMkIsRUFBRSxJQUFvQztJQUN2RyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO1FBQ25CLE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUM3QjtJQUVELElBQUksVUFBbUQsQ0FBQztJQUV4RCxJQUFJLEdBQWtCLENBQUM7SUFFdkIsSUFBSSxJQUFJLEVBQUU7UUFDTixVQUFVLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDNUM7SUFFRCxJQUFJLFFBQVEsRUFBRTtRQUNWLEdBQUcsR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDLGtCQUNuQixRQUFRLENBQ00sRUFBRSxPQUFPLENBQUMsQ0FBQztLQUNuQztTQUFNO1FBQ0gsR0FBRyxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUM7WUFDdEIsVUFBVTtTQUNPLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDbkM7SUFFRCxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUMsUUFBUSxDQUFDO1FBQ3JCLHFCQUFxQixFQUFFLElBQUk7S0FDOUIsQ0FBQyxDQUFDO0lBRUgsT0FBTyxHQUFHLENBQUM7QUFDZixDQUFDO0FBNUJELDRCQTRCQztBQUFBLENBQUM7QUFFRixNQUFNLGFBQTZDLFNBQVEsbUJBQXNCO0lBRTdFOztPQUVHO0lBQ0gsWUFDSSxPQUFlLEVBQ2YsT0FBMEIsRUFDMUIsT0FBaUIsRUFDakIsTUFBeUIs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