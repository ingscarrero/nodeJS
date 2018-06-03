import * as common from "../../common/model"
export interface IIdentity{
    _id: String;
    identity_type: String;
    contact: Contact;
    updates: Array<common.Action>;
    status: String;
    
}

export class Contact{
    addresses: Array<common.Address>;
    phones: Array<common.Phone>;
    emails: Array<common.Email>;
    links: Array<common.Link>;
}

export interface IOrganization extends IIdentity {
    name: String;
    establishing_date: Date;
    sector: {
        name: String;
        category: String;
    };
    size: String;
    legal_representative: {
        individual_id: String;
        updates: Array<common.Action>;
    };
    decision_maker: {
        individual_id: String;
        updates: Array<common.Action>;
    };
    organization_units: Array<OrganizationUnit>;
    employees: Array<Employee>;
};

export class OrganizationUnit{
    name: String;
    description: String;
    ancestors: Array<String>;
    parent: String;
    updates: Array<common.Action>;
    status: String;
}

export class Employee{
    membership: String;
    organization_unit: {
        organization_unit_id: String;
        updates: Array<common.Action>;
    }
    individual_id: String;
    function: {
        name: String;
        updates: Array<common.Action>;    
    };
    superior: {
        employee_id: String;
        updates: Array<common.Action>;
    };
    updates: Array<common.Action>;
    status: String;
}

export interface IIndividual extends IIdentity {
    first_name: String;
    last_name: String;
    preferred_name: String;
    full_name: String;
    birth: {
        date: Date;
        place: {
            country_id: String;
            subdivision_id: String;
            city_id: String;
        }
    };
    profession:{
        labor_status: String;
        field:{ 
            name: String;
            category: String;
        }
        title: String;
        updates: Array<common.Action>;
    };
    languages: Array<common.LanguageProficiency>;
}



