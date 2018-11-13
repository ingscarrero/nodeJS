import { expect } from "chai";
import { Common, IContext } from '../bin/framework';

import * as Sample from "../bin/sample";
import { STORE_ACTIONS } from "../bin/framework/common/DataStore";

Sample.init();

const context = {
    actor: "mocha",
    description: "Unit testing",
    provider: "framework",
    user: "system"
} as IContext;

const caRules = [
    {
        role: { id: "admin" },
        storeActions: [STORE_ACTIONS.READ]
    },
    {
        role: { id: "user" },
        storeActions: []
    }
];

describe('Firebase providers validation', () => {
    it("Read Carts", (done) => {
        try {
            const test = new Sample.Store("test", context, caRules, { id: "admin" });
            test.getStores().then(taskResult => {

                let { result } = taskResult;

                if (result instanceof Error) {
                    expect(result, "Execution resulted in an error").to.not.is.instanceof(Error);
                    done();
                }

                if (!Array.isArray(result)) {
                    expect(result, "An array").to.be.an("array");
                    done();
                }

                if (Array.isArray(result) && !result.length) {
                    expect(result, "Not empty").to.not.be.empty;
                    done();
                }
                expect((result as Array<Common.DataStore.IDocument>).length, "Length").to.be.greaterThan(0);

                done();
            }).catch(err => {
                done(err);
            })

        } catch (err) {
            done(err);
        }
    });

    it("Read Carts A", (done) => {
        try {
            const test = new Sample.Store("test", context, caRules, { id: "admin" });
            test.getStores().then(taskResult => {

                let { result } = taskResult;

                if (result instanceof Error) {
                    expect(result, "Execution resulted in an error").to.not.is.instanceof(Error);
                    done();
                }

                if (!Array.isArray(result)) {
                    expect(result, "An array").to.be.an("array");
                    done();
                }

                if (Array.isArray(result) && !result.length) {
                    expect(result, "Not empty").to.not.be.empty;
                    done();
                }
                expect((result as Array<Common.DataStore.IDocument>).length, "Length").to.be.greaterThan(0);

                done();
            }).catch(err => {
                done(err);
            })

        } catch (err) {
            done(err);
        }
    });


    // it("Update store", (done) => {
    //     try {
    //         const action: Action<Sample.User> = {
    //             storeAction: "UPDATE",
    //             data: { name: "Test 4" },
    //             filter: () => ({
    //                 id: "SfJCRQLd80up9CIldGyA"
    //             })
    //         };
    //         storeStore.executeAction(action).then(taskResult => {

    //             let { result } = taskResult;

    //             if (result instanceof Error) {
    //                 expect(result, "Execution resulted in an error").to.not.is.instanceof(Error);
    //                 done();
    //             }
    //             done();
    //         }).catch(err => {
    //             done(err);
    //         })

    //     } catch (error) {
    //         done(error);
    //     }
    // })

    // it("Read carts", (done) => {
    //     try {
    //         const action: Action<Sample.User> = {
    //             storeAction: "READ",
    //         };
    //         cartStore.executeAction(action).then(taskResult => {

    //             let { result } = taskResult;

    //             if (result instanceof Error) {
    //                 expect(result, "Execution resulted in an error").to.not.is.instanceof(Error);
    //                 done();
    //             }

    //             if (!Array.isArray(result)) {
    //                 expect(result, "An array").to.be.an("array");
    //                 done();
    //             }

    //             if (Array.isArray(result) && !result.length) {
    //                 expect(result, "Not empty").to.not.be.empty;
    //                 done();
    //             }

    //             done()

    //         }).catch(err => {
    //             done(err);
    //         })

    //     } catch (error) {
    //         done(error);
    //     }
    // })
})
