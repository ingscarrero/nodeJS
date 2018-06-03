
import * as mongoose from "mongoose"
import * as assert from "assert"

import * as debt from "../../../../entities/business/debt/model"
import * as common from "../../../../entities/common/model"
import * as security from "../../../../entities/security/identity/model"


export interface Debtor extends mongoose.Document, debt.IDebtor{
};

export interface Creditor extends mongoose.Document, debt.ICreditor{
};

export interface Investor extends mongoose.Document, debt.IInvestor{

}

export class DebtAgent {

    // Schemas
    readonly debtorSchema: mongoose.Schema = new mongoose.Schema({
        identity_id: { type: String, required: true },
        monthly_revenue: { type: Number, required: true },
        debts: { type: Array, required: false }
    });

    readonly creditorSchema: mongoose.Schema = new mongoose.Schema({
        identity_id: { type: String, required: true },
        debtors_pool: { type: Array, required: false }
    });

    readonly investorSchema: mongoose.Schema = new mongoose.Schema({
        identity_id: { type: String, required: true },
        monthly_revenue: { type: Number, required: true },
        investees: {type: Array, required: false },
    });

    // Variables

    private data_source: mongoose.Connection;
    private context: Object;
    // Methods

    constructor (data_source: mongoose.Connection, context: Object){
        this.data_source = data_source;
        this.context = context;
    }
    
    // Helpers

    getUpdateAction() : common.Action{
        var update: common.Action = new common.Action();
        
        update.author.identity_id = this.context["security"]["identity"]["_id"];
        update.author.date = new Date(Date.now());

        return update;
    }


    // Investors

    registerInvestor(investor: Investor) : Promise<debt.IInvestor> {
        return new Promise((resolve, reject)=>{
            var model: mongoose.Model<Investor> = this.data_source.model<Investor>("investor", this.investorSchema);

            try {
                assert.equal(investor, null, "Investor information is required");
                assert.equal(investor.identity_id, null, "There is no valid identity linked to the investor's information.");
            } catch (error) {
                reject(error);
            }

            model.create(investor)
            .then(result=>{
                resolve(result);
            }).catch(err=>{
                reject(err);
            })
        })
    }

    // Creditors

    registerCreditor(creditor: Creditor) : Promise<debt.ICreditor> {
        return new Promise((resolve, reject)=>{
            var model: mongoose.Model<Creditor> = this.data_source.model<Creditor>("creditor", this.creditorSchema);
            try {
                assert.equal(creditor, null, "Creditor information is required");
                assert.equal(creditor.identity_id, null, "There is no valid identity linked to the creditor's information.");
            } catch (error) {
                reject(error);
            }

            model.create(creditor)
            .then(result=>{
                resolve(result);
            }).catch(err=>{
                reject(err);
            })
        });
    }

    // Debtors

    registerDebtor(debtor: Debtor) : Promise<debt.IDebtor> {
        return new Promise((resolve, reject)=>{
            var model: mongoose.Model<Debtor> = this.data_source.model<Debtor>("debtor", this.debtorSchema);

            try {                
                assert.equal(debtor, null, "Debtor information is required.");
                assert.equal(debtor.identity_id, null, "There is no valid identity linked to the debtor's information.");
            } catch (error) {
                reject(error);
            }

            model.create(debtor)
                .then(result=>{
                    resolve(result);
                }).catch(err=>{
                    reject(err);
                });
        });
    }

    removeDebtorDebt(identity_id: String, debt_id: String) : Promise<debt.IDebtor> {
        return new Promise((resolve, reject)=>{
          var model: mongoose.Model<Debtor> = this.data_source.model<Debtor>("debtor", this.debtorSchema);

          var update = this.getUpdateAction();
          update.description = "Debt with id [" + debt_id +"] removed";

          try {
              assert.equal(identity_id, null, "Invalid Identity.");
              assert.equal(identity_id, "", "Invalid Identity's Identifier.");

              assert.equal(debt_id, null, "Invalid Identity.");
              assert.equal(debt_id, "", "Invalid Identity's Identifier.");
          } catch (error) {
              model.findOneAndUpdate({ identity_id: identity_id , "debts._id": debt_id }, 
                { 
                    $set: {
                     "debts.$.status":"removed"
                    },
                    $push: {
                        updates: update
                    }
                }).then(result=>{
                    resolve(result);
                }).catch(err=>{
                    reject(err);
                });
          }  
        });
    }

    addDebtorDebt(identity_id: String, debt: debt.Debt) : Promise<debt.IDebtor>{
        return new Promise((resolve, reject)=>{
            var model: mongoose.Model<Debtor> = this.data_source.model<Debtor>("debtor", this.debtorSchema);

            var update = this.getUpdateAction();
            update.description = "Debt added to debtor with id [" + identity_id +"]";

            

            try {



                assert.equal(identity_id, null, "Invalid Identity.");
                assert.equal(identity_id, "", "Invalid Identity's Identifier.");
                assert.equal(debt, null, "Invalid debt information.");
                assert.equal(debt.creditor_id, null, "Creditor's information is required.");
                assert.equal(debt.creditor_id, "", "Invalid Creditor's information.");
                assert.equal(debt.start_date, null, "Debt's starting date is required.");
                assert.equal(debt.payments_history, null, "Debt payment information is required.");
                assert.equal(debt.payments_history.length, 0, "It's required the information of at least one of the debt's payments.");

                debt.updates.push(update);
                debt.status = "added";

            } catch (error) {
                reject(error);
            }

            model.findOneAndUpdate({ identity_id: identity_id }, 
                { 
                    $push: {
                        debts: debt
                    }
                }).then(result=>{
                    resolve(result);
                }).catch(err=>{
                    reject(err);
                });
        });
    }

    updateDebtPayment(identity_id: String, debt_id: String, payment: debt.Payment) : Promise<debt.IDebtor>{
        return new Promise((resolve, reject) => {
            var model: mongoose.Model<Debtor> = this.data_source.model<Debtor>("debtor", this.debtorSchema);
            
            try {
              assert.equal(identity_id, null, "Invalid Identity.");
              assert.equal(identity_id, "", "Invalid Identity's Identifier.");

              assert.equal(debt_id, null, "Invalid Identity.");
              assert.equal(debt_id, "", "Invalid Identity's Identifier.");

              assert.equal(payment, null, "Invalid payment information.");
            } catch (error) {
                reject(error);
            }

            model.update(
                { identity_id: identity_id , "debts._id": debt_id }, 
                {
                    $push:{
                       payments: payment
                    }
                }
            ).then(result=>{
                resolve(result);
            }).catch(err=>{
                reject(err);
            })

        });
    }
}