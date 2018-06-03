export class Action{
    author: {
        identity_id: String;
        date: Date;
    };
    description: String;
}

export class Location{
    coordinates: {
        latitude: Number;
        longitude: Number;
    }
    date: Date;
}

export class Phone{
    phone_type: String;
    is_principal: Boolean;
    country_id: String;
    area_code: String;
    number: String;
    extension: String;
    updates: Array<Action>;
}

export class Address{
    address_type: String;
    country_id: String;
    subdivision_id: String;
    city_id: String;
    address_line_1: String;
    address_line_2: String;
    coordinates: Coordinates;
    name: String;
    updates: Array<Action>;
}

export class Email{
    address: String;
    email_type: String;
    is_principal: Boolean;
    validation: {
        is_valid: Boolean;
        date: Date;
    }
    updates: Array<Action>;
}

export class LanguageProficiency{
    language_id: String;
    fluency: String;
    is_principal: Boolean;
    updates: Array<Action>;
}

export class Link{
    url: String;
    description: String;
    is_principal: Boolean;
    updates: Array<Action>;
}

export class Attribute{
    key: String;
    value: String;
    updates: Array<Action>;
}