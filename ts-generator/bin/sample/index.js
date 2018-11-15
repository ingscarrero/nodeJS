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
;
class Test {
    constructor() {
        this.name = "";
    }
    static factory(context, data, trace) {
        return new TestFactory(context, data || new Test(), trace);
    }
}
exports.Test = Test;
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
class TestFactory extends application_1.Auditable {
}
exports.TestFactory = TestFactory;
class UserFactory extends application_1.Auditable {
}
exports.UserFactory = UserFactory;
class ComponentFactory extends types_1.Entity {
}
exports.ComponentFactory = ComponentFactory;
function test() {
    types_1.Entity.register("user", (context, data) => User.factory(context, data));
    types_1.Entity.register("test", (context, data) => Test.factory(context, data));
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
    const testJSON = {
        name: "Paola"
    };
    let userEntity = types_1.Entity.use("user", context, userJSON);
    let testEntity = types_1.Entity.use("test", context, testJSON);
    // let user = User.builder()
    //     .setProperty("name", userJSON["name"])
    //     .setProperty("password", userJSON["password"]);
    // let userBuilder = Object.keys(userJSON).map(k => <keyof IUser>k).reduce((prev: UserBuilder, next) => prev.(next, userJSON[next]), User.builder());
    console.log(userEntity.getState());
    console.log(testEntity.getState());
    userEntity.setState({
        name: "Sergio Ivan",
        password: "12234214"
    });
    testEntity.setState({
        name: "Paola Bonilla",
    });
    console.log(userEntity.getState());
    console.log(testEntity.getState());
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
    framework_1.Data.Providers.Firebase.firebase("test", undefined, process.env.FIREBASE);
}
exports.init = init;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2FtcGxlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFDQSw0Q0FBMkQ7QUFDM0Qsb0RBQXVGO0FBRXZGLDhDQUFtRTtBQUNuRSwwREFBa0U7QUFPakUsQ0FBQztBQUlELENBQUM7QUFHRixNQUFhLElBQUk7SUFHYjtRQUNJLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ25CLENBQUM7SUFFTSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQWlCLEVBQUUsSUFBWSxFQUFFLEtBQWlDO1FBQ3BGLE9BQU8sSUFBSSxXQUFXLENBQUMsT0FBTyxFQUFFLElBQUksSUFBSSxJQUFJLElBQUksRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQy9ELENBQUM7Q0FDSjtBQVZELG9CQVVDO0FBQ0QsTUFBYSxJQUFJO0lBTWI7O09BRUc7SUFDSDtRQUNJLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2YsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUVNLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBaUIsRUFBRSxJQUFZLEVBQUUsS0FBaUM7UUFDcEYsT0FBTyxJQUFJLFdBQVcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDL0QsQ0FBQztDQU9KO0FBdkJELG9CQXVCQztBQUVELE1BQWEsV0FBWSxTQUFRLHVCQUFnQjtDQUVoRDtBQUZELGtDQUVDO0FBRUQsTUFBYSxXQUFZLFNBQVEsdUJBQWdCO0NBRWhEO0FBRkQsa0NBRUM7QUFFRCxNQUFhLGdCQUFpQixTQUFRLGNBQWE7Q0FFbEQ7QUFGRCw0Q0FFQztBQUdELFNBQVMsSUFBSTtJQUNULGNBQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsT0FBaUIsRUFBRSxJQUFZLEVBQUUs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