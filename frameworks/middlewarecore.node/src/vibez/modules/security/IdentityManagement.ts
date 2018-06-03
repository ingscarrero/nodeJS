import { SecurityContext } from "./SecurityContext";
import { UserKind, Identity } from "./Security";
import {
  IndexableCollection,
  Indexable,
  DomainError,
  DataProvider
} from "../common";
import { Action } from "../auditory";
import * as admin from "firebase-admin";
import { firestore } from "firebase-admin";
export class IdentityManager<T extends UserKind> extends DataProvider {
  context: SecurityContext<T>;
  private static readonly COMPONENT = "IDENTITY_MANAGER";
  constructor(context: SecurityContext<T>, dataSource: firestore.Firestore) {
    super(dataSource);
    this.context = context;
  }
  public async createIdentity(
    contact: IndexableCollection<"Contacts">
  ): Promise<Identity> {
    let result = await this.context.performTask<SecurityContext<T>, Identity>(
      "Write",
      IdentityManager.COMPONENT,
      async c => {
        let identityAction: Action = {
          actor: c.getActorInformation(),
          date: new Date(Date.now()),
          description: `Register identity for contact with id [${contact.id}]`
        };

        let identity: Identity = {
          contact: contact,
          actions: [identityAction],
          collection: "Identities",
          id: ""
        };

        let collection = this.dataSource.collection("Identities");
        let identityDocument = await collection.add(identity);
        {
          let { id } = await identityDocument.get();
          identity.id = id;
        }
        return identity;
      }
    );
    return result;
  }
  public async updateIdentity(
    identity: Indexable,
    data: Identity
  ): Promise<Identity> {
    let result = await this.context.performTask<SecurityContext<T>, Identity>(
      "Write",
      IdentityManager.COMPONENT,
      async c => {
        let updateIdentity: Identity;

        let identityCollection = this.dataSource.collection("Identities");
        let identityDocument = identityCollection.doc(identity.id);

        {
          let snapshot = await identityDocument.get();
          updateIdentity = Object.assign(
            { id: snapshot.id } as Identity,
            snapshot.data()
          );
        }

        let action: Action = {
          actor: c.getActorInformation(),
          date: new Date(Date.now()),
          description: `Updated information for identity with id [${
            identity.id
          }].`
        };

        if (data) {
          if (data.contact) {
            action.description.concat(
              `\nUpdated contact: ${updateIdentity.contact.id}->${
                data.contact.id
              }`
            );
            updateIdentity.contact = data.contact;
          }
        }

        updateIdentity.actions.push(action);
        await identityDocument.update(updateIdentity);
        return updateIdentity;
      }
    );
    return result;
  }
  public async getIdentity(
    identity: IndexableCollection<"Identities">
  ): Promise<Identity> {
    let result = await this.context.performTask<SecurityContext<T>, Identity>(
      "Read",
      IdentityManager.COMPONENT,
      async c => {
        let fetchedIdentity: Identity;

        let identityCollection = this.dataSource.collection("Identities");
        let identityDocument = identityCollection.doc(identity.id);

        let snapshot = await identityDocument.get();

        if (!snapshot.exists) {
          return Promise.reject(
            new DomainError(
              "NOT_FOUND",
              "There were no matched identities for the submitted criteria",
              IdentityManager.COMPONENT,
              "Please check the submitted information",
              undefined,
              "LOW",
              "When retrieving the identity information, there were no matches for the provided identity identifier"
            )
          );
        }

        fetchedIdentity = Object.assign(
          { id: snapshot.id } as Identity,
          snapshot.data()
        );

        return fetchedIdentity;
      }
    );
    return result;
  }
}
