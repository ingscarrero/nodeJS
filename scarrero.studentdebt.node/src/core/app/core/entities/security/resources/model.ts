import * as common from "../../common/model";

export interface Component {
    _id: String;
    name: String;
    description: String;
    ancestors: Array<String>;
    parent: { 
        component_id: String; 
        updates: Array<common.Action>;
    }
    channels: Array<Channel>;
    status: String;
    component_type: String;
    dynamic_attributes: Array<common.Attribute>;
}


export interface Channel {
    name: String;
    description: String;
    status: String;
    updates: Array<common.Action>
}