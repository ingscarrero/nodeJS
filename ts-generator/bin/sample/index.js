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
const framework_1 = require("../framework");
const security_1 = require("../framework/security");
const types_1 = require("../framework/types");
const application_1 = require("../framework/application");
;
class User {
    /**
     *
     */
    constructor() {
        this.name = "";
        this.password = "";
    }
    static factory(context, data, trace) {
        return new UserFactory(context, data || new User(), trace);
    }
}
exports.User = User;
class UserFactory extends application_1.Auditable {
}
exports.UserFactory = UserFactory;
class ComponentFactory extends types_1.Entity {
}
exports.ComponentFactory = ComponentFactory;
function test() {
    const context = {
        actor: "Mocha",
        description: "Test",
        provider: "TS",
        user: "mocha"
    };
    const userJSON = {
        name: "Sergio",
        password: "123456"
    };
    // let user = User.builder()
    //     .setProperty("name", userJSON["name"])
    //     .setProperty("password", userJSON["password"]);
    // let userBuilder = Object.keys(userJSON).map(k => <keyof IUser>k).reduce((prev: UserBuilder, next) => prev.(next, userJSON[next]), User.builder());
    const userFactory = User.factory(context, userJSON);
    console.log(userFactory.getState());
    userFactory.setState({
        name: "Sergio Ivan",
        password: "12234214"
    });
    console.log(userFactory.getState());
}
test();
class Store extends security_1.AccessCotrolledEntityStore {
    /**
     *
     */
    constructor(appName, context, acRules, role, enableAuditing = false, includeDeleted = false) {
        super(appName, context, acRules, role, enableAuditing, includeDeleted, false);
    }
    getComponentId() {
        return "test";
    }
    getCollectionName() {
        return "cart";
    }
    getStores() {
        return this.read();
    }
    validateReading(target) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            let validationResult = yield _super("validateReading").call(this, target);
            return validationResult;
        });
    }
}
exports.Store = Store;
function init() {
    framework_1.Data.Providers.Firebase.firebase("test", undefined, process.env.Firebase);
}
exports.init = init;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2FtcGxlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFDQSw0Q0FBMkQ7QUFDM0Qsb0RBQXVGO0FBRXZGLDhDQUFtRTtBQUNuRSwwREFBa0U7QUFPakUsQ0FBQztBQUVGLE1BQWEsSUFBSTtJQU1iOztPQUVHO0lBQ0g7UUFDSSxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNmLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO0lBQ3ZCLENBQUM7SUFFTSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQWlCLEVBQUUsSUFBWSxFQUFFLEtBQWlDO1FBQ3BGLE9BQU8sSUFBSSxXQUFXLENBQUMsT0FBTyxFQUFFLElBQUksSUFBSSxJQUFJLElBQUksRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQy9ELENBQUM7Q0FPSjtBQXZCRCxvQkF1QkM7QUFFRCxNQUFhLFdBQVksU0FBUSx1QkFBZ0I7Q0FFaEQ7QUFGRCxrQ0FFQztBQUVELE1BQWEsZ0JBQWlCLFNBQVEsY0FBYTtDQUVsRDtBQUZELDRDQUVDO0FBRUQsU0FBUyxJQUFJO0lBRVQsTUFBTSxPQUFPLEdBQUc7UUFDWixLQUFLLEVBQUUsT0FBTztRQUNkLFdBQVcsRUFBRSxNQUFNO1FBQ25CLFFBQVEsRUFBRSxJQUFJO1FBQ2QsSUFBSSxFQUFFLE9BQU87S0FDaEIsQ0FBQztJQUVGLE1BQU0sUUFBUSxHQUFHO1FBQ2IsSUFBSSxFQUFFLFFBQVE7UUFDZCxRQUFRLEVBQUUsUUFBUTtLQUNaLENBQUM7SUFFWCw0QkFBNEI7SUFDNUIsNkNBQTZDO0lBQzdDLHNEQUFzRDtJQUV0RCxxSkFBcUo7SUFFckosTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFFcEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUVwQyxXQUFXLENBQUMsUUFBUSxDQUFDO1FBQ2pCLElBQUksRUFBRSxhQUFhO1FBQ25CLFFBQVEsRUFBRSxVQUFVO0tBQ3ZCLENBQUMsQ0FBQztJQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7QUFDeEMsQ0FBQztBQUVELElBQUksRUFBRSxDQUFDO0FBQ1AsTUFBYSxLQUFNLFNBQVEscUNBQWdDO0lBRXZEOztPQUVHO0lBQ0gsWUFDSSxPQUFlLEVBQ2YsT0FBaUIsRUFDakIsT0FBa0MsRUFDbEMsSUFBZSxFQUNmLGNBQWMsR0FBRyxLQUFLLEVBQUUsY0FBYyxHQUFHLEtBQUs7UUFDOUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2xGLENBQUM7SUFDUyxjQUFjO1FBQ3BCLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFDUyxpQkFBaUI7UUFDdkIsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVNLFNBQVM7UUFDWixPQUFPLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRWUsZUFBZSxDQUFDLE1BQXlCOzs7WUFDckQsSUFBSSxnQkFBZ0IsR0FBRyxNQUFNLHlCQUFxQixZQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzNELE9BQU8sZ0JBQWdCLENBQUM7UUFDNUIsQ0FBQztLQUFBO0NBQ0o7QUE1QkQsc0JBNEJDO0FBQ0QsU0FBZ0IsSUFBSTtJQUNoQixnQkFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFDbkMsU0FBUyxFQUNULE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBMEIsQ0FDekMsQ0FBQTtBQUNMLENBQUM7QUFMRCxvQkFLQyJ9