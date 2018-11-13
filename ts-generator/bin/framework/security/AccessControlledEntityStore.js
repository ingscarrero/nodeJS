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
const data_1 = require("../data");
const DataStore_1 = require("../common/DataStore");
class AccessCotrolledEntityStore extends data_1.EntityStore {
    /**
     *
     */
    constructor(appName, context, storeActionsForContext, contextUserRole, enableAuditing = false, includeDeleted = false, allowDelete = false) {
        super(appName, context, enableAuditing, includeDeleted, allowDelete);
        this.storeActionsForContext = storeActionsForContext;
        this.contextUserRole = contextUserRole;
    }
    validateActionInContext(previousValidationResult, validatingAction) {
        if (!previousValidationResult.passed) {
            return previousValidationResult;
        }
        previousValidationResult.passed = this.storeActionsForContext.
            some(sa => sa.role.id === this.contextUserRole.id &&
            sa.storeActions.some(a => a === validatingAction));
        if (!previousValidationResult.passed) {
            previousValidationResult.resultDetails = `The user's role for this context cannot execute action [${validatingAction}] on the store [${this.getCollectionName()}].`;
        }
        return previousValidationResult;
    }
    validateUpdateAll(input, target) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            let validationResult = yield _super("validateUpdateAll").call(this, input, target);
            const validatingAction = DataStore_1.STORE_ACTIONS.UPDATE_ALL;
            return this.validateActionInContext(validationResult, validatingAction);
        });
    }
    validateUpdate(input, target) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            let validationResult = yield _super("validateUpdate").call(this, input, target);
            const validatingAction = DataStore_1.STORE_ACTIONS.UPDATE;
            return Promise.resolve(this.validateActionInContext(validationResult, validatingAction));
        });
    }
    validateInsert(input) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            let validationResult = yield _super("validateInsert").call(this, input);
            const validatingAction = DataStore_1.STORE_ACTIONS.ADD;
            return Promise.resolve(this.validateActionInContext(validationResult, validatingAction));
        });
    }
    validateDelete(target) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            let validationResult = yield _super("validateDelete").call(this, target);
            const validatingAction = DataStore_1.STORE_ACTIONS.DELETE;
            return Promise.resolve(this.validateActionInContext(validationResult, validatingAction));
        });
    }
    validateDeleteAll(target) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            let validationResult = yield _super("validateDeleteAll").call(this, target);
            const validatingAction = DataStore_1.STORE_ACTIONS.DELETE_ALL;
            return Promise.resolve(this.validateActionInContext(validationResult, validatingAction));
        });
    }
    validateReading(target) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            let validationResult = yield _super("validateReading").call(this, target);
            const validatingAction = DataStore_1.STORE_ACTIONS.READ;
            return Promise.resolve(this.validateActionInContext(validationResult, validatingAction));
        });
    }
}
exports.AccessCotrolledEntityStore = AccessCotrolledEntityStore;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNjZXNzQ29udHJvbGxlZEVudGl0eVN0b3JlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2ZyYW1ld29yay9zZWN1cml0eS9BY2Nlc3NDb250cm9sbGVkRW50aXR5U3RvcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLGtDQUF5RDtBQUN6RCxtREFBNEU7QUFPNUUsTUFBc0IsMEJBQWdELFNBQVEsa0JBQWM7SUFLeEY7O09BRUc7SUFDSCxZQUNJLE9BQWUsRUFDZixPQUFpQixFQUNqQixzQkFBNEMsRUFDNUMsZUFBMEIsRUFDMUIsY0FBYyxHQUFHLEtBQUssRUFDdEIsY0FBYyxHQUFHLEtBQUssRUFDdEIsV0FBVyxHQUFHLEtBQUs7UUFFbkIsS0FBSyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNyRSxJQUFJLENBQUMsc0JBQXNCLEdBQUcsc0JBQXNCLENBQUM7UUFDckQsSUFBSSxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUM7SUFDM0MsQ0FBQztJQUVPLHVCQUF1QixDQUMzQix3QkFBMkMsRUFDM0MsZ0JBQTZCO1FBRTdCLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLEVBQUU7WUFDbEMsT0FBTyx3QkFBd0IsQ0FBQztTQUNuQztRQUNELHdCQUF3QixDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsc0JBQXNCO1lBQ3pELElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRTtZQUM3QyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7UUFFM0QsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE1BQU0sRUFBRTtZQUNsQyx3QkFBd0IsQ0FBQyxhQUFhLEdBQUcsMkRBQTJELGdCQUFnQixtQkFBbUIsSUFBSSxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQTtTQUN0SztRQUVELE9BQU8sd0JBQXdCLENBQUM7SUFDcEMsQ0FBQztJQUdlLGlCQUFpQixDQUFDLEtBQWlCLEVBQUUsTUFBd0I7OztZQUV6RSxJQUFJLGdCQUFnQixHQUFHLE1BQU0sMkJBQXVCLFlBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3BFLE1BQU0sZ0JBQWdCLEdBQUcseUJBQWEsQ0FBQyxVQUFVLENBQUM7WUFDbEQsT0FBTyxJQUFJLENBQUMsdUJBQXVCLENBQUMsZ0JBQWdCLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUM1RSxDQUFDO0tBQUE7SUFFZSxjQUFjLENBQUMsS0FBaUIsRUFBRSxNQUF3Qjs7O1lBQ3RFLElBQUksZ0JBQWdCLEdBQUcsTUFBTSx3QkFBb0IsWUFBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDakUsTUFBTSxnQkFBZ0IsR0FBRyx5QkFBYSxDQUFDLE1BQU0sQ0FBQztZQUM5QyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLGdCQUFnQixFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQztRQUM3RixDQUFDO0tBQUE7SUFFZSxjQUFjLENBQUMsS0FBaUI7OztZQUM1QyxJQUFJLGdCQUFnQixHQUFHLE1BQU0sd0JBQW9CLFlBQUMsS0FBSyxDQUFDLENBQUM7WUFDekQsTUFBTSxnQkFBZ0IsR0FBRyx5QkFBYSxDQUFDLEdBQUcsQ0FBQztZQUMzQyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLGdCQUFnQixFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQztRQUM3RixDQUFDO0tBQUE7SUFFZSxjQUFjLENBQUMsTUFBd0I7OztZQUNuRCxJQUFJLGdCQUFnQixHQUFHLE1BQU0sd0JBQW9CLFlBQUMsTUFBTSxDQUFDLENBQUM7WUFDMUQsTUFBTSxnQkFBZ0IsR0FBRyx5QkFBYSxDQUFDLE1BQU0sQ0FBQztZQUM5QyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLGdCQUFnQixFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQztRQUM3RixDQUFDO0tBQUE7SUFFZSxpQkFBaUIsQ0FBQyxNQUF5Qjs7O1lBQ3ZELElBQUksZ0JBQWdCLEdBQUcsTUFBTSwyQkFBdUIsWUFBQyxNQUFNLENBQUMsQ0FBQztZQUM3RCxNQUFNLGdCQUFnQixHQUFHLHlCQUFhLENBQUMsVUFBVSxDQUFDO1lBQ2xELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsZ0JBQWdCLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1FBQzdGLENBQUM7S0FBQTtJQUVlLGVBQWUsQ0FBQyxNQUF5Qjs7O1lBQ3JELElBQUksZ0JBQWdCLEdBQUcsTUFBTSx5QkFBcUIsWUFBQyxNQUFNLENBQUMsQ0FBQztZQUMzRCxNQUFNLGdCQUFnQixHQUFHLHlCQUFhLENBQUMsSUFBSSxDQUFDO1lBQzVDLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsZ0JBQWdCLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1FBQzdGLENBQUM7S0FBQTtDQUdKO0FBL0VELGdFQStFQyJ9