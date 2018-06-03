import { SECONDS_PER_YEAR } from "../constants";
import { SecurityContext } from "./SecurityContext";
import { randomString } from "../util";
import {
  ComponentKind,
  UserKind,
  Credential,
  DEFAULT_EXPIRATION_SECONDS
} from "./Security";
import { ApplicationContext } from "./ApplicationContext";
import {
  Profile,
  Permit,
  Authorization,
  Component,
  Role,
  User,
  Identity,
  Collections
} from "./Security";
import { ApplicationManagerLog } from "./ApplicationManagerLog";
import {
  PlatformError,
  IndexableCollection,
  Indexable,
  DomainError,
  DataProvider
} from "../common";
import {
  CommunicationsManager,
  Mail,
  MailTransportConfiguration
} from "../communications";
import { Contact, ContactProvider } from "../business";
import { Action } from "../auditory";
import * as admin from "firebase-admin";
import { firestore } from "firebase-admin";

const NMSPTransport = require("nodemailer-sparkpost-transport");
const nodemailer = require("nodemailer");

const { MAIL } = process.env;

const VIBEZ_CORE_COMPONENT: Component<"RESOURCE"> = {
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
    } as Action
  ],
  kind: "RESOURCE",
  collection: "Components",
  id: ""
};

const VIBEZ_CONTACT: Contact = {
  email: "sergio@vibez.io",
  mobile: "+1(707)953-2515",
  name: "VIBEZ",
  actions: [
    {
      actor: "Vibez",
      date: new Date(Date.now()),
      description:
        "Register Application Manager Component's Contact Information"
    } as Action
  ],
  collection: "Contacts",
  id: "",
  surname: "Transforming the music industry"
};

const VIBEZ_ROLE: Role = {
  name: "AMR",
  description: "Application Manager",
  shortDescription: "All Access",
  profile: {
    name: "Application Manager Profile",
    description: "All Access Profile",
    permits: [{} as Permit]
  } as Profile,
  actions: [
    {
      actor: "Vibez",
      date: new Date(Date.now()),
      description: "Register Application Manager Component's Default Role"
    } as Action
  ],
  collection: "Roles",
  id: ""
};

export class ApplicationManager extends DataProvider {
  private static readonly COMPONENT = "APPLICATION_MANAGER";
  private static dataSource: firestore.Firestore;

  context: ApplicationContext;

  constructor(context: ApplicationContext, dataSource: firestore.Firestore) {
    super(dataSource);
    this.context = context;
  }

  public static setDefaultDataSource(dataSource: firestore.Firestore) {
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
  private static async registerAccount(): Promise<User<"COMPONENT">> {
    try {
      let componentsCollection = this.dataSource.collection("Components");
      let contactCollection = this.dataSource.collection("Contacts");
      let roleCollection = this.dataSource.collection("Roles");

      // Mail configuration pre-requisites.

      let { secret, from } = JSON.parse(MAIL!);

      if (!secret || !from) {
        return Promise.reject(
          new PlatformError(
            "INITIALIZATION_ERROR",
            "Error when validating communications pre-requisites",
            ApplicationManager.COMPONENT,
            "Pending configuration",
            undefined,
            "MEDIUM",
            `There was an error when validating initialization pre-requisites. Missing mail settings for this platform's instance`
          )
        );
      }

      // let transportSettings: MailTransportConfiguration = {
      //   secret
      // };
      let transportConfiguration = NMSPTransport({ sparkPostApiKey: secret });
      let transport = nodemailer.createTransport(transportConfiguration);

      // Register Component

      VIBEZ_CORE_COMPONENT.name = ApplicationManager.COMPONENT;

      let componentDocument = await componentsCollection.add(
        VIBEZ_CORE_COMPONENT
      );
      {
        let { id } = await componentDocument.get();
        VIBEZ_CORE_COMPONENT.id = id;
      }

      // Register Contact Information

      let contactDocument = await contactCollection.add(VIBEZ_CONTACT);
      {
        let { id } = await contactDocument.get();
        VIBEZ_CONTACT.id = id;
      }

      // Register Role

      let roleAction: Action = {
        actor: VIBEZ_CONTACT.name,
        date: new Date(Date.now()),
        description: `Register application management role`
      };

      let authorization: Authorization = {
        canDelete: true,
        canRead: true,
        canWrite: true
      };

      let permit: Permit = {
        authorization: authorization,
        component: { id: VIBEZ_CORE_COMPONENT.id, collection: "Components" },
        issuedOn: new Date(Date.now()),
        validity: SECONDS_PER_YEAR
      };

      let profile: Profile = {
        description: "All access to Vibez Platform",
        shortDescription: "All access",
        name: "AMP",
        permits: [permit],
        actions: [roleAction]
      };

      VIBEZ_ROLE.profile = profile;

      let roleDocument = await roleCollection.add(VIBEZ_ROLE);
      {
        let { id } = await roleDocument.get();
        VIBEZ_ROLE.id = id;
      }

      // Register Account

      // Create identity
      let identityAction: Action = {
        actor: VIBEZ_CONTACT.name,
        date: new Date(Date.now()),
        description: `Register component identity for contact with id [${
          VIBEZ_CONTACT.id
        }]`
      };
      let identity: Identity = {
        id: "",
        contact: { id: VIBEZ_CONTACT.id, collection: "Contacts" },
        actions: [identityAction],
        collection: "Identities"
      };

      let identityCollection = this.dataSource.collection("Identities");

      let identityDocument = await identityCollection.add(identity);

      let { id } = await identityDocument.get();

      // Create credential
      let credential: Credential = {
        validatedOn: new Date(Date.now()),
        issuedOn: new Date(Date.now()),
        issuer: "Local",
        id: VIBEZ_CORE_COMPONENT.id,
        expiration: DEFAULT_EXPIRATION_SECONDS,
        password: randomString(12)
      };

      let accountAction: Action = {
        actor: VIBEZ_CORE_COMPONENT.name,
        date: new Date(Date.now()),
        description: `Register app account for identity with id [${
          identity.id
        }]`
      };
      let appManagerAccount: User<"COMPONENT"> = {
        identity: { id, collection: "Identities" },
        credentials: [credential],
        role: { id: VIBEZ_ROLE.id, collection: "Roles" },
        actions: [accountAction],
        kind: "COMPONENT",
        collection: "Users",
        id: "",
        validatedOn: new Date(Date.now())
      };

      let accountCollection = await this.dataSource.collection("Users");

      let accountDocument = await accountCollection.add(appManagerAccount);

      {
        let { id } = await accountDocument.get();
        appManagerAccount.id = id;
      }

      let result = await new Promise<boolean>((resolve, reject) => {
        transport.sendMail(
          {
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
                      <li><span><b>${credential.id}</b>:${
              credential.password
            }</span></li>
                    </ul>
                  </p>
                  <p>Please proceed with the configuration.
                  </p>
                </body>
              </html>
            `
          },
          (err: Error, info: any) => {
            if (err) {
              return reject(
                new PlatformError(
                  "INITIALIZATION_ERROR",
                  "Error when sending platform activation e-mail",
                  ApplicationManager.COMPONENT,
                  err.message,
                  err.stack,
                  "HIGH",
                  "It wasn't possible to send the activation e-mail to the platform's accountable."
                )
              );
            } else {
              return resolve(true);
            }
          }
        );
      });

      return appManagerAccount;
    } catch (error) {
      return Promise.reject(
        new PlatformError(
          "INITIALIZATION_ERROR",
          "Application Manager Initialization Error",
          ApplicationManager.COMPONENT,
          error.message,
          error.stack,
          "HIGH",
          "When Initializing Application Manager, there was an unexpected error"
        )
      );
    }
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
  private static async registerCoreComponentsWithParent(
    parentComponent: Indexable,
    context: ApplicationContext
  ): Promise<Array<Component<"RESOURCE">>> {
    let document = this.dataSource
      .collection("Components")
      .doc(parentComponent.id);

    let componentDocument = await document.get();

    if (!componentDocument.exists) {
      return Promise.reject(
        new DomainError(
          "NOT_FOUND",
          "Invalid Component",
          ApplicationManager.COMPONENT,
          "Please check the submitted information",
          undefined,
          "LOW",
          "When registering Vibez Core components, the parent component wasn't found"
        )
      );
    }

    let identityManager = await ApplicationManager.registerChildComponent(
      context,
      parentComponent,
      "IDENTITY_MANAGER",
      "Identities Management Module for identities' registration and update",
      "Vibez's Account Manager"
    );

    let accountManager = await ApplicationManager.registerChildComponent(
      context,
      parentComponent,
      "ACCOUNT_MANAGER",
      "Account Management Module for account registration, update and recovery",
      "Vibez's Account Manager"
    );

    let communicationsManager = await ApplicationManager.registerChildComponent(
      context,
      parentComponent,
      "COMMUNICATIONS_MANAGER",
      "Communication Module for communication intents processing",
      "Vibez's Communication Manager"
    );

    let componentsManager = await ApplicationManager.registerChildComponent(
      context,
      parentComponent,
      "COMPONENT_MANAGER",
      "Components Administration Module for managing Vibez's Components",
      "Vibez's Components Manager"
    );

    let registeredComponents = [
      identityManager,
      accountManager,
      communicationsManager,
      componentsManager
    ];
    return registeredComponents;
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
  private static async registerChildComponent(
    context: ApplicationContext,
    parentComponent: Indexable,
    componentName: string,
    componentDescription: string,
    componentShortDescription: string
  ) {
    let componentsCollection = this.dataSource.collection("Components");
    let componentDocument = componentsCollection.doc(parentComponent.id);
    let component: Component<ComponentKind>;

    {
      let snapshot = await componentDocument.get();

      component = Object.assign(
        { id: snapshot.id } as Component<ComponentKind>,
        snapshot.data()
      );

      if (!snapshot.exists) {
        return Promise.reject(
          new DomainError(
            "NOT_FOUND",
            "Submitted parent component could't be found",
            ApplicationManager.COMPONENT,
            "Please validate the submitted information",
            undefined,
            "LOW",
            `When registering child component [${componentName}] to component [${
              parentComponent.id
            }], submitted parent component has not matches`
          )
        );
      }
    }

    let childComponentAction: Action = {
      actor: context.appAddress,
      date: new Date(Date.now()),
      description: `Register parent component [${parentComponent.id}]`
    };

    let childComponent: Component<"RESOURCE"> = {
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
      let { id } = await componentsCollection.add(childComponent);
      childComponent.id = id;
    }

    let { children, actions } = component;

    if (!children) {
      children = new Array<IndexableCollection<"Components">>();
    }

    children.push({
      id: childComponent.id,
      collection: childComponent.collection
    });

    let parentComponentAction: Action = {
      actor: context.appAddress,
      date: new Date(Date.now()),
      description: `Register child component [${childComponent.id}}]`
    };

    actions.push(parentComponentAction);

    await componentDocument.update({ children, actions });

    return childComponent;
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
  private static async allowAccess(
    context: ApplicationContext,
    role: Indexable,
    component: Indexable
  ) {
    let roleCollection = this.dataSource.collection("Roles");

    let snapshot = await roleCollection.doc(role.id).get();

    if (!snapshot.exists) {
      return Promise.reject(
        new DomainError(
          "NOT_FOUND",
          "There were no matches for the submitted criteria",
          ApplicationManager.COMPONENT,
          "Please validate the submitted information",
          undefined,
          "LOW",
          "When fetching the role's information for updating profile, there were no matches for the submitted criteria"
        )
      );
    }

    let { permits, actions } = snapshot.data()!;

    permits = permits ? permits : new Array<Permit>();
    actions = actions ? actions : new Array<Action>();

    let action: Action = {
      actor: context.appAddress,
      date: new Date(Date.now()),
      description: `Set access to component [${component.id}]`
    };

    let authorization: Authorization = {
      canDelete: true,
      canRead: true,
      canWrite: true
    };

    let permit: Permit = {
      authorization: authorization,
      component: { id: component.id, collection: "Components" },
      issuedOn: new Date(Date.now()),
      validity: SECONDS_PER_YEAR
    };

    permits.push(permit);
    actions.push(action);

    await roleCollection.doc(role.id).update({ permits, actions });
    return true;
  }

  /**
   * Executes tasks for core registration
   *
   * @private
   * @static
   * @returns {Promise<boolean>}
   * @memberof ApplicationManager
   */
  private static async coreRegistration(): Promise<boolean> {
    try {
      let account = await ApplicationManager.registerAccount();

      let credential = account.credentials!.find(c => c.issuer == "Local")!;

      let component: Indexable = await ApplicationManager.getComponentIndexByName(
        VIBEZ_CORE_COMPONENT.name
      );

      let logStore = new ApplicationManagerLog(this.dataSource);

      let applicationContext = new ApplicationContext(
        credential.id,
        credential.password!,
        "local",
        "1.0.0",
        logStore
      );

      let result = await applicationContext.performTask(
        "Write",
        "APPLICATION_MANAGER",
        async (context: ApplicationContext) => {
          let registeredComponents = await ApplicationManager.registerCoreComponentsWithParent(
            component,
            context
          );

          await Promise.all(
            registeredComponents.map(
              async component =>
                await ApplicationManager.allowAccess(
                  context,
                  account.role,
                  component
                )
            )
          );

          return true;
        }
      );

      return true;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Executes Platform initialization when required
   *
   * @static
   * @returns
   * @memberof ApplicationManager
   */
  public static async init() {
    try {
      let component = await ApplicationManager.getComponentIndexByName(
        VIBEZ_CORE_COMPONENT.name
      );
    } catch (error) {
      if (error instanceof DomainError) {
        if (error.name == "NOT_FOUND") {
          try {
            let result = await ApplicationManager.coreRegistration();
            if (!result) {
              return Promise.reject(
                new PlatformError(
                  "UNKNOWN_ERROR",
                  "Error at core registration process",
                  ApplicationManager.COMPONENT,
                  "Please validate with the administrator",
                  undefined,
                  "HIGH",
                  "When performing core registration, there was an error in the process"
                )
              );
            }
            return;
          } catch (error) {
            return Promise.reject(error);
          }
        }
      } else {
        return Promise.reject(
          new PlatformError(
            "UNKNOWN_ERROR",
            "Error at core registration process",
            ApplicationManager.COMPONENT,
            "Please validate with the administrator",
            undefined,
            "HIGH",
            "When performing core registration, there was an error in the process"
          )
        );
      }
    }
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
  public static async authenticateApp(
    appID: string,
    appKey: string,
    appVersion: { major: number; minor: number; patch: number }
  ): Promise<User<"COMPONENT">> {
    let componentsCollection = this.dataSource.collection("Components");

    let componentDocument = componentsCollection.doc(appID);

    let component: Component<ComponentKind>;
    {
      let snapshot = await componentDocument.get();

      if (!snapshot.exists) {
        return Promise.reject(
          new DomainError(
            "NOT_FOUND",
            "There were no matches for the submitted criteria",
            ApplicationManager.COMPONENT,
            "Please validate the submitted information",
            undefined,
            "LOW",
            "When fetching the component's information, there were no matches for the submitted ID and Version"
          )
        );
      }

      component = { ...snapshot.data(), id: snapshot.id } as Component<
        ComponentKind
      >;
    }

    let authenticatedApp: User<"COMPONENT">;

    let usersCollectionRef = this.dataSource.collection("Users");
    let usersQueryObject = usersCollectionRef.where("kind", "==", "COMPONENT");
    // .where("credentials.id", "==", appID);
    // .where("credentials.password", "==", appKey)
    // .where("credentials.issuer", "==", "Local")
    {
      let { docs, empty } = await usersQueryObject.get();

      if (empty) {
        return Promise.reject(
          new DomainError(
            "NOT_FOUND",
            "There were no matches for the submitted criteria",
            ApplicationManager.COMPONENT,
            "Please validate the submitted information",
            undefined,
            "LOW",
            "When fetching the app's account information, there were no matches for the submitted criteria or the credential is invalid"
          )
        );
      }

      let match = docs
        .map(d => {
          return { ...d.data(), id: d.id } as User<"COMPONENT">;
        })
        .find(({ credentials }) =>
          credentials!.some(
            c => c.id == appID && c.password == appKey && c.issuer == "Local"
          )
        );

      if (!match) {
        return Promise.reject(
          new DomainError(
            "NOT_FOUND",
            "There were no matches for the submitted criteria",
            ApplicationManager.COMPONENT,
            "Please validate the submitted information",
            undefined,
            "LOW",
            "When fetching the app's account information, there were no matches for the submitted criteria or the credential is invalid"
          )
        );
      }

      authenticatedApp = match;
    }

    if (!authenticatedApp.validatedOn) {
      return Promise.reject(
        new DomainError(
          "INVALID_ACCOUNT",
          "The application's account hasn't been validated",
          ApplicationManager.COMPONENT,
          "Please check your e-mail for an e-mail from [vibez.io] with instructions",
          undefined,
          "LOW",
          "When fetching the app's account information, there were no matches for the submitted criteria or the credential is invalid"
        )
      );
    }

    let credential = (authenticatedApp.credentials! as Array<Credential>).find(
      c => c.issuer == "Local" && c.id == appID && c.password == appKey
    )!;

    let expiringAt = new Date(credential.issuedOn);
    expiringAt.setSeconds(expiringAt.getSeconds() + credential.expiration);

    if (expiringAt < new Date(Date.now())) {
      return Promise.reject(
        new DomainError(
          "INVALID_CREDENTIAL",
          "Expired Credential",
          ApplicationManager.COMPONENT,
          "Please renew the credentials",
          undefined,
          "MEDIUM",
          "When fetching the app's account information, the credentials of the app were expired"
        )
      );
    }

    let accountInfo = {
      identity: authenticatedApp.identity,
      role: authenticatedApp.role,
      credentials: [{ id: credential.id } as Credential],
      validatedOn: authenticatedApp.validatedOn
    } as User<"COMPONENT">;

    return accountInfo;
  }

  /**
   * Retrieves role information and profile's access configuration
   *
   * @static
   * @param {Indexable} role
   * @returns {Promise<Profile>}
   * @memberof ApplicationManager
   */
  public static async getRoleProfile(role: Indexable): Promise<Profile> {
    let roleCollection = this.dataSource.collection("Roles");
    let roleDocument = roleCollection.doc(role.id);
    let snapshot = await roleDocument.get();

    if (!snapshot.exists) {
      return Promise.reject(
        new DomainError(
          "NOT_FOUND",
          "There were no matches for the submitted criteria",
          ApplicationManager.COMPONENT,
          "Please validate the submitted information",
          undefined,
          "LOW",
          "When fetching the role's information, there were no matches for the submitted ID"
        )
      );
    }

    let { profile } = snapshot.data()!;

    if (!profile) {
      return Promise.reject(
        new DomainError(
          "NO_DATA",
          "There role has no profile information",
          ApplicationManager.COMPONENT,
          "Please validate role configuration with the administrator",
          undefined,
          "MEDIUM",
          "When fetching the role's information, the retrieved ID had no profile information"
        )
      );
    }

    return profile as Profile;
  }

  /**
   * Retrieves Component's identifier by name
   *
   * @static
   * @param {string} name
   * @returns {Promise<Indexable>}
   * @memberof ApplicationManager
   */
  public static async getComponentIndexByName(
    name: string
  ): Promise<Indexable> {
    let collectionRef = this.dataSource.collection("Components");
    let queryObject = collectionRef.where("name", "==", name);
    let { empty, docs } = await queryObject.get();

    if (empty) {
      return Promise.reject(
        new DomainError(
          "NOT_FOUND",
          "There were no matches for the submitted criteria",
          ApplicationManager.COMPONENT,
          "Please validate the submitted information",
          undefined,
          "LOW",
          "When fetching the component's, there were no matches for the submitted ID"
        )
      );
    }

    let { id } = docs
      .map(snapshot => ({ ...snapshot.data(), id: snapshot.id }))
      .find(d => true)!;
    let indexable = { id };
    return indexable;
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
  private async getDefaultRoleForAccount<T extends UserKind>(
    userKind: T
  ): Promise<IndexableCollection<"Roles">> {
    let result = await this.context.performTask<ApplicationContext, Role>(
      "Read",
      ApplicationManager.COMPONENT,
      async c => {
        let collectionRef = this.dataSource.collection("Roles");
        let queryObject = collectionRef.where(
          "name",
          "==",
          `DEFAULT_${userKind}`
        );
        let { empty, docs } = await queryObject.get();

        if (empty) {
          return Promise.reject(
            new DomainError(
              "NOT_FOUND",
              "There were no matches for the submitted criteria",
              ApplicationManager.COMPONENT,
              `Please validate the [DEFAULT_${userKind}] role configuration with the administrator`,
              undefined,
              "LOW",
              "When fetching the role's information, there were no matches for the submitted ID"
            )
          );
        }
        let role: Role = docs
          .map(snapshot => ({ ...snapshot.data(), id: snapshot.id } as Role))
          .find(d => true)!;
        return role;
      }
    );

    return result;
  }

  public async registerComponent(component: Component<ComponentKind>) {
    let appUser = await ApplicationManager.authenticateApp(
      this.context.appID,
      this.context.appKey,
      this.context.appVersion
    );
    let securityContext = new SecurityContext(
      appUser,
      this.context.appAddress,
      this.context
    );
  }
  public async createApplicationAccount(
    component: IndexableCollection<"Components">,
    contact: Indexable
  ): Promise<User<"COMPONENT">> {
    let appUser = await ApplicationManager.authenticateApp(
      this.context.appID,
      this.context.appKey,
      this.context.appVersion
    );

    let securityContext = new SecurityContext(
      appUser,
      this.context.appAddress,
      this.context
    );

    let contactProvider = new ContactProvider(securityContext, this.dataSource);

    let fetchedContact = await contactProvider.getContact(contact);

    // Retrieves default role for account type
    let role: IndexableCollection<
      "Roles"
    > = await this.getDefaultRoleForAccount("COMPONENT");

    let result = await this.context.performTask<
      ApplicationContext,
      User<"COMPONENT">
    >("Write", ApplicationManager.COMPONENT, async c => {
      // Create identity
      let identityAction: Action = {
        actor: c.appAddress,
        date: new Date(Date.now()),
        description: `Register component identity for contact with id [${
          contact.id
        }]`
      };

      let identity: Identity = {
        contact: { id: contact.id, collection: "Contacts" },
        actions: [identityAction],
        collection: "Identities",
        id: ""
      };

      let identityDocument = await this.dataSource
        .collection("Identities")
        .add(identity);

      {
        let { id } = await identityDocument.get();
        identity.id = id;
      }

      // Create credential
      let credential: Credential = {
        validatedOn: new Date(Date.now()),
        issuedOn: new Date(Date.now()),
        issuer: "Local",
        id: component.id,
        expiration: DEFAULT_EXPIRATION_SECONDS,
        password: randomString(12)
      };

      let accountAction: Action = {
        actor: c.appAddress,
        date: new Date(Date.now()),
        description: `Register app account for identity with id [${
          identity.id
        }]`
      };

      let account: User<"COMPONENT"> = {
        identity: { id: identity.id, collection: identity.collection },
        credentials: [credential],
        role,
        actions: [accountAction],
        kind: "COMPONENT",
        id: "",
        collection: "Users"
      };

      let accountDocument = await this.dataSource
        .collection("Users")
        .add(account);

      {
        let { id } = await accountDocument.get();
        account.id = id;
      }

      let communicationsManager = new CommunicationsManager(securityContext);

      let { from } = JSON.parse(MAIL!);

      let mail: Mail = {
        from,
        subject: "Application Registered",
        to: fetchedContact.email,
        body: `<html>
            <head>
            </head>
            <body>
            <p>The application <b>${
              component.id
            }</b> has been successfully registered. </p>
            </body>
          </html>`
      };
      let mailSent = await communicationsManager.sendMail(mail);

      return account;
    });

    // let appUser = await ApplicationManager.authenticateApp(this.context.appID, this.context.appKey, this.context.appVersion);
    // let securityContext = new SecurityContext(appUser, this.context.appAddress, this.context, appUser.credentials![0]);

    // let communicationsManager = new CommunicationsManager(securityContext);
    // let mailSent = communicationsManager.sendMail({
    //   from,
    //   to: contact.
    // })

    return result;
  }
}
