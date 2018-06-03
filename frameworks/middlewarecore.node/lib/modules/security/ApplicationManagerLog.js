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
class ApplicationManagerLog extends common_1.DataProvider {
    constructor(dataSource) {
        super(dataSource);
    }
    write(entry) {
        return __awaiter(this, void 0, void 0, function* () {
            let logDocument = yield this.dataSource.collection("Logs").add(entry);
            return { date: new Date(Date.now()) };
        });
    }
    read(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!filter) {
                return Promise.reject(new common_1.DomainError("INVALID_FILTER", "The query needs additional information", "Application Manager Log", "Please validate the submitted criteria", undefined, "LOW", "When reading the application management log, the submitted criteria hadn't the required information"));
            }
            let { from, to } = filter;
            if (!from) {
                return Promise.reject(new common_1.DomainError("INVALID_FILTER", "The query needs additional information", "Application Manager Log", "Please validate the submitted criteria", undefined, "LOW", "When reading the application management log, the submitted criteria hadn't the required information"));
            }
            let logCollection = yield this.dataSource.collection("Logs");
            let logQuery = logCollection.where("date", ">", from);
            if (to) {
                logQuery = logQuery.where("date", "<", to);
            }
            Object.keys(filter).forEach(k => {
                if (k != "from" && k != "to") {
                    logQuery = logQuery.where(k, "==", filter[k]);
                }
            });
            let { empty, docs } = yield logQuery.get();
            if (empty) {
                return Promise.reject(new common_1.DomainError("NOT_FOUND", "There were no matches for the submitted criteria", "Application Manager Log", "Please validate the submitted information", undefined, "LOW", "When fetching the log entries, there were no matches for the submitted criteria"));
            }
            let entries = docs.map((d) => Object.assign({}, d.data()));
            return entries;
        });
    }
}
exports.ApplicationManagerLog = ApplicationManagerLog;
//# sourceMappingURL=ApplicationManagerLog.js.map