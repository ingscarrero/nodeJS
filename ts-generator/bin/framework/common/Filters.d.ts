export declare type Comparison = "==" | "<" | ">" | "<=" | ">=" | "!=";
export declare class Comparer {
    operator: Comparison;
    value: any;
    /**
     *
     */
    constructor(operator: Comparison, value: any);
}
export interface IFilterCriteria {
    id?: string;
    [key: string]: Comparer | any;
}
