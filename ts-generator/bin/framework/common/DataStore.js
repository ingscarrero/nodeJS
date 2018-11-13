"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TaskContext_1 = __importDefault(require("./TaskContext"));
exports.STORE_ACTIONS = {
    READ: "READ",
    FIND: "FIND",
    FIND_ALL: "FIND_ALL",
    ADD: "ADD",
    UPDATE: "UPDATE",
    UPDATE_ALL: "UPDATE_ALL",
    DELETE: "DELETE",
    DELETE_ALL: "DELETE_ALL"
};
class DataStore extends TaskContext_1.default {
    /**
     *
     */
    constructor(options, context, logger, entryParser) {
        super(context, logger, entryParser);
        this.options = options;
    }
    executeAction(action) {
        switch (action.storeAction) {
            case exports.STORE_ACTIONS.ADD:
                return this.runAddAction(action);
            case exports.STORE_ACTIONS.UPDATE:
                return this.runUpdateAction(action);
            case exports.STORE_ACTIONS.UPDATE_ALL:
                return this.runUpdateAllAction(action);
            case exports.STORE_ACTIONS.DELETE:
                return this.runDeleteAction(action);
            case exports.STORE_ACTIONS.DELETE_ALL:
                return this.runDeleteAllAction(action);
            case exports.STORE_ACTIONS.READ:
                return this.runReadAction(action);
            case exports.STORE_ACTIONS.FIND:
                return this.runFindAction(action);
            default:
                return this.runFindAllAction(action);
        }
    }
    runDeleteAction(action) {
        const deleteAction = action;
        if (!this.options.allowDelete) {
            return this.executeAction({
                filter: deleteAction.filter,
                data: { status: "DELETED" },
                storeAction: exports.STORE_ACTIONS.UPDATE
            });
        }
        return this.execute(() => this.deleteOne(deleteAction.filter), `Remove the document in the store [${this.options.storeName}] with the id [${deleteAction.filter().id}].\n`);
    }
    runDeleteAllAction(action) {
        const deleteAllAction = action;
        if (!this.options.allowDelete) {
            return this.executeAction({
                filter: deleteAllAction.filter,
                data: {},
                storeAction: "UPDATE"
            });
        }
        return this.execute(() => this.delete(deleteAllAction.filter), `Remove the documents in the store [${this.options.storeName}] matching the following criteria:\n${JSON.stringify(deleteAllAction.filter(), undefined, "\t")}\n`);
    }
    runReadAction(action) {
        const readAction = action;
        return this.execute(() => this.read(readAction.filter, readAction.options), `Read the documents in the store [${this.options.storeName}]${readAction.filter ? ` matching the following criteria:\n${JSON.stringify(readAction.filter(), undefined, "\t")}.\n` :
            ".\n"}`);
    }
    runFindAction(action) {
        const findAction = action;
        return this.execute(() => this.findOne(findAction.filter, findAction.options), `Find the document in the store [${this.options.storeName}] with the id [${findAction.filter().id}].\n`);
    }
    runFindAllAction(action) {
        const readAllAction = action;
        return this.execute(() => this.find(readAllAction.filter, readAllAction.options), `Find the documents in the store [${this.options.storeName}] matching the following criteria:\n${JSON.stringify(readAllAction.filter(), undefined, "\t")}\n`);
    }
    runUpdateAction(action) {
        const updateAction = action;
        return this.execute(() => this.updateOne(updateAction.filter, updateAction.data), `Update the document in the store [${this.options.storeName}] with the id [${updateAction.filter().id}].\n`);
    }
    runUpdateAllAction(action) {
        const updateAllAction = action;
        return this.execute(() => this.update(updateAllAction.filter, updateAllAction.data), `Update the documents in the store [${this.options.storeName}] matching the following criteria:\n${JSON.stringify(updateAllAction.filter(), undefined, "\t")}\n`);
    }
    runAddAction(action) {
        const addAction = action;
        return this.execute(() => this.add(addAction.data), `Add a new document to the store [${this.options.storeName}].\n`);
    }
}
exports.default = DataStore;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0YVN0b3JlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2ZyYW1ld29yay9jb21tb24vRGF0YVN0b3JlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQ0EsZ0VBQXdDO0FBWTNCLFFBQUEsYUFBYSxHQUEwQztJQUNoRSxJQUFJLEVBQUUsTUFBTTtJQUNaLElBQUksRUFBRSxNQUFNO0lBQ1osUUFBUSxFQUFFLFVBQVU7SUFDcEIsR0FBRyxFQUFFLEtBQUs7SUFDVixNQUFNLEVBQUUsUUFBUTtJQUNoQixVQUFVLEVBQUUsWUFBWTtJQUN4QixNQUFNLEVBQUUsUUFBUTtJQUNoQixVQUFVLEVBQUUsWUFBWTtDQUMzQixDQUFBO0FBRUQsTUFBZSxTQUF5QyxTQUFRLHFCQUFxQjtJQUlqRjs7T0FFRztJQUNILFlBQ0ksT0FBMEIsRUFDMUIsT0FBaUIsRUFDakIsTUFBeUIsRUFDekIsV0FBb0Y7UUFFcEYsS0FBSyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUE7UUFDbkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDM0IsQ0FBQztJQVlNLGFBQWEsQ0FBQyxNQUFpQjtRQUNsQyxRQUFRLE1BQU0sQ0FBQyxXQUFXLEVBQUU7WUFDeEIsS0FBSyxxQkFBYSxDQUFDLEdBQUc7Z0JBQ2xCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNyQyxLQUFLLHFCQUFhLENBQUMsTUFBTTtnQkFDckIsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3hDLEtBQUsscUJBQWEsQ0FBQyxVQUFVO2dCQUN6QixPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMzQyxLQUFLLHFCQUFhLENBQUMsTUFBTTtnQkFDckIsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3hDLEtBQUsscUJB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