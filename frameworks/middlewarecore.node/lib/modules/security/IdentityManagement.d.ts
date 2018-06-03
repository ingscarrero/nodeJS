import { SecurityContext } from "./SecurityContext";
import { UserKind, Identity } from "./Security";
import { IndexableCollection, Indexable, DataProvider } from "../common";
import { firestore } from "firebase-admin";
export declare class IdentityManager<T extends UserKind> extends DataProvider {
    context: SecurityContext<T>;
    private static readonly COMPONENT;
    constructor(context: SecurityContext<T>, dataSource: firestore.Firestore);
    createIdentity(contact: IndexableCollection<"Contacts">): Promise<Identity>;
    updateIdentity(identity: Indexable, data: Identity): Promise<Identity>;
    getIdentity(identity: IndexableCollection<"Identities">): Promise<Identity>;
}
