import { SecurityContext } from "./SecurityContext";
import { Component, ComponentKind, UserKind } from "./Security";
import { Indexable, DomainError, DataProvider } from "../common";
import { Action } from "../auditory";
import { firestore } from "firebase-admin";

export class ComponentManager<T extends UserKind> extends DataProvider {
  context: SecurityContext<T>;

  private static readonly COMPONENT = "COMPONENT_MANAGER";

  constructor(context: SecurityContext<T>, dataSource: firestore.Firestore) {
    super(dataSource);
    this.context = context;
  }

  public async addChildComponent<U extends ComponentKind>(
    parent: Indexable,
    child: Indexable
  ) {
    let result = await this.context.performTask<SecurityContext<T>, boolean>(
      "Write",
      ComponentManager.COMPONENT,
      async c => {
        let parenAction: Action = {
          actor: c.getActorInformation(),
          date: new Date(Date.now()),
          description: `Add children component with id [${child.id}]`
        };

        let childAction: Action = {
          actor: c.getActorInformation(),
          date: new Date(Date.now()),
          description: `Set parent component with id [${parent.id}]`
        };

        let componentsCollection = this.dataSource.collection("Components");

        let parentComponentDocument = componentsCollection.doc(parent.id);
        let parentComponent = await parentComponentDocument.get();
        if (!parentComponent.exists) {
          return Promise.reject(
            new DomainError(
              "INVALID_COMPONENT",
              `Component with id ${parentComponent.id} is invalid`,
              ComponentManager.COMPONENT,
              "Please validate the component's information",
              undefined,
              "LOW",
              "When registering children of a component, the parent component couldn't be validated"
            )
          );
        }

        let childComponentDocument = componentsCollection.doc(child.id);
        let childComponent = await parentComponentDocument.get();
        if (!childComponent.exists) {
          return Promise.reject(
            new DomainError(
              "INVALID_COMPONENT",
              `Component with id ${childComponent.id} is invalid`,
              ComponentManager.COMPONENT,
              "Please validate the component's information",
              undefined,
              "LOW",
              "When registering children of a component, the child component couldn't be validated"
            )
          );
        }

        {
          let { children, actions } = parentComponent.data()!;
          if (children) {
            children.push({
              id: child.id,
              collection: "Components"
            });
          }
          actions.push(parenAction);
          await parentComponentDocument.update({ children, actions });
        }

        {
          let { actions } = childComponent.data()!;
          actions.push(childAction);
          await childComponentDocument.update({
            parent: { ...parent, collection: "Components" },
            actions
          });
        }

        return true;
      }
    );
    return result;
  }

  public async registerComponent<U extends ComponentKind>(
    name: string,
    componentKind: U,
    shortDescription: string,
    description?: string,
    parent?: Indexable,
    children?: Array<Indexable>
  ) {
    let result = await this.context.performTask<
      SecurityContext<T>,
      Component<U>
    >("Write", ComponentManager.COMPONENT, async c => {
      let componentAction: Action = {
        actor: c.getActorInformation(),
        date: new Date(Date.now()),
        description: `Register component`
      };

      let actions = [componentAction];

      let component: Component<U> = {
        name,
        shortDescription,
        description,
        actions: actions,
        version: { major: 1, minor: 0, patch: 0 },
        enabled: true,
        kind: componentKind,
        collection: "Components",
        id: ""
      };

      let componentsCollection = this.dataSource.collection("Components");

      let parentComponentDocument: firestore.DocumentReference | undefined;
      let childrenComponentDocuments:
        | Array<firestore.DocumentReference>
        | undefined;

      if (parent) {
        let parentComponentDocument = componentsCollection.doc(parent.id);
        let parentComponent = await parentComponentDocument.get();
        if (!parentComponent.exists) {
          return Promise.reject(
            new DomainError(
              "INVALID_PARENT",
              `Parent component with id ${parentComponent.id} is invalid`,
              ComponentManager.COMPONENT,
              "Please validate the component's information",
              undefined,
              "LOW",
              "When registering component and its parent, the parent component couldn't be validated"
            )
          );
        }
        component.parent = { ...parent, collection: component.collection };
      }

      if (children) {
        childrenComponentDocuments = children.map(({ id }) =>
          componentsCollection.doc(id)
        );
        let childComponents = await Promise.all(
          childrenComponentDocuments!.map(async ({ get }) => await get())
        );

        let nonExistentChild = childComponents.find(child => {
          if (!child.exists) {
            return true;
          }
          let { parent } = child.data()!;
          if (parent) {
            return true;
          }
          return false;
        });

        if (nonExistentChild) {
          return Promise.reject(
            new DomainError(
              "INVALID_CHILD",
              `Child component with id ${nonExistentChild.id} is invalid`,
              ComponentManager.COMPONENT,
              "Please validate the component's information",
              undefined,
              "LOW",
              "When registering component and its children, one of the submitted children components couldn't be validated"
            )
          );
        }

        component.children = children.map(({ id }) => ({
          id,
          collection: component.collection
        }));
      }

      let componentDocument = await componentsCollection.add(component);

      let { id } = await componentDocument.get();
      component.id = id;

      if (parentComponentDocument) {
        let parenAction: Action = {
          actor: c.getActorInformation(),
          date: new Date(Date.now()),
          description: `Add children component with id [${component.id}]`
        };

        let snapshot = await parentComponentDocument.get();
        let { children, actions } = snapshot.data()!;

        children.push({ id, collection: component.collection });
        await parentComponentDocument.update({ children });
      }

      if (childrenComponentDocuments) {
        let childAction: Action = {
          actor: c.getActorInformation(),
          date: new Date(Date.now()),
          description: `Set parent component with id [${component.id}]`
        };

        await Promise.all(
          childrenComponentDocuments.map(async doc => {
            let snapshot = await doc.get();
            let { actions } = snapshot.data()!;
            actions.push(childAction);
            await doc.update({ parent: { id, actions } });
          })
        );
      }

      return component;
    });
    return result;
  }
}
