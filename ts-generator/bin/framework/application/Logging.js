"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
const Admin_1 = __importDefault(require("../data/providers/firebase/Admin"));
class ConsoleLogger {
    reportInfo(entry) {
        console.log(JSON.stringify(entry, undefined, "\t"));
        return Promise.resolve();
    }
    reportError(entry) {
        console.error(JSON.stringify(entry, undefined, "\t"));
        return Promise.resolve();
    }
    reportWarning(entry) {
        console.warn(JSON.stringify(entry, undefined, "\t"));
        return Promise.resolve();
    }
    read(_) {
        const error = new Error("This operation is not supported.");
        error.name = types_1.ERRORS.NOT_SUPPORTED;
        Error.captureStackTrace(error);
        return Promise.reject(error);
    }
    findByKey(_) {
        const error = new Error("This operation is not supported.");
        error.name = types_1.ERRORS.NOT_SUPPORTED;
        Error.captureStackTrace(error);
        return Promise.reject(error);
    }
}
exports.ConsoleLogger = ConsoleLogger;
const entryParser = (entryType, context, description) => {
    return {
        date: new Date(),
        type: entryType,
        comments: description,
        details: `Processing "${context.description}" for "${context.actor}" at "${context.provider}".`
    };
};
class ApplicationLogger {
    /**
     *
     */
    constructor(appName, actor) {
        const context = {
            actor: actor.id,
            description: "Application events registration",
            provider: "Application Logger",
            user: "system"
        };
        this.store = new Admin_1.default(appName, { storeName: "app-log" }, context, new ConsoleLogger(), entryParser);
    }
    reportInfo(entry) {
        const action = { storeAction: "ADD", data: entry };
        this.store.executeAction(action);
        return Promise.resolve();
    }
    reportError(entry) {
        const action = { storeAction: "ADD", data: entry };
        this.store.executeAction(action);
        return Promise.resolve();
    }
    reportWarning(entry) {
        const action = { storeAction: "ADD", data: entry };
        this.store.executeAction(action);
        return Promise.resolve();
    }
    read(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const action = {
                storeAction: "READ"
            };
            if (filter) {
                action.filter = filter;
            }
            const taskResult = yield this.store.executeAction(action);
            if (taskResult.result instanceof Error) {
                const error = taskResult.result;
                error.name = types_1.ERRORS.NOT_SUPPORTED;
                Error.captureStackTrace(error);
                Promise.reject(error);
            }
            return Promise.resolve(taskResult.result);
        });
    }
    findByKey(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const action = {
                storeAction: "FIND",
                filter: () => ({ id: key() })
            };
            const taskResult = yield this.store.executeAction(action);
            if (taskResult.result instanceof Error) {
                const error = taskResult.result;
                error.name = types_1.ERRORS.NOT_SUPPORTED;
                Error.captureStackTrace(error);
                Promise.reject(error);
            }
            return Promise.resolve(taskResult.result);
        });
    }
}
exports.ApplicationLogger = ApplicationLogger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9nZ2luZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mcmFtZXdvcmsvYXBwbGljYXRpb24vTG9nZ2luZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUEsb0NBQXdFO0FBQ3hFLDZFQUE2RDtBQWdCN0QsTUFBYSxhQUFhO0lBQ3RCLFVBQVUsQ0FBQyxLQUFlO1FBQ3RCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDcEQsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVELFdBQVcsQ0FBQyxLQUFlO1FBQ3ZCLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDdEQsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUNELGFBQWEsQ0FBQyxLQUFlO1FBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDckQsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUNELElBQUksQ0FBQyxDQUFXO1FBQ1osTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsa0NBQWtDLENBQUMsQ0FBQztRQUM1RCxLQUFLLENBQUMsSUFBSSxHQUFHLGNBQU0sQ0FBQyxhQUFhLENBQUM7UUFDbEMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQy9CLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBQ0QsU0FBUyxDQUFDLENBQWU7UUFDckIsTUFBTSxLQUFL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