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
const DomainError_1 = require("../common/DomainError");
const IdentityManagement_1 = require("./IdentityManagement");
const Security_1 = require("./Security");
const util_1 = require("../util");
const business_1 = require("../business");
const common_1 = require("../common");
const firestore_1 = require("@google-cloud/firestore");
class AccountManager extends common_1.DataProvider {
    constructor(context, dataSource) {
        super(dataSource);
        this.context = context;
    }
    getDefaultRoleForAccount(userKind) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = this.context.performTask("Read", AccountManager.COMPONENT, (c) => __awaiter(this, void 0, void 0, function* () {
                let rolesCollection = this.dataSource.collection("Roles");
                let roleDocumentsQuery = rolesCollection.where("name", "==", `DEFAULT_${userKind}`);
                let { docs, empty } = yield roleDocumentsQuery.get();
                if (empty) {
                    return Promise.reject(new DomainError_1.DomainError("NOT_FOUND", `There is no default role defined to account of type ${userKind}`, AccountManager.COMPONENT, "Please validate with the platform administrator", undefined, "MEDIUM", `When retrieving default role for account of type ${userKind}, there were no matching records`));
                }
                let [snapshot] = [...docs];
                let role = Object.assign({ id: snapshot.id }, snapshot.data());
                return role;
            }));
            return result;
        });
    }
    validateActivation(actionCode, continueUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            let { operation, data } = yield firebase.auth().checkActionCode(actionCode);
            if (operation !== "VERIFY_EMAIL") {
                return Promise.reject(new DomainError_1.DomainError("INVALID_ACTION", "Activation Action is not a valid one", AccountManager.COMPONENT, "Please validate the submitted information and try again", undefined, "LOW", "When validating activation for activation intent, the submitted action was invalid)"));
            }
            let { email, fromEmail } = data;
            let result = yield this.context.performTask("Write", AccountManager.COMPONENT, (context) => __awaiter(this, void 0, void 0, function* () {
                let activatingUser;
                let usersCollection = this.dataSource.collection("Users");
                let { empty, docs } = yield usersCollection.get();
                if (empty) {
                    return Promise.reject(new DomainError_1.DomainError("NOT_FOUND", `There were no matches for the submitted credentials`, AccountManager.COMPONENT, "Please validate the submitted information and try again", undefined, "LOW", "When validating account's activation there were not records matching credentials for the linked email"));
                }
                let match = docs.map((snapshot) => (Object.assign({}, snapshot.data(), { id: snapshot.id }))).find(({ credentials }) => credentials.some(c => c.issuer == "Local" && c.id == email));
                if (!match) {
                    return Promise.reject(new DomainError_1.DomainError("NOT_FOUND", `There were no matches for the submitted credentials`, AccountManager.COMPONENT, "Please validate the submitted information and try again", undefined, "LOW", "When validating account's activation there were not records matching credentials for the linked email"));
                }
                activatingUser = match;
                let credential = activatingUser.credentials.find(c => c.issuer == "Local" && c.id == email);
                let credentialIndex = activatingUser.credentials.indexOf(credential);
                activatingUser.credentials[credentialIndex].validatedOn = new Date(Date.now());
                activatingUser.validatedOn = new Date(Date.now());
                let action = {
                    actor: context.getActorInformation(),
                    date: new Date(Date.now()),
                    description: "Activate Account"
                };
                activatingUser.actions.push(action);
                yield usersCollection.doc(activatingUser.id).update(activatingUser);
                return true;
            }));
            return true;
        });
    }
    authenticateAccount(credentialID, password, token) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this.context.performTask("Read", AccountManager.COMPONENT, (c) => __awaiter(this, void 0, void 0, function* () {
                let authenticatedUser;
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
                let { docs, empty } = yield userCollection.get();
                if (empty) {
                    return Promise.reject(new DomainError_1.DomainError("NOT_FOUND", `There were no matches for the submitted credentials`, AccountManager.COMPONENT, "Please validate the submitted information or if there is a pending transaction on your account/credentials and try again", undefined, "LOW", "When authenticating the account for the submitted credentials there were not records matching either the credential ID, password or token and in a valid state (Successfully Validated)"));
                }
                let match = docs.map((snapshot) => (Object.assign({}, snapshot.data(), { id: snapshot.id }))).find(({ credentials }) => {
                    return credentials.some(c => c.id == credentialID && password ? c.issuer == "Local" && c.password == password : token ? c.token == token : false);
                });
                if (!match) {
                    return Promise.reject(new DomainError_1.DomainError("NOT_FOUND", `There were no matches for the submitted credentials`, AccountManager.COMPONENT, "Please validate the submitted information or if there is a pending transaction on your account/credentials and try again", undefined, "LOW", "When authenticating the account for the submitted credentials there were not records matching either the credential ID, password or token and in a valid state (Successfully Validated)"));
                }
                //let [{ id, data }] = [...docs];
                authenticatedUser = match;
                if (!authenticatedUser.validatedOn) {
                    return Promise.reject(new DomainError_1.DomainError("INVALID_ACCOUNT", `Account hasn't been validated`, AccountManager.COMPONENT, "Please complete the registration process by checking your e-mails for an e-mail from [@vibez.io] with instructions.", undefined, "LOW", "When authenticating the account for the submitted credentials the account hasn't been validated"));
                }
                let { issuedOn, expiration, validatedOn } = authenticatedUser.credentials.find(c => c.id == credentialID &&
                    (password
                        ? c.password == password
                        : false || token ? c.token == token : false));
                if (!validatedOn) {
                    return Promise.reject(new DomainError_1.DomainError("INVALID_CREDENTIAL", `Credentials haven't been validated`, AccountManager.COMPONENT, "Please complete the registration process by checking your e-mails for an e-mail from [@vibez.io] with instructions.", undefined, "LOW", "When authenticating the account's credential haven't been validated"));
                }
                let expiringAt = issuedOn;
                expiringAt.setSeconds(expiringAt.getSeconds() + expiration);
                if (expiringAt < new Date(Date.now())) {
                    return Promise.reject(new DomainError_1.DomainError("INVALID_CREDENTIAL", `Expired credentials`, AccountManager.COMPONENT, "Please renew your credentials to continue", undefined, "LOW", "When authenticating the account for the submitted credentials the retrieved credentials were expired"));
                }
                return authenticatedUser;
            }));
            return result;
        });
    }
    createAccount(identity, credential, userKind) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!credential.password) {
                return Promise.reject(new DomainError_1.DomainError("INVALID_CREDENTIAL", `Password required`, AccountManager.COMPONENT, "Please validate your information and try again", undefined, "LOW", "When signing up the submitted account's information. There provided credentials had missing required information"));
            }
            credential.issuer = "Local";
            credential.issuedOn = new Date(Date.now());
            credential.expiration = Security_1.DEFAULT_EXPIRATION_SECONDS;
            let identityManager = new IdentityManagement_1.IdentityManager(this.context, this.dataSource);
            let contactProvider = new business_1.ContactProvider(this.context, this.dataSource);
            let fetchedIdentity = yield identityManager.getIdentity(identity);
            let contact = yield contactProvider.getContact(fetchedIdentity.contact);
            let role = yield this.getDefaultRoleForAccount(userKind);
            let result = yield this.context.performTask("Write", AccountManager.COMPONENT, (c) => __awaiter(this, void 0, void 0, function* () {
                let action = {
                    actor: c.getActorInformation(),
                    date: new Date(Date.now()),
                    description: `Register account for identity with id [${identity.id}]`
                };
                let account = {
                    id: "",
                    identity,
                    credentials: [credential],
                    kind: userKind,
                    role,
                    actions: [action],
                    collection: "Users"
                };
                let usersCollection = this.dataSource.collection("Users");
                let userDocument = yield usersCollection.add(account);
                let { id } = yield userDocument.get();
                account.id = id;
                let user = yield firebase
                    .auth()
                    .createUserWithEmailAndPassword(contact.email, credential.password);
                yield user.sendEmailVerification();
                return account;
            }));
            return result;
        });
    }
    activateAccount(user, userKind) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this.context.performTask("Write", AccountManager.COMPONENT, (c) => __awaiter(this, void 0, void 0, function* () {
                let action = {
                    actor: c.getActorInformation(),
                    date: new Date(Date.now()),
                    description: `Account with id [${user.id}] has been activated successfully`
                };
                let updatedAccount;
                let userCollection = this.dataSource.collection("Users");
                let userDocument = userCollection.doc(user.id);
                let snapshot = yield userDocument.get();
                if (!snapshot.exists) {
                    return Promise.reject(new DomainError_1.DomainError("NOT_FOUND", "User cannot be activated", AccountManager.COMPONENT, "Please validate the submitted information", undefined, "LOW", "When activating account, the submitted account information has no matches"));
                }
                updatedAccount = Object.assign({ id: snapshot.id }, snapshot.data());
                if (userKind != updatedAccount.kind) {
                    return Promise.reject(new DomainError_1.DomainError("INVALID_ACCOUNT", "User cannot be activated", AccountManager.COMPONENT, "Please validate the submitted information", undefined, "LOW", "When activating account, the submitted account information doesn't match available records"));
                }
                updatedAccount.actions.push(action);
                updatedAccount.validatedOn = new Date(Date.now());
                let { actions, validatedOn } = updatedAccount;
                yield userDocument.update({ actions, validatedOn });
                return updatedAccount;
            }));
            return result;
        });
    }
    assignAccountRole(user, role, userKind) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this.context.performTask("Write", AccountManager.COMPONENT, (c) => __awaiter(this, void 0, void 0, function* () {
                let action = {
                    actor: c.getActorInformation(),
                    date: new Date(Date.now()),
                    description: `The role of the account with id [${user.id}] has been changed to [${role.id}]`
                };
                let updatedAccount;
                let rolesCollection = this.dataSource.collection("Roles");
                let roleDocument = rolesCollection.doc(role.id);
                {
                    let { id, exists, data } = yield roleDocument.get();
                    if (!exists) {
                        return Promise.reject(new DomainError_1.DomainError("NOT_FOUND", "New role couldn't be assigned", AccountManager.COMPONENT, "Please validate the submitted information", undefined, "LOW", "When assigning account's role, the submitted role information has no matches"));
                    }
                }
                let userCollection = this.dataSource.collection("Users");
                let userDocument = userCollection.doc(user.id);
                {
                    let snapshot = yield userDocument.get();
                    updatedAccount = Object.assign({ id: snapshot.id }, snapshot.data());
                    if (!snapshot.exists) {
                        return Promise.reject(new DomainError_1.DomainError("NOT_FOUND", "New role couldn't be assigned", AccountManager.COMPONENT, "Please validate the submitted information", undefined, "LOW", "When assigning account's role, the submitted account information has no matches"));
                    }
                    let { kind, actions } = updatedAccount;
                    if (userKind != kind) {
                        return Promise.reject(new DomainError_1.DomainError("INVALID_ACCOUNT", "User cannot be activated", AccountManager.COMPONENT, "Please validate the submitted information", undefined, "LOW", "When assigning account's role, the submitted account information doesn't match available records"));
                    }
                    actions.push(action);
                    updatedAccount.role = role;
                    yield userDocument.update(updatedAccount);
                }
                return updatedAccount;
            }));
            return result;
        });
    }
    updateCredential(user, credential, issuer, data, userKind) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this.context.performTask("Write", AccountManager.COMPONENT, (c) => __awaiter(this, void 0, void 0, function* () {
                let action = {
                    actor: c.getActorInformation(),
                    date: new Date(Date.now()),
                    description: `The credentials of the account with id [${user.id}] and provider [${issuer}] has been successfully updated`
                };
                let updatedAccount;
                let userCollection = this.dataSource.collection("Users");
                let userDocument = userCollection.doc(user.id);
                {
                    let snapshot = yield userDocument.get();
                    if (!snapshot.exists) {
                        return Promise.reject(new DomainError_1.DomainError("NOT_FOUND", "Cannot update credentials", AccountManager.COMPONENT, "Please validate the submitted information", undefined, "LOW", "When updating account's credentials, the submitted account information has no matches"));
                    }
                    updatedAccount = Object.assign({ id: snapshot.id }, snapshot.data());
                    if (userKind != updatedAccount.kind) {
                        return Promise.reject(new DomainError_1.DomainError("INVALID_ACCOUNT", "User cannot be activated", AccountManager.COMPONENT, "Please validate the submitted information", undefined, "LOW", "When activating account, the submitted account information doesn't match available records"));
                    }
                }
                if (!updatedAccount.credentials) {
                    return Promise.reject(new DomainError_1.DomainError("UNASSIGNED_CREDENTIALS", `Account has no credentials registered`, AccountManager.COMPONENT, "Please validate the account information", undefined, "LOW", "When fetching account credentials for updating credentials, there were no credentials assigned to the corresponding account"));
                }
                let updatedCredentialIndex = updatedAccount.credentials.findIndex(c => c.id == credential.id && c.issuer == issuer);
                if (updatedCredentialIndex < 0) {
                    return Promise.reject(new DomainError_1.DomainError("CREDENTIAL_NOT_FOUND", `Account has no credentials matching the submitted criteria`, AccountManager.COMPONENT, "Please validate the submitted information", undefined, "LOW", "When fetching account credentials for updating credentials, there were no credentials matching the submitted criteria"));
                }
                updatedAccount.credentials[updatedCredentialIndex].validatedOn = new Date(Date.now());
                updatedAccount.credentials[updatedCredentialIndex].issuedOn = new Date(Date.now());
                updatedAccount.credentials[updatedCredentialIndex].token = data.token;
                updatedAccount.credentials[updatedCredentialIndex].password =
                    data.password;
                updatedAccount.actions.push(action);
                let { credentials, actions } = updatedAccount;
                yield userDocument.update({ credentials, actions });
                return updatedAccount;
            }));
            return result;
        });
    }
    resetCredential(identity, request) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this.context.performTask("Write", AccountManager.COMPONENT, (c) => __awaiter(this, void 0, void 0, function* () {
                let usersCollection = this.dataSource.collection("Users");
                let userDocumentsQuery = usersCollection.where("identity.id", "==", identity.id);
                let { empty, docs } = yield userDocumentsQuery.get();
                if (empty) {
                    return Promise.reject(new DomainError_1.DomainError("ACCOUNT_NOT_FOUND", `The account for the submitted identity wasn't found`, AccountManager.COMPONENT, "Please validate the identity information", undefined, "LOW", "When fetching account information for recovering credentials, there were no accounts matching the submitted criteria"));
                }
                let [snapshot] = [...docs];
                if (!snapshot.exists) {
                    return Promise.reject(new DomainError_1.DomainError("ACCOUNT_NOT_FOUND", `The account for the submitted identity wasn't found`, AccountManager.COMPONENT, "Please validate the identity information", undefined, "LOW", "When fetching account information for recovering credentials, there were no accounts matching the submitted criteria"));
                }
                let updatedAccount;
                updatedAccount = Object.assign({ id: snapshot.id }, snapshot.data());
                if (!updatedAccount.credentials) {
                    return Promise.reject(new DomainError_1.DomainError("UNASSIGNED_CREDENTIALS", `Account has no credentials registered`, AccountManager.COMPONENT, "Please validate the account information", undefined, "LOW", "When fetching account credentials for updating credentials, there were no credentials assigned to the corresponding account"));
                }
                let updatedCredentialIndex = updatedAccount.credentials.findIndex(c => c.issuer == "Local");
                if (updatedCredentialIndex < 0) {
                    return Promise.reject(new DomainError_1.DomainError("CREDENTIAL_NOT_FOUND", `Account has no credentials matching the submitted criteria`, AccountManager.COMPONENT, "Please validate the submitted information", undefined, "LOW", "When fetching account credentials for updating credentials, there were no credentials matching the submitted criteria"));
                }
                let yesterday = new Date(Date.now());
                yesterday.setDate(yesterday.getDate() - 1);
                if (!request) {
                    let resetRequest = {
                        date: new Date(Date.now()),
                        ipAddress: c.clientAddress,
                        id: util_1.randomString(12)
                    };
                    let action = {
                        actor: c.getActorInformation(),
                        date: new Date(Date.now()),
                        description: `Scheduled request [${resetRequest.id}] to reset password of credentials with id [${updatedAccount.credentials[updatedCredentialIndex].id}]`
                    };
                    updatedAccount.resetRequest = resetRequest;
                    updatedAccount.actions.push(action);
                    return updatedAccount;
                }
                else if (request &&
                    updatedAccount.resetRequest &&
                    updatedAccount.resetRequest.id == request.id &&
                    updatedAccount.resetRequest.date > yesterday) {
                    let action = {
                        actor: c.getActorInformation(),
                        date: new Date(Date.now()),
                        description: `Reset password of credentials with id [${updatedAccount.credentials[updatedCredentialIndex].id}`
                    };
                    updatedAccount.credentials[updatedCredentialIndex].issuedOn = new Date(Date.now());
                    updatedAccount.credentials[updatedCredentialIndex].password = this.generateRandomPassword();
                    updatedAccount.actions.push(action);
                    let { credentials, actions, resetRequest } = updatedAccount;
                    yield usersCollection.doc(snapshot.id).update({ credentials, actions, resetRequest: firestore_1.FieldValue.delete() });
                    return updatedAccount;
                }
                else {
                    return Promise.reject(new DomainError_1.DomainError("INVALID_OPERATION", `The account's credentials reset request is invalid`, AccountManager.COMPONENT, "Please validate the submitted information", undefined, "LOW", "When proceeding to reset credentials for the account marching the criteria, the submitted information couldn't be validated"));
                }
            }));
            return result;
        });
    }
    generateRandomPassword() {
        let passwordLength = Security_1.MIN_PASSWORD_LENGTH;
        return util_1.randomString(passwordLength);
    }
}
AccountManager.COMPONENT = "ACCOUNT_MANAGER";
exports.AccountManager = AccountManager;
//# sourceMappingURL=AccountManagement.js.map