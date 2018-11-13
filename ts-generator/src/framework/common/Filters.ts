
export type Comparison = "==" | "<" | ">" | "<=" | ">=" | "!=";

export class Comparer {
    operator: Comparison;
    value: any;
    /**
     *
     */
    constructor(operator: Comparison, value: any) {
        this.operator = operator;
        this.value = value;
    }
}
export interface IFilterCriteria {
    id?: string;
    [key: string]: Comparer | any;
}