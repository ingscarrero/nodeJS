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
class IdentityManager extends common_1.DataProvider {
    constructor(context, dataSource) {
        super(dataSource);
        this.context = context;
    }
    createIdentity(contact) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this.context.performTask("Write", IdentityManager.COMPONENT, (c) => __awaiter(this, void 0, void 0, function* () {
                let identityAction = {
                    actor: c.getActorInformation(),
                    date: new Date(Date.now()),
                    description: `Register identity for contact with id [${contact.id}]`
                };
                let identity = {
                    contact: contact,
                    actions: [identityAction],
                    collection: "Identities",
                    id: ""
                };
                let collection = this.dataSource.collection("Identities");
                let identityDocument = yield collection.add(identity);
                {
                    let { id } = yield identityDocument.get();
                    identity.id = id;
                }
                return identity;
            }));
            return result;
        });
    }
    updateIdentity(identity, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this.context.performTask("Write", IdentityManager.COMPONENT, (c) => __awaiter(this, void 0, void 0, function* () {
                let updateIdentity;
                let identityCollection = this.dataSource.collection("Identities");
                let identityDocument = identityCollection.doc(identity.id);
                {
                    let snapshot = yield identityDocument.get();
                    updateIdentity = Object.assign({ id: snapshot.id }, snapshot.data());
                }
                let action = {
                    actor: c.getActorInformation(),
                    date: new Date(Date.now()),
                    description: `Updated information for identity with id [${identity.id}].`
                };
                if (data) {
                    if (data.contact) {
                        action.description.concat(`\nUpdated contact: ${updateIdentity.contact.id}->${data.contact.id}`);
                        updateIdentity.contact = data.contact;
                    }
                }
                updateIdentity.actions.push(action);
                yield identityDocument.update(updateIdentity);
                return updateIdentity;
            }));
            return result;
        });
    }
    getIdentity(identity) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this.context.performTask("Read", IdentityManager.COMPONENT, (c) => __awaiter(this, void 0, void 0, function* () {
                let fetchedIdentity;
                let identityCollection = this.dataSource.collection("Identities");
                let identityDocument = identityCollection.doc(identity.id);
                let snapshot = yield identityDocument.get();
                if (!snapshot.exists) {
                    return Promise.reject(new common_1.DomainError("NOT_FOUND", "There were no matched identities for the submitted criteria", IdentityManager.COMPONENT, "Please check the submitted information", undefined, "LOW", "When retrieving the identity information, there were no matches for the provided identity identifier"));
                }
                fetchedIdentity = Object.assign({ id: snapshot.id }, snapshot.data());
                return fetchedIdentity;
            }));
            return result;
        });
    }
}
IdentityManager.COMPONENT = "IDENTITY_MANAGER";
exports.IdentityManager = IdentityManager;
//# sourceMappingURL=IdentityManagement.js.map