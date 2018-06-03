import { SecurityContext } from "./SecurityContext";
import { Component, ComponentKind, UserKind } from "./Security";
import { Indexable, DataProvider } from "../common";
import { firestore } from "firebase-admin";
export declare class ComponentManager<T extends UserKind> extends DataProvider {
    context: SecurityContext<T>;
    private static readonly COMPONENT;
    constructor(context: SecurityContext<T>, dataSource: firestore.Firestore);
    addChildComponent<U extends ComponentKind>(parent: Indexable, child: Indexable): Promise<boolean>;
    registerComponent<U extends ComponentKind>(name: string, componentKind: U, shortDescription: string, description?: string, parent?: Indexable, children?: Array<Indexable>): Promise<Component<U>>;
}
