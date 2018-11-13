import { ServiceAccount } from "firebase-admin/lib";
import { Data, IContext, ITaskResult } from "../framework";
import { AccessCotrolledEntityStore, StoreAccessControl } from "../framework/security";
import { IValidationResult } from "../framework/data";
import { IIndexable, IIdentity, Entity } from "../framework/types";
import { IAuditEvent, Auditable } from "../framework/application";
import { DocumentStatus, IDocument } from '../framework/common/DataStore';


export interface IUser extends IDocument {
    name: string;
    password: string;
};

export class User implements IUser {
    readonly name: string;
    readonly password: string;
    readonly id?: string;
    readonly status?: DocumentStatus;

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

    public static factory(context: IContext, data?: IUser, trace?: Array<IAuditEvent<IUser>>): ComponentFactory {
        return new ComponentFactory(data || new User(), context);
    }


}

export class UserFactory extends Auditable<IUser> {

}

export class ComponentFactory extends Entity<IUser> {

}

function test() {

    const context = { actor: "Mocha", description: "Test", provider: "TS", user: "mocha" };

    const userJSON = {
        name: "Sergio",
        password: "123456"
    } as IUser;

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
export class Store extends AccessCotrolledEntityStore<User>{

    /**
     *
     */
    constructor(
        appName: string,
        context: IContext,
        acRules: Array<StoreAccessControl>,
        role: IIdentity,
        enableAuditing = false, includeDeleted = false) {
        super(appName, context, acRules, role, enableAuditing, includeDeleted, false);
    }
    protected getComponentId(): string {
        return "test";
    }
    protected getCollectionName(): string {
        return "cart";
    }

    public getStores(): Promise<ITaskResult<User>> {
        return this.read();
    }

    protected async validateReading(target?: () => IIndexable): Promise<IValidationResult> {
        let validationResult = await super.validateReading(target);
        return validationResult;
    }
}
export function init() {
    Data.Providers.Firebase.firebase("test",
        undefined,
        {
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
        } as ServiceAccount
    )
}