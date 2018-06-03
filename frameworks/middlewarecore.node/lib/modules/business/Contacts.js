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
const common_1 = require("../common");
class ContactProvider extends common_1.DataProvider {
    constructor(context, dataSource) {
        super(dataSource);
        this.context = context;
    }
    createContact(contact) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = this.context.performTask("Write", ContactProvider.COMPONENT, (c) => __awaiter(this, void 0, void 0, function* () {
                let action = {
                    actor: c.getActorInformation(),
                    date: new Date(Date.now()),
                    description: `Register contact`
                };
                contact.actions = [action];
                let contactCollection = this.dataSource.collection("Contacts");
                let contactDocument = yield contactCollection.add(contact);
                {
                    let { id } = yield contactDocument.get();
                    contact.id = id;
                }
                return contact;
            }));
            return result;
        });
    }
    updateContact(contact, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = this.context.performTask("Write", ContactProvider.COMPONENT, (c) => __awaiter(this, void 0, void 0, function* () {
                let action = {
                    actor: c.getActorInformation(),
                    date: new Date(Date.now()),
                    description: `Updated information of contact with id [${contact.id}]`
                };
                let updatedContact;
                let contactCollection = this.dataSource.collection("Contacts");
                let contactDocument = contactCollection.doc(contact.id);
                {
                    let snapshot = yield contactDocument.get();
                    if (!snapshot.exists) {
                        return Promise.reject(new common_1.DomainError("NOT_FOUND", "There were no matches for the submitted contact information", ContactProvider.COMPONENT, "Please validate the submitted information", undefined, "LOW", "When updating a contact, the submitted information doesn't match the available contact records"));
                    }
                    updatedContact = Object.assign({ id: snapshot.id }, snapshot.data());
                }
                if (data.email) {
                    action.description.concat(`\nUpdated email: ${updatedContact.email}->${data.email}`);
                    updatedContact.email = data.email;
                }
                if (data.mobile) {
                    action.description.concat(`\nUpdated mobile: ${updatedContact.mobile}->${data.mobile}`);
                    updatedContact.mobile = data.mobile;
                }
                if (data.name) {
                    action.description.concat(`\nUpdated name: ${updatedContact.name}->${data.name}`);
                    updatedContact.name = data.name;
                }
                if (data.surname) {
                    action.description.concat(`\nUpdated surname: ${updatedContact.surname}->${data.surname}`);
                    updatedContact.surname = data.surname;
                }
                updatedContact.actions.push(action);
                yield contactDocument.update(updatedContact);
                return updatedContact;
            }));
            return result;
        });
    }
    getContact(contact) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = this.context.performTask("Read", ContactProvider.COMPONENT, (c) => __awaiter(this, void 0, void 0, function* () {
                let fetchedContact;
                let contactCollection = this.dataSource.collection("Contacts");
                let contactDocument = contactCollection.doc(contact.id);
                let snapshot = yield contactDocument.get();
                if (!snapshot.exists) {
                    return Promise.reject(new common_1.DomainError("NOT_FOUND", "There were no matched contacts for the submitted criteria", ContactProvider.COMPONENT, "Please check the submitted information", undefined, "LOW", "When retrieving the contact information, there were no matches for the provided contact identifier"));
                }
                fetchedContact = Object.assign({ id: snapshot.id }, snapshot.data());
                return fetchedContact;
            }));
            return result;
        });
    }
}
ContactProvider.COMPONENT = "CONTACT_PROVIDER";
exports.ContactProvider = ContactProvider;
//# sourceMappingURL=Contacts.js.map