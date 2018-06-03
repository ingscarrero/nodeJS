"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class VibezError extends Error {
    constructor(module, message, stack, priority = "LOW") {
        super(message);
        this.stack = stack;
        this.module = module;
        this.priority = priority;
        this.id = new Date(Date.now()).getTime().toString();
    }
}
exports.VibezError = VibezError;
//# sourceMappingURL=VibezError.js.map