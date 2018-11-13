import { Immutable } from "./Immutable";
import { IContext } from "./Context";


export abstract class Entity<T> extends Immutable<T>{
    protected context?: IContext;
    constructor(data?: T, context?: IContext) {
        super(data);
        this.context = context;
    }

    public setState(newState: Partial<T>) {
        Object.keys(newState)
            .map(key => <keyof T>key)
            .reduce(
                (previous: Entity<T>, next: keyof T) => previous.setProperty(next, newState[next]!)
                , this);
    }
}