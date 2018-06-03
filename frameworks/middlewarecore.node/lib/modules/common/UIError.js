"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const VibezError_1 = require("./VibezError");
class UIError extends VibezError_1.VibezError {
    constructor(name, shortDescription, module, message, stack, priority, description, infoUrl) {
        super(module, message, stack, priority);
        this.shortDescription = shortDescription;
        this.description = description;
        this.infoUrl = infoUrl;
    }
}
exports.UIError = UIError;
//# sourceMappingURL=UIError.js.map