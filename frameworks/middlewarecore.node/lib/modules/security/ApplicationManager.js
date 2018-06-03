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
const constants_1 = require("../constants");
const SecurityContext_1 = require("./SecurityContext");
const util_1 = require("../util");
const Security_1 = require("./Security");
const ApplicationContext_1 = require("./ApplicationContext");
const ApplicationManagerLog_1 = require("./ApplicationManagerLog");
const common_1 = require("../common");
const communications_1 = require("../communications");
const business_1 = require("../business");
const NMSPTransport = require("nodemailer-sparkpost-transport");
const nodemailer = require("nodemailer");
const { MAIL } = process.env;
const VIBEZ_CORE_COMPONENT = {
    name: "APPLICATION_MANAGER",
    description: "Vibez Core",
    enabled: true,
    shortDescription: "Application Management Infrastructure Component",
    version: { major: 1, minor: 0, patch: 0 },
    actions: [
        {
            actor: "Vibez",
            date: new Date(Date.now()),
            description: "Register Application Manager Component"
        }
    ],
    kind: "RESOURCE",
    collection: "Components",
    id: ""
};
const VIBEZ_CONTACT = {
    email: "sergio@vibez.io",
    mobile: "+1(707)953-2515",
    name: "VIBEZ",
    actions: [
        {
            actor: "Vibez",
            date: new Date(Date.now()),
            description: "Register Application Manager Component's Contact Information"
        }
    ],
    collection: "Contacts",
    id: "",
    surname: "Transforming the music industry"
};
const VIBEZ_ROLE = {
    name: "AMR",
    description: "Application Manager",
    shortDescription: "All Access",
    profile: {
        name: "Application Manager Profile",
        description: "All Access Profile",
        permits: [{}]
    },
    actions: [
        {
            actor: "Vibez",
            date: new Date(Date.now()),
            description: "Register Application Manager Component's Default Role"
        }
    ],
    collection: "Roles",
    id: ""
};
class ApplicationManager extends common_1.DataProvider {
    constructor(context, dataSource) {
        super(dataSource);
        this.context = context;
    }
    static setDefaultDataSource(dataSource) {
        this.dataSource = dataSource;
    }
    // STATIC FUNCTIONALITIES
    /**
     * Creates the Vibez Core's component, accountable Vibez' contact, AMP role, component's identity,
     * and Component's Account and credential required for the platform initialization.
     * @private
     * @static
     * @returns {Promise<User<"COMPONENT">>}
     * @memberof ApplicationManager
     */
    static registerAccount() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let componentsCollection = this.dataSource.collection("Components");
                let contactCollection = this.dataSource.collection("Contacts");
                let roleCollection = this.dataSource.collection("Roles");
                // Mail configuration pre-requisites.
                let { secret, from } = JSON.parse(MAIL);
                if (!secret || !from) {
                    return Promise.reject(new common_1.PlatformError("INITIALIZATION_ERROR", "Error when validating communications pre-requisites", ApplicationManager.COMPONENT, "Pending configuration", undefined, "MEDIUM", `There was an error when validating initialization pre-requisites. Missing mail settings for this platform's instance`));
                }
                // let transportSettings: MailTransportConfiguration = {
                //   secret
                // };
                let transportConfiguration = NMSPTransport({ sparkPostApiKey: secret });
                let transport = nodemailer.createTransport(transportConfiguration);
                // Register Component
                VIBEZ_CORE_COMPONENT.name = ApplicationManager.COMPONENT;
                let componentDocument = yield componentsCollection.add(VIBEZ_CORE_COMPONENT);
                {
                    let { id } = yield componentDocument.get();
                    VIBEZ_CORE_COMPONENT.id = id;
                }
                // Register Contact Information
                let contactDocument = yield contactCollection.add(VIBEZ_CONTACT);
                {
                    let { id } = yield contactDocument.get();
                    VIBEZ_CONTACT.id = id;
                }
                // Register Role
                let roleAction = {
                    actor: VIBEZ_CONTACT.name,
                    date: new Date(Date.now()),
                    description: `Register application management role`
                };
                let authorization = {
                    canDelete: true,
                    canRead: true,
                    canWrite: true
                };
                let permit = {
                    authorization: authorization,
                    component: { id: VIBEZ_CORE_COMPONENT.id, collection: "Components" },
                    issuedOn: new Date(Date.now()),
                    validity: constants_1.SECONDS_PER_YEAR
                };
                let profile = {
                    description: "All access to Vibez Platform",
                    shortDescription: "All access",
                    name: "AMP",
                    permits: [permit],
                    actions: [roleAction]
                };
                VIBEZ_ROLE.profile = profile;
                let roleDocument = yield roleCollection.add(VIBEZ_ROLE);
                {
                    let { id } = yield roleDocument.get();
                    VIBEZ_ROLE.id = id;
                }
                // Register Account
                // Create identity
                let identityAction = {
                    actor: VIBEZ_CONTACT.name,
                    date: new Date(Date.now()),
                    description: `Register component identity for contact with id [${VIBEZ_CONTACT.id}]`
                };
                let identity = {
                    id: "",
                    contact: { id: VIBEZ_CONTACT.id, collection: "Contacts" },
                    actions: [identityAction],
                    collection: "Identities"
                };
                let identityCollection = this.dataSource.collection("Identities");
                let identityDocument = yield identityCollection.add(identity);
                let { id } = yield identityDocument.get();
                // Create credential
                let credential = {
                    validatedOn: new Date(Date.now()),
                    issuedOn: new Date(Date.now()),
                    issuer: "Local",
                    id: VIBEZ_CORE_COMPONENT.id,
                    expiration: Security_1.DEFAULT_EXPIRATION_SECONDS,
                    password: util_1.randomString(12)
                };
                let accountAction = {
                    actor: VIBEZ_CORE_COMPONENT.name,
                    date: new Date(Date.now()),
                    description: `Register app account for identity with id [${identity.id}]`
                };
                let appManagerAccount = {
                    identity: { id, collection: "Identities" },
                    credentials: [credential],
                    role: { id: VIBEZ_ROLE.id, collection: "Roles" },
                    actions: [accountAction],
                    kind: "COMPONENT",
                    collection: "Users",
                    id: "",
                    validatedOn: new Date(Date.now())
                };
                let accountCollection = yield this.dataSource.collection("Users");
                let accountDocument = yield accountCollection.add(appManagerAccount);
                {
                    let { id } = yield accountDocument.get();
                    appManagerAccount.id = id;
                }
                let result = yield new Promise((resolve, reject) => {
                    transport.sendMail({
                        from,
                        to: VIBEZ_CONTACT.email,
                        subject: "Platform Registration",
                        text: `VIBEZ\n
            Platform Registration\n
            Successful Platform Registration:\n
            -${credential.id}:${credential.password}\n
            Please proceed with the configuration`,
                        html: `
              <html>
                <head></head>
                <body>
                  <h1>VIBEZ</h1>
                  <h2>Platform Registration</h2>
                  <p>Successful Platform Registration:
                    <ul>
                      <li><span><b>${credential.id}</b>:${credential.password}</span></li>
                    </ul>
                  </p>
                  <p>Please proceed with the configuration.
                  </p>
                </body>
              </html>
            `
                    }, (err, info) => {
                        if (err) {
                            return reject(new common_1.PlatformError("INITIALIZATION_ERROR", "Error when sending platform activation e-mail", ApplicationManager.COMPONENT, err.message, err.stack, "HIGH", "It wasn't possible to send the activation e-mail to the platform's accountable."));
                        }
                        else {
                            return resolve(true);
                        }
                    });
                });
                return appManagerAccount;
            }
            catch (error) {
                return Promise.reject(new common_1.PlatformError("INITIALIZATION_ERROR", "Application Manager Initialization Error", ApplicationManager.COMPONENT, error.message, error.stack, "HIGH", "When Initializing Application Manager, there was an unexpected error"));
            }
        });
    }
    /**
     * Creates Children Components and link them with its main component.
     *
     * @private
     * @static
     * @param {Component<"RESOURCE">} parentComponent Vibez' main component
     * @param {ApplicationContext<"COMPONENT">} context Transaction's Context
     * @returns {Promise<Array<Component<'RESOURCE'>>>}
     * @memberof ApplicationManager
     */
    static registerCoreComponentsWithParent(parentComponent, context) {
        return __awaiter(this, void 0, void 0, function* () {
            let document = this.dataSource
                .collection("Components")
                .doc(parentComponent.id);
            let componentDocument = yield document.get();
            if (!componentDocument.exists) {
                return Promise.reject(new common_1.DomainError("NOT_FOUND", "Invalid Component", ApplicationManager.COMPONENT, "Please check the submitted information", undefined, "LOW", "When registering Vibez Core components, the parent component wasn't found"));
            }
            let identityManager = yield ApplicationManager.registerChildComponent(context, parentComponent, "IDENTITY_MANAGER", "Identities Management Module for identities' registration and update", "Vibez's Account Manager");
            let accountManager = yield ApplicationManager.registerChildComponent(context, parentComponent, "ACCOUNT_MANAGER", "Account Management Module for account registration, update and recovery", "Vibez's Account Manager");
            let communicationsManager = yield ApplicationManager.registerChildComponent(context, parentComponent, "COMMUNICATIONS_MANAGER", "Communication Module for communication intents processing", "Vibez's Communication Manager");
            let componentsManager = yield ApplicationManager.registerChildComponent(context, parentComponent, "COMPONENT_MANAGER", "Components Administration Module for managing Vibez's Components", "Vibez's Components Manager");
            let registeredComponents = [
                identityManager,
                accountManager,
                communicationsManager,
                componentsManager
            ];
            return registeredComponents;
        });
    }
    /**
     * * Creates Vibez' Core Children Components and link them to Vibez' main component.
     *
     * @private
     * @static
     * @param {ApplicationContext<"COMPONENT">} context
     * @param {Component<"RESOURCE">} parentComponent
     * @param {string} componentName
     * @param {string} componentDescription
     * @param {string} componentShortDescription
     * @returns
     * @memberof ApplicationManager
     */
    static registerChildComponent(context, parentComponent, componentName, componentDescription, componentShortDescription) {
        return __awaiter(this, void 0, void 0, function* () {
            let componentsCollection = this.dataSource.collection("Components");
            let componentDocument = componentsCollection.doc(parentComponent.id);
            let component;
            {
                let snapshot = yield componentDocument.get();
                component = Object.assign({ id: snapshot.id }, snapshot.data());
                if (!snapshot.exists) {
                    return Promise.reject(new common_1.DomainError("NOT_FOUND", "Submitted parent component could't be found", ApplicationManager.COMPONENT, "Please validate the submitted information", undefined, "LOW", `When registering child component [${componentName}] to component [${parentComponent.id}], submitted parent component has not matches`));
                }
            }
            let childComponentAction = {
                actor: context.appAddress,
                date: new Date(Date.now()),
                description: `Register parent component [${parentComponent.id}]`
            };
            let childComponent = {
                enabled: true,
                description: componentDescription,
                shortDescription: componentShortDescription,
                name: componentName,
                parent: { id: parentComponent.id, collection: "Components" },
                version: { major: 1, minor: 0, patch: 0 },
                actions: [childComponentAction],
                id: "",
                kind: "RESOURCE",
                collection: "Components"
            };
            {
                let { id } = yield componentsCollection.add(childComponent);
                childComponent.id = id;
            }
            let { children, actions } = component;
            if (!children) {
                children = new Array();
            }
            children.push({
                id: childComponent.id,
                collection: childComponent.collection
            });
            let parentComponentAction = {
                actor: context.appAddress,
                date: new Date(Date.now()),
                description: `Register child component [${childComponent.id}}]`
            };
            actions.push(parentComponentAction);
            yield componentDocument.update({ children, actions });
            return childComponent;
        });
    }
    /**
     * Add permits to role's profile to access the submitted component
     *
     * @private
     * @static
     * @param {ApplicationContext<"COMPONENT">} context
     * @param {Indexable} role
     * @param {Indexable} component
     * @returns
     * @memberof ApplicationManager
     */
    static allowAccess(context, role, component) {
        return __awaiter(this, void 0, void 0, function* () {
            let roleCollection = this.dataSource.collection("Roles");
            let snapshot = yield roleCollection.doc(role.id).get();
            if (!snapshot.exists) {
                return Promise.reject(new common_1.DomainError("NOT_FOUND", "There were no matches for the submitted criteria", ApplicationManager.COMPONENT, "Please validate the submitted information", undefined, "LOW", "When fetching the role's information for updating profile, there were no matches for the submitted criteria"));
            }
            let { permits, actions } = snapshot.data();
            permits = permits ? permits : new Array();
            actions = actions ? actions : new Array();
            let action = {
                actor: context.appAddress,
                date: new Date(Date.now()),
                description: `Set access to component [${component.id}]`
            };
            let authorization = {
                canDelete: true,
                canRead: true,
                canWrite: true
            };
            let permit = {
                authorization: authorization,
                component: { id: component.id, collection: "Components" },
                issuedOn: new Date(Date.now()),
                validity: constants_1.SECONDS_PER_YEAR
            };
            permits.push(permit);
            actions.push(action);
            yield roleCollection.doc(role.id).update({ permits, actions });
            return true;
        });
    }
    /**
     * Executes tasks for core registration
     *
     * @private
     * @static
     * @returns {Promise<boolean>}
     * @memberof ApplicationManager
     */
    static coreRegistration() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let account = yield ApplicationManager.registerAccount();
                let credential = account.credentials.find(c => c.issuer == "Local");
                let component = yield ApplicationManager.getComponentIndexByName(VIBEZ_CORE_COMPONENT.name);
                let logStore = new ApplicationManagerLog_1.ApplicationManagerLog(this.dataSource);
                let applicationContext = new ApplicationContext_1.ApplicationContext(credential.id, credential.password, "local", "1.0.0", logStore);
                let result = yield applicationContext.performTask("Write", "APPLICATION_MANAGER", (context) => __awaiter(this, void 0, void 0, function* () {
                    let registeredComponents = yield ApplicationManager.registerCoreComponentsWithParent(component, context);
                    yield Promise.all(registeredComponents.map((component) => __awaiter(this, void 0, void 0, function* () {
                        return yield ApplicationManager.allowAccess(context, account.role, component);
                    })));
                    return true;
                }));
                return true;
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    /**
     * Executes Platform initialization when required
     *
     * @static
     * @returns
     * @memberof ApplicationManager
     */
    static init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let component = yield ApplicationManager.getComponentIndexByName(VIBEZ_CORE_COMPONENT.name);
            }
            catch (error) {
                if (error instanceof common_1.DomainError) {
                    if (error.name == "NOT_FOUND") {
                        try {
                            let result = yield ApplicationManager.coreRegistration();
                            if (!result) {
                                return Promise.reject(new common_1.PlatformError("UNKNOWN_ERROR", "Error at core registration process", ApplicationManager.COMPONENT, "Please validate with the administrator", undefined, "HIGH", "When performing core registration, there was an error in the process"));
                            }
                            return;
                        }
                        catch (error) {
                            return Promise.reject(error);
                        }
                    }
                }
                else {
                    return Promise.reject(new common_1.PlatformError("UNKNOWN_ERROR", "Error at core registration process", ApplicationManager.COMPONENT, "Please validate with the administrator", undefined, "HIGH", "When performing core registration, there was an error in the process"));
                }
            }
        });
    }
    /**
     * Validates provided application's credentials and version and retrieves application account information
     *
     * @static
     * @param {string} appID
     * @param {string} appKey
     * @param {{ major: number; minor: number; patch: number }} appVersion
     * @returns {Promise<User<"COMPONENT">>}
     * @memberof ApplicationManager
     */
    static authenticateApp(appID, appKey, appVersion) {
        return __awaiter(this, void 0, void 0, function* () {
            let componentsCollection = this.dataSource.collection("Components");
            let componentDocument = componentsCollection.doc(appID);
            let component;
            {
                let snapshot = yield componentDocument.get();
                if (!snapshot.exists) {
                    return Promise.reject(new common_1.DomainError("NOT_FOUND", "There were no matches for the submitted criteria", ApplicationManager.COMPONENT, "Please validate the submitted information", undefined, "LOW", "When fetching the component's information, there were no matches for the submitted ID and Version"));
                }
                component = Object.assign({}, snapshot.data(), { id: snapshot.id });
            }
            let authenticatedApp;
            let usersCollectionRef = this.dataSource.collection("Users");
            let usersQueryObject = usersCollectionRef.where("kind", "==", "COMPONENT");
            // .where("credentials.id", "==", appID);
            // .where("credentials.password", "==", appKey)
            // .where("credentials.issuer", "==", "Local")
            {
                let { docs, empty } = yield usersQueryObject.get();
                if (empty) {
                    return Promise.reject(new common_1.DomainError("NOT_FOUND", "There were no matches for the submitted criteria", ApplicationManager.COMPONENT, "Please validate the submitted information", undefined, "LOW", "When fetching the app's account information, there were no matches for the submitted criteria or the credential is invalid"));
                }
                let match = docs
                    .map(d => {
                    return Object.assign({}, d.data(), { id: d.id });
                })
                    .find(({ credentials }) => credentials.some(c => c.id == appID && c.password == appKey && c.issuer == "Local"));
                if (!match) {
                    return Promise.reject(new common_1.DomainError("NOT_FOUND", "There were no matches for the submitted criteria", ApplicationManager.COMPONENT, "Please validate the submitted information", undefined, "LOW", "When fetching the app's account information, there were no matches for the submitted criteria or the credential is invalid"));
                }
                authenticatedApp = match;
            }
            if (!authenticatedApp.validatedOn) {
                return Promise.reject(new common_1.DomainError("INVALID_ACCOUNT", "The application's account hasn't been validated", ApplicationManager.COMPONENT, "Please check your e-mail for an e-mail from [vibez.io] with instructions", undefined, "LOW", "When fetching the app's account information, there were no matches for the submitted criteria or the credential is invalid"));
            }
            let credential = authenticatedApp.credentials.find(c => c.issuer == "Local" && c.id == appID && c.password == appKey);
            let expiringAt = new Date(credential.issuedOn);
            expiringAt.setSeconds(expiringAt.getSeconds() + credential.expiration);
            if (expiringAt < new Date(Date.now())) {
                return Promise.reject(new common_1.DomainError("INVALID_CREDENTIAL", "Expired Credential", ApplicationManager.COMPONENT, "Please renew the credentials", undefined, "MEDIUM", "When fetching the app's account information, the credentials of the app were expired"));
            }
            let accountInfo = {
                identity: authenticatedApp.identity,
                role: authenticatedApp.role,
                credentials: [{ id: credential.id }],
                validatedOn: authenticatedApp.validatedOn
            };
            return accountInfo;
        });
    }
    /**
     * Retrieves role information and profile's access configuration
     *
     * @static
     * @param {Indexable} role
     * @returns {Promise<Profile>}
     * @memberof ApplicationManager
     */
    static getRoleProfile(role) {
        return __awaiter(this, void 0, void 0, function* () {
            let roleCollection = this.dataSource.collection("Roles");
            let roleDocument = roleCollection.doc(role.id);
            let snapshot = yield roleDocument.get();
            if (!snapshot.exists) {
                return Promise.reject(new common_1.DomainError("NOT_FOUND", "There were no matches for the submitted criteria", ApplicationManager.COMPONENT, "Please validate the submitted information", undefined, "LOW", "When fetching the role's information, there were no matches for the submitted ID"));
            }
            let { profile } = snapshot.data();
            if (!profile) {
                return Promise.reject(new common_1.DomainError("NO_DATA", "There role has no profile information", ApplicationManager.COMPONENT, "Please validate role configuration with the administrator", undefined, "MEDIUM", "When fetching the role's information, the retrieved ID had no profile information"));
            }
            return profile;
        });
    }
    /**
     * Retrieves Component's identifier by name
     *
     * @static
     * @param {string} name
     * @returns {Promise<Indexable>}
     * @memberof ApplicationManager
     */
    static getComponentIndexByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            let collectionRef = this.dataSource.collection("Components");
            let queryObject = collectionRef.where("name", "==", name);
            let { empty, docs } = yield queryObject.get();
            if (empty) {
                return Promise.reject(new common_1.DomainError("NOT_FOUND", "There were no matches for the submitted criteria", ApplicationManager.COMPONENT, "Please validate the submitted information", undefined, "LOW", "When fetching the component's, there were no matches for the submitted ID"));
            }
            let { id } = docs
                .map(snapshot => (Object.assign({}, snapshot.data(), { id: snapshot.id })))
                .find(d => true);
            let indexable = { id };
            return indexable;
        });
    }
    // INSTANCE FUNCTIONALITIES
    /**
     * Retrieves Default Role for a given account type
     *
     * @private
     * @template T
     * @returns {Promise<IndexableCollection<"Roles">>}
     * @memberof ApplicationManager
     */
    getDefaultRoleForAccount(userKind) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this.context.performTask("Read", ApplicationManager.COMPONENT, (c) => __awaiter(this, void 0, void 0, function* () {
                let collectionRef = this.dataSource.collection("Roles");
                let queryObject = collectionRef.where("name", "==", `DEFAULT_${userKind}`);
                let { empty, docs } = yield queryObject.get();
                if (empty) {
                    return Promise.reject(new common_1.DomainError("NOT_FOUND", "There were no matches for the submitted criteria", ApplicationManager.COMPONENT, `Please validate the [DEFAULT_${userKind}] role configuration with the administrator`, undefined, "LOW", "When fetching the role's information, there were no matches for the submitted ID"));
                }
                let role = docs
                    .map(snapshot => (Object.assign({}, snapshot.data(), { id: snapshot.id })))
                    .find(d => true);
                return role;
            }));
            return result;
        });
    }
    registerComponent(component) {
        return __awaiter(this, void 0, void 0, function* () {
            let appUser = yield ApplicationManager.authenticateApp(this.context.appID, this.context.appKey, this.context.appVersion);
            let securityContext = new SecurityContext_1.SecurityContext(appUser, this.context.appAddress, this.context);
        });
    }
    createApplicationAccount(component, contact) {
        return __awaiter(this, void 0, void 0, function* () {
            let appUser = yield ApplicationManager.authenticateApp(this.context.appID, this.context.appKey, this.context.appVersion);
            let securityContext = new SecurityContext_1.SecurityContext(appUser, this.context.appAddress, this.context);
            let contactProvider = new business_1.ContactProvider(securityContext, this.dataSource);
            let fetchedContact = yield contactProvider.getContact(contact);
            // Retrieves default role for account type
            let role = yield this.getDefaultRoleForAccount("COMPONENT");
            let result = yield this.context.performTask("Write", ApplicationManager.COMPONENT, (c) => __awaiter(this, void 0, void 0, function* () {
                // Create identity
                let identityAction = {
                    actor: c.appAddress,
                    date: new Date(Date.now()),
                    description: `Register component identity for contact with id [${contact.id}]`
                };
                let identity = {
                    contact: { id: contact.id, collection: "Contacts" },
                    actions: [identityAction],
                    collection: "Identities",
                    id: ""
                };
                let identityDocument = yield this.dataSource
                    .collection("Identities")
                    .add(identity);
                {
                    let { id } = yield identityDocument.get();
                    identity.id = id;
                }
                // Create credential
                let credential = {
                    validatedOn: new Date(Date.now()),
                    issuedOn: new Date(Date.now()),
                    issuer: "Local",
                    id: component.id,
                    expiration: Security_1.DEFAULT_EXPIRATION_SECONDS,
                    password: util_1.randomString(12)
                };
                let accountAction = {
                    actor: c.appAddress,
                    date: new Date(Date.now()),
                    description: `Register app account for identity with id [${identity.id}]`
                };
                let account = {
                    identity: { id: identity.id, collection: identity.collection },
                    credentials: [credential],
                    role,
                    actions: [accountAction],
                    kind: "COMPONENT",
                    id: "",
                    collection: "Users"
                };
                let accountDocument = yield this.dataSource
                    .collection("Users")
                    .add(account);
                {
                    let { id } = yield accountDocument.get();
                    account.id = id;
                }
                let communicationsManager = new communications_1.CommunicationsManager(securityContext);
                let { from } = JSON.parse(MAIL);
                let mail = {
                    from,
                    subject: "Application Registered",
                    to: fetchedContact.email,
                    body: `<html>
            <head>
            </head>
            <body>
            <p>The application <b>${component.id}</b> has been successfully registered. </p>
            </body>
          </html>`
                };
                let mailSent = yield communicationsManager.sendMail(mail);
                return account;
            }));
            // let appUser = await ApplicationManager.authenticateApp(this.context.appID, this.context.appKey, this.context.appVersion);
            // let securityContext = new SecurityContext(appUser, this.context.appAddress, this.context, appUser.credentials![0]);
            // let communicationsManager = new CommunicationsManager(securityContext);
            // let mailSent = communicationsManager.sendMail({
            //   from,
            //   to: contact.
            // })
            return result;
        });
    }
}
ApplicationManager.COMPONENT = "APPLICATION_MANAGER";
exports.ApplicationManager = ApplicationManager;
//# sourceMappingURL=ApplicationManager.js.map