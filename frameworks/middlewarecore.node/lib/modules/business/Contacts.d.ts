import { UserKind, SecurityContext } from "../security";
import { Contact } from "./Business";
import { Indexable, DataProvider } from "../common";
import { firestore } from "firebase-admin";
export declare class ContactProvider<T extends UserKind> extends DataProvider {
    context: SecurityContext<T>;
    private static readonly COMPONENT;
    constructor(context: SecurityContext<T>, dataSource: firestore.Firestore);
    createContact(contact: Contact): Promise<Contact>;
    updateContact(contact: Indexable, data: Contact): Promise<Contact>;
    getContact(contact: Indexable): Promise<Contact>;
}
