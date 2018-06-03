import { DomainError } from "../common/DomainError";
import { IndexableCollection } from "../common/Common";
import { IdentityManager } from "./IdentityManagement";

import { SecurityContext } from "./SecurityContext";
import {
  CredentialProvider,
  DEFAULT_EXPIRATION_SECONDS,
  Credential,
  User,
  Role,
  UserKind,
  MIN_PASSWORD_LENGTH
} from "./Security";
import { randomString } from "../util";
import { ContactProvider } from "../business";
import { Indexable, DataProvider } from "../common";
import { Action } from "../auditory";
import * as admin from "firebase-admin";
import { firestore } from "firebase-admin";
import { Domain, create } from "domain";
import { FieldValue } from "@google-cloud/firestore";
export class AccountManager<T extends UserKind> extends DataProvider {
  context: SecurityContext<T>;

  private static readonly COMPONENT = "ACCOUNT_MANAGER";

  constructor(context: SecurityContext<T>, dataSource: firestore.Firestore) {
    super(dataSource);
    this.context = context;
  }

  private async getDefaultRoleForAccount<T extends UserKind>(
    userKind: T
  ): Promise<IndexableCollection<"Roles">> {
    let result = this.context.performTask<SecurityContext<T>, Role>(
      "Read",
      AccountManager.COMPONENT,
      async c => {
        let rolesCollection = this.dataSource.collection("Roles");
        let roleDocumentsQuery = rolesCollection.where(
          "name",
          "==",
          `DEFAULT_${userKind}`
        );
        let { docs, empty } = await roleDocumentsQuery.get();
        if (empty) {
          return Promise.reject(
            new DomainError(
              "NOT_FOUND",
              `There is no default role defined to account of type ${userKind}`,
              AccountManager.COMPONENT,
              "Please validate with the platform administrator",
              undefined,
              "MEDIUM",
              `When retrieving default role for account of type ${userKind}, there were no matching records`
            )
          );
        }
        let [snapshot] = [...docs];
        let role: Role = Object.assign({ id: snapshot.id } as Role, snapshot.data());
        return role;
      }
    );

    return result;
  }

  private async validateActivation(
    actionCode: string,
    continueUrl: string
  ): Promise<boolean> {
    let { operation, data } = await firebase.auth().checkActionCode(actionCode);

    if (operation !== "VERIFY_EMAIL") {
      return Promise.reject(
        new DomainError(
          "INVALID_ACTION",
          "Activation Action is not a valid one",
          AccountManager.COMPONENT,
          "Please validate the submitted information and try again",
          undefined,
          "LOW",
          "When validating activation for activation intent, the submitted action was invalid)"
        )
      );
    }

    let { email, fromEmail } = data;

    let result = await this.context.performTask<SecurityContext<T>, boolean>(
      "Write",
      AccountManager.COMPONENT,
      async context => {
        let activatingUser: User<"CORPORATE" | "END_USER">;

        let usersCollection = this.dataSource.collection("Users");
        let { empty, docs } = await usersCollection.get();

        if (empty) {
          return Promise.reject(
            new DomainError(
              "NOT_FOUND",
              `There were no matches for the submitted credentials`,
              AccountManager.COMPONENT,
              "Please validate the submitted information and try again",
              undefined,
              "LOW",
              "When validating account's activation there were not records matching credentials for the linked email"
            )
          );
        }

        let match = docs.map((snapshot)=> ({ ...snapshot.data(), id: snapshot.id } as User<"CORPORATE"|"END_USER">)).find(({credentials})=>credentials!.some(c=>c.issuer=="Local" && c.id == email));

        if (!match) {
          return Promise.reject(
            new DomainError(
              "NOT_FOUND",
              `There were no matches for the submitted credentials`,
              AccountManager.COMPONENT,
              "Please validate the submitted information and try again",
              undefined,
              "LOW",
              "When validating account's activation there were not records matching credentials for the linked email"
            )
          );
        }

        activatingUser = match;

        let credential = activatingUser.credentials!.find(
          c => c.issuer == "Local" && c.id == email
        );
        let credentialIndex = activatingUser.credentials!.indexOf(credential!);

        activatingUser.credentials![credentialIndex].validatedOn = new Date(
          Date.now()
        );
        activatingUser.validatedOn = new Date(Date.now());

        let action: Action = {
          actor: context.getActorInformation(),
          date: new Date(Date.now()),
          description: "Activate Account"
        };

        activatingUser.actions.push(action);

        await usersCollection.doc(activatingUser.id).update(activatingUser);

        return true;
      }
    );

    return true;
  }
  public async authenticateAccount(
    credentialID: string,
    password?: string,
    token?: string
  ): Promise<User<UserKind>> {
    let result = await this.context.performTask<
      SecurityContext<T>,
      User<UserKind>
    >("Read", AccountManager.COMPONENT, async c => {
      let authenticatedUser: User<UserKind>;

      let userCollection = this.dataSource.collection("Users");

      // let userDocumentsQuery = userCollection.where(
      //   "credentials.id",
      //   "==",
      //   credentialID
      // );

      // if (password) {
      //   userDocumentsQuery = userDocumentsQuery
      //     .where("credential.issuer", "==", "Local")
      //     .where("credentials.password", "==", password);
      // }

      // if (token) {
      //   userDocumentsQuery = userDocumentsQuery.where(
      //     "credentials.token",
      //     "==",
      //     token
      //   );
      // }

      let { docs, empty } = await userCollection.get();

      if (empty) {
        return Promise.reject(
          new DomainError(
            "NOT_FOUND",
            `There were no matches for the submitted credentials`,
            AccountManager.COMPONENT,
            "Please validate the submitted information or if there is a pending transaction on your account/credentials and try again",
            undefined,
            "LOW",
            "When authenticating the account for the submitted credentials there were not records matching either the credential ID, password or token and in a valid state (Successfully Validated)"
          )
        );
      }

      let match = docs.map((snapshot)=>({...snapshot.data(), id: snapshot.id} as User<UserKind>)).find(({credentials})=>{
        return credentials!.some(c=> c.id == credentialID && password ? c.issuer == "Local" && c.password == password : token ? c.token == token : false);
      });

      if (!match) {
        return Promise.reject(
          new DomainError(
            "NOT_FOUND",
            `There were no matches for the submitted credentials`,
            AccountManager.COMPONENT,
            "Please validate the submitted information or if there is a pending transaction on your account/credentials and try again",
            undefined,
            "LOW",
            "When authenticating the account for the submitted credentials there were not records matching either the credential ID, password or token and in a valid state (Successfully Validated)"
          )
        );
      }

      //let [{ id, data }] = [...docs];
      authenticatedUser = match;

      if (!authenticatedUser.validatedOn) {
        return Promise.reject(
          new DomainError(
            "INVALID_ACCOUNT",
            `Account hasn't been validated`,
            AccountManager.COMPONENT,
            "Please complete the registration process by checking your e-mails for an e-mail from [@vibez.io] with instructions.",
            undefined,
            "LOW",
            "When authenticating the account for the submitted credentials the account hasn't been validated"
          )
        );
      }

      let {
        issuedOn,
        expiration,
        validatedOn
      } = authenticatedUser.credentials!.find(
        c =>
          c.id == credentialID &&
          (password
            ? c.password == password
            : false || token ? c.token == token : false)
      )!;

      if (!validatedOn) {
        return Promise.reject(
          new DomainError(
            "INVALID_CREDENTIAL",
            `Credentials haven't been validated`,
            AccountManager.COMPONENT,
            "Please complete the registration process by checking your e-mails for an e-mail from [@vibez.io] with instructions.",
            undefined,
            "LOW",
            "When authenticating the account's credential haven't been validated"
          )
        );
      }

      let expiringAt = issuedOn;
      expiringAt.setSeconds(expiringAt.getSeconds() + expiration);

      if (expiringAt < new Date(Date.now())) {
        return Promise.reject(
          new DomainError(
            "INVALID_CREDENTIAL",
            `Expired credentials`,
            AccountManager.COMPONENT,
            "Please renew your credentials to continue",
            undefined,
            "LOW",
            "When authenticating the account for the submitted credentials the retrieved credentials were expired"
          )
        );
      }

      return authenticatedUser;
    });
    return result;
  }
  public async createAccount<U extends UserKind>(
    identity: IndexableCollection<"Identities">,
    credential: Credential,
    userKind: U
  ): Promise<User<U>> {
    if (!credential.password) {
      return Promise.reject(
        new DomainError(
          "INVALID_CREDENTIAL",
          `Password required`,
          AccountManager.COMPONENT,
          "Please validate your information and try again",
          undefined,
          "LOW",
          "When signing up the submitted account's information. There provided credentials had missing required information"
        )
      );
    }

    credential.issuer = "Local";
    credential.issuedOn = new Date(Date.now());
    credential.expiration = DEFAULT_EXPIRATION_SECONDS;

    let identityManager = new IdentityManager(this.context, this.dataSource);
    let contactProvider = new ContactProvider(this.context, this.dataSource);

    let fetchedIdentity = await identityManager.getIdentity(identity);
    let contact = await contactProvider.getContact(fetchedIdentity.contact);
    let role = await this.getDefaultRoleForAccount<U>(userKind);

    let result = await this.context.performTask<SecurityContext<T>, User<U>>(
      "Write",
      AccountManager.COMPONENT,
      async c => {
        let action: Action = {
          actor: c.getActorInformation(),
          date: new Date(Date.now()),
          description: `Register account for identity with id [${identity.id}]`
        };

        let account: User<U> = {
          id: "",
          identity,
          credentials: [credential],
          kind: userKind,
          role,
          actions: [action],
          collection: "Users"
        };

        let usersCollection = this.dataSource.collection("Users");
        let userDocument = await usersCollection.add(account);
        let { id } = await userDocument.get();
        account.id = id;

        let user: firebase.User = await firebase
          .auth()
          .createUserWithEmailAndPassword(contact.email, credential.password!);

        await user.sendEmailVerification();
        return account;
      }
    );
    return result;
  }

  public async activateAccount<U extends UserKind>(
    user: IndexableCollection<"Users">,
    userKind: U
  ): Promise<User<U>> {
    let result = await this.context.performTask<SecurityContext<T>, User<U>>(
      "Write",
      AccountManager.COMPONENT,
      async c => {
        let action: Action = {
          actor: c.getActorInformation(),
          date: new Date(Date.now()),
          description: `Account with id [${
            user.id
          }] has been activated successfully`
        };

        let updatedAccount: User<U>;

        let userCollection = this.dataSource.collection("Users");
        let userDocument = userCollection.doc(user.id);
        let snapshot = await userDocument.get();

        if (!snapshot.exists) {
          return Promise.reject(
            new DomainError(
              "NOT_FOUND",
              "User cannot be activated",
              AccountManager.COMPONENT,
              "Please validate the submitted information",
              undefined,
              "LOW",
              "When activating account, the submitted account information has no matches"
            )
          );
        }

        updatedAccount = Object.assign({ id: snapshot.id } as User<U>, snapshot.data());

        if (userKind != updatedAccount.kind) {
          return Promise.reject(
            new DomainError(
              "INVALID_ACCOUNT",
              "User cannot be activated",
              AccountManager.COMPONENT,
              "Please validate the submitted information",
              undefined,
              "LOW",
              "When activating account, the submitted account information doesn't match available records"
            )
          );
        }

        updatedAccount.actions.push(action);
        updatedAccount.validatedOn = new Date(Date.now());

        let { actions, validatedOn } = updatedAccount;

        await userDocument.update({ actions, validatedOn });

        return updatedAccount;
      }
    );
    return result;
  }
  public async assignAccountRole<U extends UserKind>(
    user: IndexableCollection<"Users">,
    role: IndexableCollection<"Roles">,
    userKind: U
  ): Promise<User<U>> {
    let result = await this.context.performTask<SecurityContext<T>, User<U>>(
      "Write",
      AccountManager.COMPONENT,
      async c => {
        let action: Action = {
          actor: c.getActorInformation(),
          date: new Date(Date.now()),
          description: `The role of the account with id [${
            user.id
          }] has been changed to [${role.id}]`
        };

        let updatedAccount: User<U>;

        let rolesCollection = this.dataSource.collection("Roles");
        let roleDocument = rolesCollection.doc(role.id);

        {
          let { id, exists, data } = await roleDocument.get();

          if (!exists) {
            return Promise.reject(
              new DomainError(
                "NOT_FOUND",
                "New role couldn't be assigned",
                AccountManager.COMPONENT,
                "Please validate the submitted information",
                undefined,
                "LOW",
                "When assigning account's role, the submitted role information has no matches"
              )
            );
          }
        }

        let userCollection = this.dataSource.collection("Users");
        let userDocument = userCollection.doc(user.id);

        {
          let snapshot = await userDocument.get();

          updatedAccount = Object.assign({ id: snapshot.id } as User<U>, snapshot.data());

          if (!snapshot.exists) {
            return Promise.reject(
              new DomainError(
                "NOT_FOUND",
                "New role couldn't be assigned",
                AccountManager.COMPONENT,
                "Please validate the submitted information",
                undefined,
                "LOW",
                "When assigning account's role, the submitted account information has no matches"
              )
            );
          }

          let { kind, actions } = updatedAccount;

          if (userKind != kind) {
            return Promise.reject(
              new DomainError(
                "INVALID_ACCOUNT",
                "User cannot be activated",
                AccountManager.COMPONENT,
                "Please validate the submitted information",
                undefined,
                "LOW",
                "When assigning account's role, the submitted account information doesn't match available records"
              )
            );
          }

          actions.push(action);

          updatedAccount.role = role;

          await userDocument.update(updatedAccount);
        }

        return updatedAccount;
      }
    );
    return result;
  }
  public async updateCredential<U extends UserKind>(
    user: IndexableCollection<"Users">,
    credential: Indexable,
    issuer: CredentialProvider,
    data: Credential,
    userKind: U
  ): Promise<User<U>> {
    let result = await this.context.performTask<SecurityContext<T>, User<U>>(
      "Write",
      AccountManager.COMPONENT,
      async c => {
        let action: Action = {
          actor: c.getActorInformation(),
          date: new Date(Date.now()),
          description: `The credentials of the account with id [${
            user.id
          }] and provider [${issuer}] has been successfully updated`
        };

        let updatedAccount: User<U>;

        let userCollection = this.dataSource.collection("Users");
        let userDocument = userCollection.doc(user.id);

        {
          let snapshot = await userDocument.get();

          if (!snapshot.exists) {
            return Promise.reject(
              new DomainError(
                "NOT_FOUND",
                "Cannot update credentials",
                AccountManager.COMPONENT,
                "Please validate the submitted information",
                undefined,
                "LOW",
                "When updating account's credentials, the submitted account information has no matches"
              )
            );
          }

          updatedAccount = Object.assign({ id: snapshot.id } as User<U>, snapshot.data());

          if (userKind != updatedAccount.kind) {
            return Promise.reject(
              new DomainError(
                "INVALID_ACCOUNT",
                "User cannot be activated",
                AccountManager.COMPONENT,
                "Please validate the submitted information",
                undefined,
                "LOW",
                "When activating account, the submitted account information doesn't match available records"
              )
            );
          }
        }

        if (!updatedAccount.credentials) {
          return Promise.reject(
            new DomainError(
              "UNASSIGNED_CREDENTIALS",
              `Account has no credentials registered`,
              AccountManager.COMPONENT,
              "Please validate the account information",
              undefined,
              "LOW",
              "When fetching account credentials for updating credentials, there were no credentials assigned to the corresponding account"
            )
          );
        }

        let updatedCredentialIndex = updatedAccount.credentials.findIndex(
          c => c.id == credential.id && c.issuer == issuer
        );

        if (updatedCredentialIndex < 0) {
          return Promise.reject(
            new DomainError(
              "CREDENTIAL_NOT_FOUND",
              `Account has no credentials matching the submitted criteria`,
              AccountManager.COMPONENT,
              "Please validate the submitted information",
              undefined,
              "LOW",
              "When fetching account credentials for updating credentials, there were no credentials matching the submitted criteria"
            )
          );
        }

        updatedAccount.credentials[
          updatedCredentialIndex
        ].validatedOn = new Date(Date.now());
        updatedAccount.credentials[updatedCredentialIndex].issuedOn = new Date(
          Date.now()
        );
        updatedAccount.credentials[updatedCredentialIndex].token = data.token;
        updatedAccount.credentials[updatedCredentialIndex].password =
          data.password;


        updatedAccount.actions.push(action);

        let { credentials, actions } = updatedAccount;

        await userDocument.update({ credentials, actions });

        return updatedAccount;
      }
    );
    return result;
  }
  public async resetCredential<U extends UserKind>(
    identity: Indexable,
    request?: Indexable
  ): Promise<User<U>> {
    let result = await this.context.performTask<SecurityContext<T>, User<U>>(
      "Write",
      AccountManager.COMPONENT,
      async c => {

        let usersCollection = this.dataSource.collection("Users");
        let userDocumentsQuery = usersCollection.where("identity.id","==", identity.id);
        let { empty, docs }  = await userDocumentsQuery.get();

        if (empty) {
          return Promise.reject(
            new DomainError(
              "ACCOUNT_NOT_FOUND",
              `The account for the submitted identity wasn't found`,
              AccountManager.COMPONENT,
              "Please validate the identity information",
              undefined,
              "LOW",
              "When fetching account information for recovering credentials, there were no accounts matching the submitted criteria"
            )
          );
        }

        let [snapshot] = [...docs];

        if (!snapshot.exists) {
          return Promise.reject(
            new DomainError(
              "ACCOUNT_NOT_FOUND",
              `The account for the submitted identity wasn't found`,
              AccountManager.COMPONENT,
              "Please validate the identity information",
              undefined,
              "LOW",
              "When fetching account information for recovering credentials, there were no accounts matching the submitted criteria"
            )
          );
        }

        let updatedAccount: User<U>;

        updatedAccount = Object.assign({ id: snapshot.id } as User<U>, snapshot.data());

        if (!updatedAccount.credentials) {
          return Promise.reject(
            new DomainError(
              "UNASSIGNED_CREDENTIALS",
              `Account has no credentials registered`,
              AccountManager.COMPONENT,
              "Please validate the account information",
              undefined,
              "LOW",
              "When fetching account credentials for updating credentials, there were no credentials assigned to the corresponding account"
            )
          );
        }

        let updatedCredentialIndex = updatedAccount.credentials.findIndex(
          c => c.issuer == "Local"
        );

        if (updatedCredentialIndex < 0) {
          return Promise.reject(
            new DomainError(
              "CREDENTIAL_NOT_FOUND",
              `Account has no credentials matching the submitted criteria`,
              AccountManager.COMPONENT,
              "Please validate the submitted information",
              undefined,
              "LOW",
              "When fetching account credentials for updating credentials, there were no credentials matching the submitted criteria"
            )
          );
        }

        let yesterday = new Date(Date.now());
        yesterday.setDate(yesterday.getDate() - 1);

        if (!request) {
          let resetRequest = {
            date: new Date(Date.now()),
            ipAddress: c.clientAddress,
            id: randomString(12)
          };

          let action: Action = {
            actor: c.getActorInformation(),
            date: new Date(Date.now()),
            description: `Scheduled request [${
              resetRequest.id
            }] to reset password of credentials with id [${
              updatedAccount.credentials[updatedCredentialIndex].id
            }]`
          };

          updatedAccount.resetRequest = resetRequest;
          updatedAccount.actions.push(action);

          return updatedAccount;
        } else if (
          request &&
          updatedAccount.resetRequest &&
          updatedAccount.resetRequest.id == request.id &&
          updatedAccount.resetRequest.date > yesterday
        ) {
          let action: Action = {
            actor: c.getActorInformation(),
            date: new Date(Date.now()),
            description: `Reset password of credentials with id [${
              updatedAccount.credentials[updatedCredentialIndex].id
            }`
          };

          updatedAccount.credentials[
            updatedCredentialIndex
          ].issuedOn = new Date(Date.now());
          updatedAccount.credentials[
            updatedCredentialIndex
          ].password = this.generateRandomPassword();
          updatedAccount.actions.push(action);

          let { credentials, actions, resetRequest } = updatedAccount;

          await usersCollection.doc(snapshot.id).update({ credentials, actions, resetRequest: FieldValue.delete() })

          return updatedAccount;
        } else {
          return Promise.reject(
            new DomainError(
              "INVALID_OPERATION",
              `The account's credentials reset request is invalid`,
              AccountManager.COMPONENT,
              "Please validate the submitted information",
              undefined,
              "LOW",
              "When proceeding to reset credentials for the account marching the criteria, the submitted information couldn't be validated"
            )
          );
        }
      }
    );
    return result;
  }

  generateRandomPassword(): string {
    let passwordLength = MIN_PASSWORD_LENGTH;
    return randomString(passwordLength);
  }
}
