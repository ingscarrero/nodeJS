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
const ApplicationLogger_1 = require("./ApplicationLogger");
const Security_1 = require("./Security");
const common_1 = require("../common");
const NMSPTransport = require("nodemailer-sparkpost-transport");
const { MAIL } = process.env;
class ApplicationContext extends common_1.ValidableContext {
    constructor(appID, appKey, appAddress, appVersion, store) {
        let logger = new ApplicationLogger_1.ApplicationLogger(store);
        super(logger);
        let appVersionMatches = appVersion.match(Security_1.VERSION_FORMAT);
        if (!appVersionMatches) {
            let entry = {
                actor: this.getActorInformation(),
                component: appID,
                date: new Date(Date.now()),
                description: "Failed Application Context Initialization because of invalid component version",
                kind: "Error"
            };
            this.logger.log(entry);
            throw new Error("Invalid app version");
        }
        let [major, minor, patch] = [
            ...appVersionMatches.slice(1).map(item => parseInt(item))
        ];
        this.appVersion = { major, minor, patch };
        this.appID = appID;
        this.appAddress = appAddress;
        this.appKey = appKey;
    }
    validateContext() {
        return __awaiter(this, void 0, void 0, function* () {
            let result = {
                passed: true,
                details: new Array()
            };
            if (!this.appID) {
                result.passed = false;
                result.details.push("We were unable to determine the app ID that is assigned to this context");
                return result;
            }
            if (!this.appKey) {
                result.passed = false;
                result.details.push("We were unable to determine the app key that is assigned to this context");
                return result;
            }
            if (!this.appAddress) {
                result.passed = false;
                result.details.push("We were unable to determine the app origin that is assigned to this context");
                return result;
            }
            if (!this.appVersion) {
                result.passed = false;
                result.details.push("We were unable to determine the app version that is assigned to this context");
                return result;
            }
            let appUser = yield ApplicationManager_1.ApplicationManager.authenticateApp(this.appID, this.appKey, this.appVersion);
            if (!appUser) {
                result.passed = false;
                result.details.push("App's account that is assigned to this context hasn't been properly initialized");
                return result;
            }
            if (!appUser.validatedOn) {
                result.passed = false;
                result.details.push("App's account that is assigned to this context hasn't yet been validated. Please check your account's email to a message with corresponding directions to fullfil the account's validation process");
                return result;
            }
            return result;
        });
    }
    validateTask(action, componentName) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = {
                passed: true,
                details: new Array()
            };
            let appUser = yield ApplicationManager_1.ApplicationManager.authenticateApp(this.appID, this.appKey, this.appVersion);
            if (!appUser) {
                result.passed = false;
                result.details.push("App's account that is assigned to this context hasn't been properly initialized");
                return result;
            }
            if (!appUser.role) {
                result.passed = false;
                result.details.push("App's account that is assigned to this context has no role associated");
                return result;
            }
            let profile = yield ApplicationManager_1.ApplicationManager.getRoleProfile(appUser.role);
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
                result.details.push("App's account that is assigned to this context has no authorization over this component");
                return result;
            }
            switch (action) {
                case "Read":
                    if (!permit.authorization.canRead) {
                        result.passed = false;
                        result.details.push("App's account that is assigned to this context has no reading authorization over this component");
                        return result;
                    }
                    break;
                case "Write":
                    if (!permit.authorization.canWrite) {
                        result.passed = false;
                        result.details.push("App's account that is assigned to this context has no writing authorization over this component");
                        return result;
                    }
                    break;
                case "Delete":
                    if (!permit.authorization.canWrite) {
                        result.passed = false;
                        result.details.push("App's account that is assigned to this context has no writing authorization over this component");
                        return result;
                    }
                    break;
                default:
                    break;
            }
            return result;
        });
    }
    getActorInformation() {
        return `App: [${this.appID}] with Version: [${this.appVersion.major}, ${this.appVersion.minor}, ${this.appVersion.patch}]from IP:[${this.appAddress}]`;
    }
}
exports.ApplicationContext = ApplicationContext;
//# sourceMappingURL=ApplicationContext.js.map