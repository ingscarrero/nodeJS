"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("./Utils");
function randomString(length) {
    if (length > Utils_1.MAX_RANDOM_STRING_LENGTH - Utils_1.RANDOM_STRING_OFFSET) {
    }
    return (Date.now().toString(Utils_1.MAX_RANDOM_STRING_LENGTH) +
        Math.random()
            .toString(Utils_1.MAX_RANDOM_STRING_LENGTH)
            .substr(Utils_1.RANDOM_STRING_OFFSET, length)).toUpperCase();
}
exports.randomString = randomString;
//# sourceMappingURL=Functions.js.map