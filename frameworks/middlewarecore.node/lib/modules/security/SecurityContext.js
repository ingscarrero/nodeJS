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
const ApplicationManager_1 = require("./ApplicationManager");
const common_1 = require("../common");
const NMSPTransport = require("nodemailer-sparkpost-transport");
const { MAIL } = process.env;
class SecurityContext extends common_1.ValidableContext {
    // INITIALIZERS
    constructor(actor, clientAddress, applicationContext) {
        super(applicationContext.logger);
        this.actor = actor;
        this.clientAddress = clientAddress;
        this.applicationContext = applicationContext;
        this.credential = actor.credentials[0];
    }
    performTask(action, module, task) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this.applicationContext.performTask(action, module, (appContext) => __awaiter(this, void 0, void 0, function* () {
                let result = yield _super("performTask").call(this, action, module, task);
                return result;
            }));
            return result;
        });
    }
    // METHODS
    validateTask(action, componentName) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = {
                passed: true,
                details: new Array()
            };
            if (!this.actor) {
                result.passed = false;
                result.details.push("Identity's account that is assigned to this context hasn't been properly initialized");
                return result;
            }
            if (!this.actor.role) {
                result.passed = false;
                result.details.push("Identity's account that is assigned to this context has no role associated");
                return result;
            }
            let profile = yield ApplicationManager_1.ApplicationManager.getRoleProfile(this.actor.role);
            let component = yield ApplicationManager_1.ApplicationManager.getComponentIndexByName(componentName);
            if (!component) {
                result.passed = false;
                result.details.push("Task's component is not a valid one");
                return result;
            }
            let now = new Date(Date.now());
            let permit = profile.permits.find((p) => p.component.id == component.id &&
                p.issuedOn < now &&
                new Date(p.issuedOn.getFullYear(), p.issuedOn.getMonth(), p.issuedOn.getDate() + p.validity) > now);
            if (!permit) {
                result.passed = false;
                result.details.push("Identity's account that is assigned to this context has no authorization over this component");
                return result;
            }
            switch (action) {
                case "Read":
                    if (!permit.authorization.canRead) {
                        result.passed = false;
                        result.details.push("Identity's account that is assigned to this context has no reading authorization over this component");
                        return result;
                    }
                    break;
                case "Write":
                    if (!permit.authorization.canWrite) {
                        result.passed = false;
                        result.details.push("Identity's account that is assigned to this context has no writing authorization over this component");
                        return result;
                    }
                    break;
                case "Delete":
                    if (!permit.authorization.canWrite) {
                        result.passed = false;
                        result.details.push("Identity's account that is assigned to this context has no writing authorization over this component");
                        return result;
                    }
                    break;
                default:
                    break;
            }
            return result;
        });
    }
    validateContext() {
        return __awaiter(this, void 0, void 0, function* () {
            let result = {
                passed: true,
                details: new Array()
            };
            if (!this.credential) {
                result.passed = false;
                result.details.push("We were unable to determine the credentials validated for this context");
                return result;
            }
            if (!this.clientAddress) {
                result.passed = false;
                result.details.push("We were unable to determine the client IP that is assigned to this context");
                return result;
            }
            if (!this.actor) {
                result.passed = false;
                result.details.push("Identity's account that is assigned to this context hasn't been properly initialized");
                return result;
            }
            if (!this.actor.validatedOn) {
                result.passed = false;
                result.details.push("Identity's account that is assigned to this context hasn't yet been validated. Please check your account's email to a message with corresponding directions to fullfil the account's validation process");
                return result;
            }
            if (!this.actor.role) {
                result.passed = false;
                result.details.push("Identity's account that is assigned to this context has no role associated");
                return result;
            }
            if (!this.applicationContext) {
                result.passed = false;
                result.details.push("We were unable to determine the application context through which this context was initialized");
            }
            let profile = yield ApplicationManager_1.ApplicationManager.getRoleProfile(this.actor.role);
            let now = new Date(Date.now());
            let permit = profile.permits.find((p) => p.component.id == this.applicationContext.appID &&
                p.issuedOn < now &&
                new Date(p.issuedOn.getFullYear(), p.issuedOn.getMonth(), p.issuedOn.getDate() + p.validity) > now);
            if (!permit) {
                result.passed = false;
                result.details.push("Identity's account that is assigned to this context has no authorization over this channel");
                return result;
            }
            if (!permit.authorization.canRead) {
                result.passed = false;
                result.details.push("Identity's account that is assigned to this context has no authorization over this channel");
                return result;
            }
            return result;
        });
    }
    getActorInformation() {
        return `Identity: [${this.actor.identity.id}] from IP:[${this.clientAddress}] through Application:[${this.applicationContext.appID}]/${this.applicationContext.appVersion}`;
    }
}
exports.SecurityContext = SecurityContext;
//# sourceMappingURL=SecurityContext.js.map