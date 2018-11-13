import { ISearchOptions } from "./SearchOptions";
import { StoreAction } from "../common/DataStore";
import { IIndexable } from "./Common";
interface BaseAction {
    storeAction: StoreAction;
}
export interface AddAction<T> extends BaseAction {
    storeAction: "ADD";
    data: Partial<T>;
}
export interface UpdateAction<T> extends BaseAction {
    storeAction: "UPDATE" | "UPDATE_ALL";
    filter?: () => IIndexable;
    data: Partial<T>;
}
export interface DeleteAction extends BaseAction {
    storeAction: "DELETE" | "DELETE_ALL";
    filter?: () => IIndexable;
}
export interface SearchAction extends BaseAction {
    storeAction: "READ" | "FIND" | "FIND_ALL";
    filter?: () => IIndexable;
    options?: ISearchOptions;
}

export type Action<T> = SearchAction | DeleteAction | UpdateAction<T> | AddAction<T>;