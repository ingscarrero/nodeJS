import { Immutable } from "./Immutable";
import { IContext } from "./Context";
export declare abstract class Entity<T> extends Immutable<T> {
    private static factories;
    protected context?: IContext;
    constructor(data?: T, context?: IContext);
    setState(newState: Partial<T>): void;
    static register<EntityProtocol>(collection: string, factory: (context: IContext, data?: EntityProtocol) => Entity<EntityProtocol>): void;
    static use<EntityProtocol>(collection: string, context: IContext, data?: EntityProtocol): Entity<EntityProtocol>;
}
