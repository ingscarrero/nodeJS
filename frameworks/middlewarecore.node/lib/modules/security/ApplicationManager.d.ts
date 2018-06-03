import { ComponentKind } from "./Security";
import { ApplicationContext } from "./ApplicationContext";
import { Profile, Component, User } from "./Security";
import { IndexableCollection, Indexable, DataProvider } from "../common";
import { firestore } from "firebase-admin";
export declare class ApplicationManager extends DataProvider {
    private static readonly COMPONENT;
    private static dataSource;
    context: ApplicationContext;
    constructor(context: ApplicationContext, dataSource: firestore.Firestore);
    static setDefaultDataSource(dataSource: firestore.Firestore): void;
    /**
     * Creates the Vibez Core's component, accountable Vibez' contact, AMP role, component's identity,
     * and Component's Account and credential required for the platform initialization.
     * @private
     * @static
     * @returns {Promise<User<"COMPONENT">>}
     * @memberof ApplicationManager
     */
    private static registerAccount();
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
    private static registerCoreComponentsWithParent(parentComponent, context);
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
    private static registerChildComponent(context, parentComponent, componentName, componentDescription, componentShortDescription);
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
    private static allowAccess(context, role, component);
    /**
     * Executes tasks for core registration
     *
     * @private
     * @static
     * @returns {Promise<boolean>}
     * @memberof ApplicationManager
     */
    private static coreRegistration();
    /**
     * Executes Platform initialization when required
     *
     * @static
     * @returns
     * @memberof ApplicationManager
     */
    static init(): Promise<undefined>;
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
    static authenticateApp(appID: string, appKey: string, appVersion: {
        major: number;
        minor: number;
        patch: number;
    }): Promise<User<"COMPONENT">>;
    /**
     * Retrieves role information and profile's access configuration
     *
     * @static
     * @param {Indexable} role
     * @returns {Promise<Profile>}
     * @memberof ApplicationManager
     */
    static getRoleProfile(role: Indexable): Promise<Profile>;
    /**
     * Retrieves Component's identifier by name
     *
     * @static
     * @param {string} name
     * @returns {Promise<Indexable>}
     * @memberof ApplicationManager
     */
    static getComponentIndexByName(name: string): Promise<Indexable>;
    /**
     * Retrieves Default Role for a given account type
     *
     * @private
     * @template T
     * @returns {Promise<IndexableCollection<"Roles">>}
     * @memberof ApplicationManager
     */
    private getDefaultRoleForAccount<T>(userKind);
    registerComponent(component: Component<ComponentKind>): Promise<void>;
    createApplicationAccount(component: IndexableCollection<"Components">, contact: Indexable): Promise<User<"COMPONENT">>;
}
