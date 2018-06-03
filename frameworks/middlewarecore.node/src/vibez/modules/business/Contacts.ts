import { UserKind, SecurityContext } from "../security";
import { Contact } from "./Business";
import { Indexable, DomainError, DataProvider } from "../common";
import { Action } from "../auditory";
import * as admin from "firebase-admin";
import { firestore } from "firebase-admin";
export class ContactProvider<T extends UserKind> extends DataProvider {
  context: SecurityContext<T>;
  private static readonly COMPONENT = "CONTACT_PROVIDER";

  constructor(context: SecurityContext<T>, dataSource: firestore.Firestore) {
    super(dataSource);
    this.context = context;
  }

  public async createContact(contact: Contact) {
    let result = this.context.performTask<SecurityContext<T>, Contact>(
      "Write",
      ContactProvider.COMPONENT,
      async c => {
        let action: Action = {
          actor: c.getActorInformation(),
          date: new Date(Date.now()),
          description: `Register contact`
        };

        contact.actions = [action];

        let contactCollection = this.dataSource.collection("Contacts");

        let contactDocument = await contactCollection.add(contact);

        {
          let { id } = await contactDocument.get();
          contact.id = id;
        }

        return contact;
      }
    );
    return result;
  }

  public async updateContact(contact: Indexable, data: Contact) {
    let result = this.context.performTask<SecurityContext<T>, Contact>(
      "Write",
      ContactProvider.COMPONENT,
      async c => {
        let action: Action = {
          actor: c.getActorInformation(),
          date: new Date(Date.now()),
          description: `Updated information of contact with id [${contact.id}]`
        };

        let updatedContact: Contact;
        let contactCollection = this.dataSource.collection("Contacts");

        let contactDocument = contactCollection.doc(contact.id);

        {
          let snapshot = await contactDocument.get();
          if (!snapshot.exists) {
            return Promise.reject(
              new DomainError(
                "NOT_FOUND",
                "There were no matches for the submitted contact information",
                ContactProvider.COMPONENT,
                "Please validate the submitted information",
                undefined,
                "LOW",
                "When updating a contact, the submitted information doesn't match the available contact records"
              )
            );
          }
          updatedContact = Object.assign(
            { id: snapshot.id } as Contact,
            snapshot.data()
          );
        }

        if (data.email) {
          action.description.concat(
            `\nUpdated email: ${updatedContact.email}->${data.email}`
          );

          updatedContact.email = data.email;
        }

        if (data.mobile) {
          action.description.concat(
            `\nUpdated mobile: ${updatedContact.mobile}->${data.mobile}`
          );

          updatedContact.mobile = data.mobile;
        }

        if (data.name) {
          action.description.concat(
            `\nUpdated name: ${updatedContact.name}->${data.name}`
          );

          updatedContact.name = data.name;
        }

        if (data.surname) {
          action.description.concat(
            `\nUpdated surname: ${updatedContact.surname}->${data.surname}`
          );

          updatedContact.surname = data.surname;
        }

        updatedContact.actions.push(action);

        await contactDocument.update(updatedContact);

        return updatedContact;
      }
    );
    return result;
  }
  public async getContact(contact: Indexable) {
    let result = this.context.performTask<SecurityContext<T>, Contact>(
      "Read",
      ContactProvider.COMPONENT,
      async c => {
        let fetchedContact: Contact;

        let contactCollection = this.dataSource.collection("Contacts");

        let contactDocument = contactCollection.doc(contact.id);

        let snapshot = await contactDocument.get();

        if (!snapshot.exists) {
          return Promise.reject(
            new DomainError(
              "NOT_FOUND",
              "There were no matched contacts for the submitted criteria",
              ContactProvider.COMPONENT,
              "Please check the submitted information",
              undefined,
              "LOW",
              "When retrieving the contact information, there were no matches for the provided contact identifier"
            )
          );
        }
        fetchedContact = Object.assign(
          { id: snapshot.id } as Contact,
          snapshot.data()
        );

        return fetchedContact;
      }
    );
    return result;
  }
}
