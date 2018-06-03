"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DEFAULT_REASON = 'Ups! Something went wrong and, by now, we couldn\'t establish the reason. Please try again! If the problem persists contact the [SUPPORT_MAIL] by making reference to the following error ID:[ERROR_ID].';
const SUCCESS_CODE = 0;
function success(message) {
    return { code: SUCCESS_CODE, error: undefined, message };
}
exports.success = success;
function error(code, error, message, reason = DEFAULT_REASON) {
    console.error(error);
    return { code, error, message, reason };
}
exports.error = error;
//# sourceMappingURL=util.js.map