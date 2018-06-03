"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../common");
class ApplicationLogger extends common_1.Logger {
    constructor(store) {
        super(store);
    }
    map(event) {
        let record = Object.assign({}, event);
        return record;
    }
}
exports.ApplicationLogger = ApplicationLogger;
//# sourceMappingURL=ApplicationLogger.js.map