"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const DataStore_1 = require("../common/DataStore");
const application_1 = require("../application");
const types_1 = require("../types");
const __1 = require("..");
class EntityStore {
    /**
     *
     */
    constructor(appName, applicationContext, enableAuditing = false, includeDeleted = false, allowDelete = false) {
        this.isReady = false;
        const entryParser = (entryType, context, description) => {
            return {
                date: new Date(),
                type: entryType,
                details: description,
                comments: "Reported",
                client: { id: context.actor },
                component: { id: context.provider },
                user: { id: context.user }
            };
        };
        const applicationLogger = new application_1.ApplicationLogger(appName, { id: this.getComponentId() });
        const options = {
            storeName: this.getCollectionName(),
            enableAuditing,
            includeDeleted,
            allowDelete
        };
        this.store = new __1.Data.Providers.Firebase.FirebaseStore(appName, options, applicationContext, applicationLogger, entryParser);
        this.store.init().then(() => {
            this.isReady = true;
        });
    }
    read(fields, orderBy, limit, page) {
        return __awaiter(this, void 0, void 0, function* () {
            const storeAction = "READ";
            let validationResult = yield this.validateAction(storeAction);
            if (!validationResult.passed) {
                const error = new Error(`The task context hasn't met the task conditions to read the store [${this.getCollectionName()}]'s contents.`);
                error.name = types_1.ERRORS.VALIDATIONS_NOT_MET;
                Error.captureStackTrace(error);
                throw error;
            }
            const action = {
                storeAction,
                options: {
                    fields,
                    orderBy,
                    limit,
                    page
                }
            };
            const result = yield this.store.executeAction(action);
            return result;
        });
    }
    find(filter, fields, orderBy, limit, page) {
        return __awaiter(this, void 0, void 0, function* () {
            const storeAction = "FIND_ALL";
            let validationResult = yield this.validateAction(storeAction);
            if (!validationResult.passed) {
                const error = new Error(`The task context hasn't met the task conditions to search on the store [${this.getCollectionName()}]'s contents.`);
                error.name = types_1.ERRORS.VALIDATIONS_NOT_MET;
                Error.captureStackTrace(error);
                throw error;
            }
            const action = {
                storeAction,
                options: {
                    fields,
                    orderBy,
                    limit,
                    page
                },
                filter
            };
            const result = yield this.store.executeAction(action);
            return result;
        });
    }
    findOne(filter, fields, orderBy, page) {
        return __awaiter(this, void 0, void 0, function* () {
            const storeAction = "FIND";
            let validationResult = yield this.validateAction(storeAction);
            if (!validationResult.passed) {
                const error = new Error(`The task context hasn't met the task conditions to search on the store [${this.getCollectionName()}]'s contents.`);
                error.name = types_1.ERRORS.VALIDATIONS_NOT_MET;
                Error.captureStackTrace(error);
                throw error;
            }
            const action = {
                storeAction,
                options: {
                    fields,
                    orderBy,
                    page,
                    limit: 1
                },
                filter
            };
            const result = yield this.store.executeAction(action);
            return result;
        });
    }
    updateOne(filter, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const storeAction = "UPDATE";
            let validationResult = yield this.validateAction(storeAction);
            if (!validationResult.passed) {
                const error = new Error(`The task context hasn't met the task conditions to change the store [${this.getCollectionName()}]'s contents.`);
                error.name = types_1.ERRORS.VALIDATIONS_NOT_MET;
                Error.captureStackTrace(error);
                throw error;
            }
            const action = {
                storeAction,
                filter,
                data
            };
            const result = yield this.store.executeAction(action);
            return result;
        });
    }
    update(filter, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const storeAction = "UPDATE_ALL";
            let validationResult = yield this.validateAction(storeAction);
            if (!validationResult.passed) {
                const error = new Error(`The task context hasn't met the task conditions to change the store [${this.getCollectionName()}]'s contents.`);
                error.name = types_1.ERRORS.VALIDATIONS_NOT_MET;
                Error.captureStackTrace(error);
                throw error;
            }
            const action = {
                storeAction,
                filter,
                data
            };
            const result = yield this.store.executeAction(action);
            return result;
        });
    }
    add(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const storeAction = "ADD";
            let validationResult = yield this.validateAction(storeAction);
            if (!validationResult.passed) {
                const error = new Error(`The task context hasn't met the task conditions to add new contents the store [${this.getCollectionName()}]'.`);
                error.name = types_1.ERRORS.VALIDATIONS_NOT_MET;
                Error.captureStackTrace(error);
                throw error;
            }
            const action = {
                storeAction,
                data
            };
            const result = yield this.store.executeAction(action);
            return result;
        });
    }
    remove(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const storeAction = "DELETE";
            let validationResult = yield this.validateAction(storeAction, undefined, filter);
            if (!validationResult.passed) {
                const error = new Error(`The task context hasn't met the task conditions to remove contents the store [${this.getCollectionName()}]'.`);
                error.name = types_1.ERRORS.VALIDATIONS_NOT_MET;
                Error.captureStackTrace(error);
                throw error;
            }
            const action = {
                storeAction,
                filter
            };
            const result = yield this.store.executeAction(action);
            return result;
        });
    }
    removeAll(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const storeAction = "DELETE_ALL";
            const startedAt = new Date();
            let validationResult = yield this.validateAction(storeAction, undefined, filter);
            if (!validationResult.passed) {
                const taskResult = {
                    comments: `The task context hasn't met the task conditions to remove contents the store [${this.getCollectionName()}]'`,
                    startedAt,
                    concludedAt: new Date()
                };
                return taskResult;
            }
            const action = {
                storeAction,
                filter
            };
            const result = yield this.store.executeAction(action);
            return result;
        });
    }
    validateAction(storeAction, input, target) {
        return __awaiter(this, void 0, void 0, function* () {
            let validationResult;
            switch (storeAction) {
                case DataStore_1.STORE_ACTIONS.ADD:
                    validationResult = yield this.validateInsert(input);
                    break;
                case DataStore_1.STORE_ACTIONS.UPDATE:
                    validationResult = yield this.validateUpdate(input, target);
                    break;
                case DataStore_1.STORE_ACTIONS.UPDATE_ALL:
                    validationResult = yield this.validateUpdateAll(input, target);
                    break;
                case DataStore_1.STORE_ACTIONS.DELETE:
                    validationResult = yield this.validateDelete(target);
                    break;
                case DataStore_1.STORE_ACTIONS.DELETE_ALL:
                    validationResult = yield this.validateDeleteAll(target);
                    break;
                default:
                    validationResult = yield this.validateReading(target);
                    break;
            }
            if (!validationResult.passed) {
                const appLogEntry = {
                    type: "Warning",
                    date: new Date(),
                    details: `It wasn't possible to execute action [${storeAction}] on store [${this.getCollectionName()}]. The action's validation [${validationResult.description}] hasn't been satisfied. ${validationResult.resultDetails}`,
                    comments: `Validations for action [${storeAction}] have failed.`,
                    client: { id: this.store.context.actor },
                    component: { id: this.store.context.provider },
                    user: { id: this.store.context.user }
                };
                this.store.logger.reportWarning(appLogEntry);
            }
            return Promise.resolve(validationResult);
        });
    }
    ;
    validateInsert(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const validationResult = {
                description: "Check input content for data insertion",
                passed: true,
                resultDetails: "No issues detected"
            };
            if (!input) {
                validationResult.passed = false;
                validationResult.resultDetails = "Undefined input";
            }
            return Promise.resolve(validationResult);
        });
    }
    validateUpdate(input, target) {
        const validationResult = {
            description: "Check input content and filter for data modification",
            passed: true,
            resultDetails: "No issues detected"
        };
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
    validateUpdateAll(input, target) {
        const validationResult = {
            description: "Check input content and filter for massive data modification",
            passed: true,
            resultDetails: "No issues detected"
        };
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
    validateDelete(target) {
        const validationResult = {
            description: "Check filter for data remotion",
            passed: true,
            resultDetails: "No issues detected"
        };
        if (!target) {
            validationResult.passed = false;
            validationResult.resultDetails = "Undefined filter";
        }
        return Promise.resolve(validationResult);
    }
    validateDeleteAll(target) {
        if (!target) {
            const appLogEntry = {
                type: "Warning",
                date: new Date(),
                details: `Action [${DataStore_1.STORE_ACTIONS.DELETE_ALL}] on store [${this.getCollectionName()}] will be executed without filter`,
                comments: "No filter has been provided",
                client: { id: this.store.context.actor },
                component: { id: this.store.context.provider },
                user: { id: this.store.context.user }
            };
            this.store.logger.reportWarning(appLogEntry);
        }
        const validationResult = {
            description: "Check massive data remotion",
            passed: false,
            resultDetails: "Massive remotion is disable by default."
        };
        return Promise.resolve(validationResult);
    }
    validateReading(target) {
        if (!target) {
            const appLogEntry = {
                type: "Info",
                date: new Date(),
                details: `Search action on store [${this.getCollectionName()}] will be executed without filter`,
                comments: "No filter has been provided",
                client: { id: this.store.context.actor },
                component: { id: this.store.context.provider },
                user: { id: this.store.context.user }
            };
            this.store.logger.reportInfo(appLogEntry);
        }
        const validationResult = {
            description: "Check data retrieval",
            passed: true,
            resultDetails: "No issues detected"
        };
        return Promise.resolve(validationResult);
    }
}
exports.EntityStore = EntityStore;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW50aXR5U3RvcmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZnJhbWV3b3JrL2RhdGEvRW50aXR5U3RvcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLG1EQUErRDtBQUUvRCxnREFBa0Y7QUFDbEYsb0NBQWdHO0FBQ2hHLDBCQUEwQjtBQU8xQixNQUFzQixXQUFXO0lBSTdCOztPQUVHO0lBQ0gsWUFDSSxPQUFlLEVBQ2Ysa0JBQTRCLEVBQzVCLGNBQWMsR0FBRyxLQUFLLEVBQ3RCLGNBQWMsR0FBRyxLQUFLLEVBQ3RCLFdBQVcsR0FBRyxLQUFLO1FBR25CLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLE1BQU0sV0FBVyxHQUlVLENBQ3ZCLFNBQVMsRUFDVCxPQUFPLEVBQ1AsV0FBVyxFQUNiLEVBQUU7WUFDSSxPQUFPO2dCQUNILElBQUksRUFBRSxJQUFJLElBQUksRUFBRTtnQkFDaEIsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsT0FBTyxFQUFFLFdBQVc7Z0JBQ3BCLFFBQVEsRUFBRSxVQUFVO2dCQUNwQixNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRTtnQkFDN0IsU0FBUyxFQUFFLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQUU7Z0JBQ25DLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFO2FBQ04sQ0FBQztRQUM3QixDQUFDLENBQUM7UUFFTixNQUFNLGlCQUFpQixHQUFHLElBQUksK0JBQWlCLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFeEYsTUFBTSxPQUFPLEdBQUc7WUFDWixTQUFTLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFO1lBQ25DLGNBQWM7WUFDZCxjQUFjO1lBQ2QsV0FBVztTQUNPLENBQUM7UUFF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