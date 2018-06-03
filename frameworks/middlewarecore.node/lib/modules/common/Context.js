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
const DomainError_1 = require("./DomainError");
const PlatformError_1 = require("./PlatformError");
class Logger {
    constructor(store) {
        this.logStore = store;
    }
    log(entry) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this.logStore.write(entry);
        });
    }
    read(from, to, kind, actor, component) {
        return __awaiter(this, void 0, void 0, function* () {
            let longEntries = yield this.logStore.read({
                from,
                to,
                actor,
                component
            });
            return longEntries.map(e => this.map(e));
        });
    }
}
exports.Logger = Logger;
class Context {
    constructor(logger) {
        this.logger = logger;
    }
}
exports.Context = Context;
class DataProvider {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
}
exports.DataProvider = DataProvider;
class ValidableContext extends Context {
    constructor(logger) {
        super(logger);
    }
    performTask(action, module, task) {
        return __awaiter(this, void 0, void 0, function* () {
            let contextValidation = yield this.validateContext();
            let taskValidation = yield this.validateTask(action, module);
            if (contextValidation.passed && taskValidation.passed) {
                try {
                    let context = Object.assign({}, this);
                    let result = yield task(context);
                    this.logger.log({
                        description: `[${action}] operation performed successfully.`,
                        actor: this.getActorInformation(),
                        date: new Date(Date.now()),
                        component: module,
                        kind: "Info"
                    });
                    return result;
                }
                catch (error) {
                    this.logger.log({
                        description: error.message,
                        actor: this.getActorInformation(),
                        date: new Date(Date.now()),
                        component: module,
                        kind: "Error"
                    });
                    return Promise.reject(new PlatformError_1.PlatformError("TASK_EXECUTION_ERROR", `Error while performing [${action}] operation`, module, "Please validate the context's information", error.stack, "MEDIUM", error.message));
                }
            }
            else if (!contextValidation.passed) {
                this.logger.log({
                    description: `Context Validation not passed for [${action}] operation`,
                    actor: this.getActorInformation(),
                    date: new Date(Date.now()),
                    component: module,
                    kind: "Warning"
                });
                return Promise.reject(new DomainError_1.DomainError("INVALID_CONTEXT", `Context Validation not passed for [${action}] operation`, module, "Please validate the context's information", undefined, "LOW", contextValidation.details.join("\n")));
            }
            else {
                this.logger.log({
                    description: `Task Validation not passed for [${action}] operation`,
                    actor: this.getActorInformation(),
                    date: new Date(Date.now()),
                    component: module,
                    kind: "Warning"
                });
                return Promise.reject(new DomainError_1.DomainError("INVALID_TASK", `Context Validation not passed for [${action}] operation`, module, "Please validate the context's information", undefined, "LOW", taskValidation.details.join("\n")));
            }
        });
    }
}
exports.ValidableContext = ValidableContext;
//# sourceMappingURL=Context.js.map