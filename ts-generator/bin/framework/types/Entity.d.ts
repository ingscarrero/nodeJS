import { Immutable } from "./Immutable";
import { IContext } from "./Context";
export declare abstract class Entity<T> extends Immutable<T> {
    protected context?: IContext;
    constructor(data?: T, context?: IContext);
    setState(newState: Partial<T>): void;
}
