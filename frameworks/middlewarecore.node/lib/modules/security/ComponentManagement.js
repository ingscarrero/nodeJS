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
class ComponentManager extends common_1.DataProvider {
    constructor(context, dataSource) {
        super(dataSource);
        this.context = context;
    }
    addChildComponent(parent, child) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this.context.performTask("Write", ComponentManager.COMPONENT, (c) => __awaiter(this, void 0, void 0, function* () {
                let parenAction = {
                    actor: c.getActorInformation(),
                    date: new Date(Date.now()),
                    description: `Add children component with id [${child.id}]`
                };
                let childAction = {
                    actor: c.getActorInformation(),
                    date: new Date(Date.now()),
                    description: `Set parent component with id [${parent.id}]`
                };
                let componentsCollection = this.dataSource.collection("Components");
                let parentComponentDocument = componentsCollection.doc(parent.id);
                let parentComponent = yield parentComponentDocument.get();
                if (!parentComponent.exists) {
                    return Promise.reject(new common_1.DomainError("INVALID_COMPONENT", `Component with id ${parentComponent.id} is invalid`, ComponentManager.COMPONENT, "Please validate the component's information", undefined, "LOW", "When registering children of a component, the parent component couldn't be validated"));
                }
                let childComponentDocument = componentsCollection.doc(child.id);
                let childComponent = yield parentComponentDocument.get();
                if (!childComponent.exists) {
                    return Promise.reject(new common_1.DomainError("INVALID_COMPONENT", `Component with id ${childComponent.id} is invalid`, ComponentManager.COMPONENT, "Please validate the component's information", undefined, "LOW", "When registering children of a component, the child component couldn't be validated"));
                }
                {
                    let { children, actions } = parentComponent.data();
                    if (children) {
                        children.push({
                            id: child.id,
                            collection: "Components"
                        });
                    }
                    actions.push(parenAction);
                    yield parentComponentDocument.update({ children, actions });
                }
                {
                    let { actions } = childComponent.data();
                    actions.push(childAction);
                    yield childComponentDocument.update({
                        parent: Object.assign({}, parent, { collection: "Components" }),
                        actions
                    });
                }
                return true;
            }));
            return result;
        });
    }
    registerComponent(name, componentKind, shortDescription, description, parent, children) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this.context.performTask("Write", ComponentManager.COMPONENT, (c) => __awaiter(this, void 0, void 0, function* () {
                let componentAction = {
                    actor: c.getActorInformation(),
                    date: new Date(Date.now()),
                    description: `Register component`
                };
                let actions = [componentAction];
                let component = {
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
                let parentComponentDocument;
                let childrenComponentDocuments;
                if (parent) {
                    let parentComponentDocument = componentsCollection.doc(parent.id);
                    let parentComponent = yield parentComponentDocument.get();
                    if (!parentComponent.exists) {
                        return Promise.reject(new common_1.DomainError("INVALID_PARENT", `Parent component with id ${parentComponent.id} is invalid`, ComponentManager.COMPONENT, "Please validate the component's information", undefined, "LOW", "When registering component and its parent, the parent component couldn't be validated"));
                    }
                    component.parent = Object.assign({}, parent, { collection: component.collection });
                }
                if (children) {
                    childrenComponentDocuments = children.map(({ id }) => componentsCollection.doc(id));
                    let childComponents = yield Promise.all(childrenComponentDocuments.map(({ get }) => __awaiter(this, void 0, void 0, function* () { return yield get(); })));
                    let nonExistentChild = childComponents.find(child => {
                        if (!child.exists) {
                            return true;
                        }
                        let { parent } = child.data();
                        if (parent) {
                            return true;
                        }
                        return false;
                    });
                    if (nonExistentChild) {
                        return Promise.reject(new common_1.DomainError("INVALID_CHILD", `Child component with id ${nonExistentChild.id} is invalid`, ComponentManager.COMPONENT, "Please validate the component's information", undefined, "LOW", "When registering component and its children, one of the submitted children components couldn't be validated"));
                    }
                    component.children = children.map(({ id }) => ({
                        id,
                        collection: component.collection
                    }));
                }
                let componentDocument = yield componentsCollection.add(component);
                let { id } = yield componentDocument.get();
                component.id = id;
                if (parentComponentDocument) {
                    let parenAction = {
                        actor: c.getActorInformation(),
                        date: new Date(Date.now()),
                        description: `Add children component with id [${component.id}]`
                    };
                    let snapshot = yield parentComponentDocument.get();
                    let { children, actions } = snapshot.data();
                    children.push({ id, collection: component.collection });
                    yield parentComponentDocument.update({ children });
                }
                if (childrenComponentDocuments) {
                    let childAction = {
                        actor: c.getActorInformation(),
                        date: new Date(Date.now()),
                        description: `Set parent component with id [${component.id}]`
                    };
                    yield Promise.all(childrenComponentDocuments.map((doc) => __awaiter(this, void 0, void 0, function* () {
                        let snapshot = yield doc.get();
                        let { actions } = snapshot.data();
                        actions.push(childAction);
                        yield doc.update({ parent: { id, actions } });
                    })));
                }
                return component;
            }));
            return result;
        });
    }
}
ComponentManager.COMPONENT = "COMPONENT_MANAGER";
exports.ComponentManager = ComponentManager;
//# sourceMappingURL=ComponentManagement.js.map