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

    public static factory(context: IContext, data?: IUser, trace?: Array<IAuditEvent<IUser>>): UserFactory {
        return new UserFactory(context, data || new User(), trace);
    }

    // public static factory(context: IContext, data?: IUser, trace?: Array<IAuditEvent<IUser>>): ComponentFactory {
    //     return new ComponentFactory(data || new User(), context);
    // }


}

export class UserFactory extends Auditable<IUser> {

}

export class ComponentFactory extends Entity<IUser> {

}

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
        process.env.FIREBASE as ServiceAccount
    )
}