import { IndexableCollection } from "../common/Common";
import { SecurityContext } from "./SecurityContext";
import { CredentialProvider, Credential, User, UserKind } from "./Security";
import { Indexable, DataProvider } from "../common";
import { firestore } from "firebase-admin";
export declare class AccountManager<T extends UserKind> extends DataProvider {
    context: SecurityContext<T>;
    private static readonly COMPONENT;
    constructor(context: SecurityContext<T>, dataSource: firestore.Firestore);
    private getDefaultRoleForAccount<T>(userKind);
    private validateActivation(actionCode, continueUrl);
    authenticateAccount(credentialID: string, password?: string, token?: string): Promise<User<UserKind>>;
    createAccount<U extends UserKind>(identity: IndexableCollection<"Identities">, credential: Credential, userKind: U): Promise<User<U>>;
    activateAccount<U extends UserKind>(user: IndexableCollection<"Users">, userKind: U): Promise<User<U>>;
    assignAccountRole<U extends UserKind>(user: IndexableCollection<"Users">, role: IndexableCollection<"Roles">, userKind: U): Promise<User<U>>;
    updateCredential<U extends UserKind>(user: IndexableCollection<"Users">, credential: Indexable, issuer: CredentialProvider, data: Credential, userKind: U): Promise<User<U>>;
    resetCredential<U extends UserKind>(identity: Indexable, request?: Indexable): Promise<User<U>>;
    generateRandomPassword(): string;
}
