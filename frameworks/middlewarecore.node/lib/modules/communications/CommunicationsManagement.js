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
const common_1 = require("../common");
const nodemailer = require("nodemailer");
const NMSPTransport = require("nodemailer-sparkpost-transport");
const { MAIL } = process.env;
class CommunicationsManager {
    constructor(context) {
        this.context = context;
    }
    sendMailByNodeMailer(context, mail) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { secret, from } = JSON.parse(MAIL);
                if (!secret) {
                    return Promise.reject(new common_1.PlatformError("MAIL_DELIVERY_ERROR", "Error when sending e-mail", CommunicationsManager.COMPONENT, "Invalid configuration", undefined, "MEDIUM", `Error when sending email. No secret assigned to this platform's instance`));
                }
                if (!from) {
                    return Promise.reject(new common_1.PlatformError("MAIL_DELIVERY_ERROR", "Error when sending e-mail", CommunicationsManager.COMPONENT, "Invalid configuration", undefined, "MEDIUM", `Error when sending email. No sender mail assigned to this platform's instance`));
                }
                // let transportSettings: MailTransportConfiguration = {
                //   secret
                // };
                let transportConfiguration = NMSPTransport({ sparkPostApiKey: secret });
                let transport = nodemailer.createTransport(transportConfiguration);
                let result = yield new Promise((resolve, reject) => {
                    transport.sendMail({ from, to: mail.to, html: mail.body }, (err, info) => {
                        if (err) {
                            return reject(new common_1.PlatformError("MAIL_DELIVERY_ERROR", "Error when sending e-mail", CommunicationsManager.COMPONENT, err.message, err.stack, "MEDIUM", `Error when sending email by the configured email provider. The Email provider couldn't process the mail sending request`));
                        }
                        else {
                            return resolve(true);
                        }
                    });
                });
                return result;
            }
            catch (error) {
                return Promise.reject(new common_1.PlatformError("MAIL_DELIVERY_ERROR", "Error when sending e-mail", CommunicationsManager.COMPONENT, error.message, error.stack, "MEDIUM", `Error when sending email by the configured email provider. The Email provider couldn't process the mail sending request`));
            }
        });
    }
    sendMail(mail) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this.context.performTask("Write", CommunicationsManager.COMPONENT, (context) => __awaiter(this, void 0, void 0, function* () {
                let result = yield this.sendMailByNodeMailer(context, mail);
                let event;
                if (result) {
                    event = {
                        actor: context.getActorInformation(),
                        component: CommunicationsManager.COMPONENT,
                        date: new Date(Date.now()),
                        description: `Email sent to [${mail.to}]`,
                        kind: "Info"
                    };
                }
                else {
                    event = {
                        actor: context.getActorInformation(),
                        component: CommunicationsManager.COMPONENT,
                        date: new Date(Date.now()),
                        description: `Email couldn't be sent to [${mail.to}]`,
                        kind: "Warning"
                    };
                }
                context.logger.log(event);
                return result;
            }));
            return result;
        });
    }
}
CommunicationsManager.COMPONENT = "COMMUNICATIONS_MANAGER";
exports.CommunicationsManager = CommunicationsManager;
//# sourceMappingURL=CommunicationsManagement.js.map