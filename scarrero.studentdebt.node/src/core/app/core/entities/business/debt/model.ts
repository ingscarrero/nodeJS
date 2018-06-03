import * as common from "../../common/model";
import * as identity from "../../security/identity/model";

export class Debt {
    _id: String;
    creditor_id: String;
    debt_type: String;
    start_date: Date;
    term: Number;
    amount: Number;
    monthly_interest_rate: Number;
    nominal_interest_rate: Number;
    monthly_payment: Number;
    payments_history: Array<Payment>;
    status: String;
    updates: Array<common.Action>;
}

export interface IInvestor{
    identity_id: String;
    monthly_revenue: Number;
    investees: Array<Investment>;
}

export class Investment{
    debtor_id: String;
    debtor_debt_id: String;
    amount: Number;
    monthly_interest_rate: Number;
    nominal_interest_rate: Number;
    term: Number;
    request_date: Date;
    purchase_date: Date;
    effective_date: Date;
    payments: Array<Payment>;
    updates: Array<common.Action>;
    status: String;
}

export interface IDebtor{
    identity_id: String;
    monthly_revenue: Number;
    debts: Array<Debt>;
}

export interface ICreditor {
    identity_id:String;
    debtors_pool:Array<{
        debtor_id: String;
        status: String;
        updates: Array<common.Action>;
    }>;
}

export class Payment{
    amount: Number;
    date: Date;
    status: String;
    due_date: Date;
    comments: String;
}

export interface ICatalog{
    organization: { 
        organization_id: String;
        approval: {
            identity_id: String;
            date: Date
        };
        available_from: Date;
        available_to: Date;
    }
    status: String;
    updates: Array<common.Action>;
    offers: Array<Offer>;
}

export class Offer{
    offer_id: String;
    status: String;
    updates: Array<common.Action>;
    name: String;
    description: String;
    audiences: Array<Audience>;
    items: Array<OfferItem>
}

export class OfferItem{
    item_id: String;
    name: String;
    description: String;
    value: String;
}

export class Audience{
    name: String;
    updates: Array<common.Action>;
}
