import { Immutable } from "./Immutable";
import { IContext } from "./Context";
import { ERRORS } from "./Common";


export abstract class Entity<T> extends Immutable<T>{
    private static factories: { [key: string]: <U>(context: IContext, data?: U) => Entity<U> } = {};
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

    public static register<EntityProtocol>(collection: string, factory: (context: IContext, data?: EntityProtocol) => Entity<EntityProtocol>) {
        this.factories[collection] = factory as <T>(context: IContext, data?: T) => Entity<T>;
    }

    public static use<EntityProtocol>(collection: string, context: IContext, data?: EntityProtocol): Entity<EntityProtocol> {
        if (!Object.keys(this.factories).includes(collection)) {
            const error = new Error(`No factory has been defined for the collection ${collection}`);
            error.name = ERRORS.NOT_SUPPORTED;
            Error.captureStackTrace(error);
            throw error
        }
        return this.factories[collection](context, data);
    }
}