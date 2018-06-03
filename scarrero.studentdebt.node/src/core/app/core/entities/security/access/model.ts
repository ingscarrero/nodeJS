import * as common from "../../common/model";
import * as identity from "../identity/model";

export class Authorization{
    role_id: String;
    updates: Array<common.Action>;
    status: String;
}

export interface IRole{
    _id: String;
    name: String;
    description: String;
    permissions: Array<Permission>;
    ancestors: Array<String>;
    parent: String;
    status: String;
    updates: Array<common.Action>
}

export class Permission{
    component_id: String;
    channel_id: String;
    subscriber: {
        organization_id: String;
        updates: Array<common.Action>;
    }
    activities: Array<Activity>
    status: String;
}

export class Activity {
    name: String;
    scope: String;
    allowed: Boolean;
    updates: Array<common.Action>
}

export interface IUser extends identity.IIdentity {
    _id: String;
    credentials: Array<Credential>;
    authorizations: Array<Authorization>;
    locations: Array<common.Location>
}

export class Credential{
    credential_type: String;
    authorization: {
        authorization_id: String;
        updates: Array<common.Action>;
    }
    updates: Array<common.Action>;
    status: String;
}

export class Login extends Credential{
    login: String;
    password: String;
    password_hint: String;
}

export class Token extends Credential{
    token: String;
    expiration: Date;
    provider: String;
    external_id: String;
}