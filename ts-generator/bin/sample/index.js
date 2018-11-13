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
    // public static factory(context: IContext, data?: IUser, trace?: Array<IAuditEvent<IUser>>): UserFactory {
    //     return new UserFactory(context, data || new User(), trace);
    // }
    static factory(context, data, trace) {
        return new ComponentFactory(data || new User(), context);
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
    const context = { actor: "Mocha", description: "Test", provider: "TS", user: "mocha" };
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
    framework_1.Data.Providers.Firebase.firebase("test", undefined, {
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        token_uri: "https://accounts.google.com/o/oauth2/token",
        client_email: "firebase-adminsdk-y4xm4@sticky-cart.iam.gserviceaccount.com",
        project_id: "sticky-cart",
        type: "service_account",
        private_key_id: "8488035dd643c24d1839cb296de103a28418e304",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD4KkTtae5zL/aj\n3oN1Z/aEcxSkXnZNk8F+Nj1Wqn/jfzmxJxortvQg5hn4H+nNfsGiSsvrHwxXCo2l\np9yZbCfCqK1QWMBjwgErLGH3y7HXaV2aeuNflU/C97zJYoPKDI9e/02nWVFKH8e6\nh9RzvYeQWEeF1nJSWtiDXgAlugNi7uCH6sUrTVKREk3jVsAdMqzoMtGvGITBZ2YH\nD2lJS45cwwgPwHJoyxsNN6NdzcigwzolpMCvi9WaGVFKge3trSaHKOtJZdBcgH4Y\n7ZY+9UIakDjaDDV1T35tabDpM0s8RGYrfQuMmZycEePVYM5BEpxG3gxj5Yhy5hhp\neECDGLsDAgMBAAECggEAEh21bG0IQDAAxEbd6xGZnsk734fmmpRhUqv1xfOqZFqJ\nEdQ17K0HA1CcFekjSzuoOdQiyllsFpdc1PpjeAiImoUJXRn6T9rKW3MUL8YWuty+\nClhTbH3c4otTpJJLGdI/tE9ueGH+NV5xv4pjSWCAZ43AouLCjVDrPCPKxPZGtJw9\nlw26HoNcXEdTZdePC6NRAepkDFgiXd2z07tColI1DJMOmcYwgNBr6yqWKyB1cMJx\n37SuFtpTY80B7ztHzzeSBagsXZ9eG42QKW8QINJQ3ovdLUoeYD8256PXBnr9s+KU\nhpShjEjUmjSgf3cUKss7IQn1xB6bDUhTS3k1rdkZSQKBgQD+RN4X4ZULukbfZIxE\nTBk3QctPMe2duJS0G4O4pQ6CFtGt46K6zpolPdELk7BpekQa9qhNA9+RdOxWnvIx\nJCIQDV04989VbbyDwwhqq11uILjpK5OWS+uQ0L0Ejm+AZerJeLn5fHxiplWLdPxb\nEYG7uLFy8948MJm1AyjcaXEOLQKBgQD52sOVnPyrKA9qqmzF8DOBa55xyWioPFlU\nnoI9+MVApjYaP40eqU5tFVp4nplww8RcfJPMXFxBrVCLh2YjEh0qovzObA6iVKIR\ncOqIrbFQqQ5YMShX44+dqnuffAPE54Wr1Ta1VecBhuJJ4Zj72xXUtyAnHaAcnAN6\nPNAzmJzb7wKBgA5PAdCGOUT3rpVTqzEMtz6MzUwfmyeNA5E/GyKA51gawKHwdW/d\nwH7oA6OLJBpLbxm1V7M9zI767XHSb/6j8ebFWcGi8F/2VO11RDv8eL2ByeYVNbD3\nhMIZfQmMmmm3UocT7CNGBhnnEllOtATL72kI87NsVc09TukIzHva0ynhAoGBALRh\nfaZ76eZfS5IEa/cTDPw4h/E6KTacKxnuPbUj7rRXyuN0Uht6u8YBDonaZoiErTTg\nM4vseiZoS6gQHmrfXvMzLDSSypXjaAYTcR8v1r2W72Y4Rxn8jeiT9iAT1lzHkTeW\n/KI53Ea77I7OMjZR2xbxBmN2/erpr5EGaoF1gnk9AoGAdEloJ0WAem7Vb9R1mFd4\nw4QzLSO/9ypWxW/HaRhBi8ZGicKq6l+ncyjt7h3jsBTW4oLziUae3cLOdSvwzL+4\n6RFQaBnY4r4gBlJi5dDktdVMTYvpb23YK8hVNyf2KFURxF8p3CgP4Q/X6gX5kUzz\nW5+4XRVzwdjFNm8rLKa+DQQ=\n-----END PRIVATE KEY-----\n",
        client_id: "118384402535885091908",
        client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-y4xm4%40sticky-cart.iam.gserviceaccount.com"
    });
}
exports.init = init;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2FtcGxlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFDQSw0Q0FBMkQ7QUFDM0Qsb0RBQXVGO0FBRXZGLDhDQUFtRTtBQUNuRSwwREFBa0U7QUFPakUsQ0FBQztBQUVGLE1BQWEsSUFBSTtJQU1iOztPQUVHO0lBQ0g7UUFDSSxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNmLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCwyR0FBMkc7SUFDM0csa0VBQWtFO0lBQ2xFLElBQUk7SUFFRyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQWlCLEVBQUUsSUFBWSxFQUFFLEtBQWlDO1FBQ3BGLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM3RCxDQUFDO0NBR0o7QUF2QkQsb0JBdUJDO0FBRUQsTUFBYSxXQUFZLFNBQVEsdUJBQWdCO0NBRWhEO0FBRkQsa0NBRUM7QUFFRCxNQUFhLGdCQUFpQixTQUFRLGNBQWE7Q0FFbEQ7QUFGRCw0Q0FFQztBQUVELFNBQVMsSUFBSTtJQUVULE1BQU0sT0FBTyxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDO0lBRXZGLE1BQU0sUUFBUSxHQUFHO1FBQ2IsSUFBSSxFQUFFLFFBQVE7UUFDZCxRQUFRLEVBQUUsUUFBUTtLQUNaLENBQUM7SUFFWCw0QkFBNEI7SUFDNUIsNkNBQTZDO0lBQzdDLHNEQUFzRDtJQUV0RCxxSkFBcUo7SUFFckosTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFFcEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUVwQyxXQUFXLENBQUMsUUFBUSxDQUFDO1FBQ2pCLElBQUksRUFBRSxhQUFhO1FBQ25CLFFBQVEsRUFBRSxVQUFVO0tBQ3ZCLENBQUMsQ0FBQztJQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7QUFDeEMsQ0FBQztBQUVELElBQUksRUFBRSxDQUFDO0FBQ1AsTUFBYSxLQUFNLFNBQVEscUNBQWdDO0lBRXZEOztPQUVHO0lBQ0gsWUFDSSxPQUFlLEVBQ2YsT0FBaUIsRUFDakIsT0FBa0MsRUFDbEMsSUFBZSxFQUNmLGNBQWMsR0FBRyxLQUFLLEVBQUUsY0FBYyxHQUFHLEtBQUs7UUFDOUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2xGLENBQUM7SUFDUyxjQUFjO1FBQ3BCLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFDUyxpQkFBaUI7UUFDdkIsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVNLFNBQVM7UUFDWixPQUFPLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRWUsZUFBZSxDQUFDLE1BQXlCOzs7WUFDckQsSUFBSSxnQkFBZ0IsR0FBRyxNQUFNLHlCQUFxQixZQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzNELE9BQU8sZ0JBQWdCLENBQUM7UUFDNUIsQ0FBQztLQUFBO0NBQ0o7QUE1QkQsc0JBNEJDO0FBQ0QsU0FBZ0IsSUFBSTtJQUNoQixnQkFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFDbkMsU0FBUyxFQUNUO1FBQ0ksMkJBQTJCLEVBQUUsNENBQTRDO1FBQ3pFLFNBQVMsRUFBRSw0Q0FBNEM7UUFDdkQsWUFBWSxFQUFFLDZEQUE2RDtRQUMzRSxVQUFVLEVBQUUsYUFBYTtRQUN6QixJQUFJLEVBQUUsaUJBQWlCO1FBQ3ZCLGNBQWMsRUFBRSwwQ0FBMEM7UUFDMUQsUUFBUSxFQUFFLDJDQUEyQztRQUNyRCxXQUFXLEVBQUUsc3NEQUFzc0Q7UUFDbnRELFNBQVMsRUFBRSx1QkFBdUI7UUFDbEMsb0JBQW9CLEVBQUUsaUhBQWlIO0tBQ3hILENBQ3RCLENBQUE7QUFDTCxDQUFDO0FBaEJELG9CQWdCQyJ9