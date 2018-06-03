"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const VibezError_1 = require("./VibezError");
class PlatformError extends VibezError_1.VibezError {
    constructor(name, shortDescription, module, message, stack, priority, description) {
        super(module, message, stack, priority);
        this.name = name;
        this.shortDescription = shortDescription;
        this.description = description;
    }
}
exports.PlatformError = PlatformError;
//# sourceMappingURL=PlatformError.js.map