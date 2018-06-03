import { User, UserKind } from "./Security";
import { ApplicationContext } from "./ApplicationContext";
import { ValidableContext, Indexable, Context, ContextAction, ValidationResult } from "../common";
export declare class SecurityContext<T extends UserKind> extends ValidableContext {
    readonly actor: User<T>;
    readonly clientAddress: string;
    readonly applicationContext: ApplicationContext;
    readonly credential: Indexable;
    constructor(actor: User<T>, clientAddress: string, applicationContext: ApplicationContext);
    performTask<U extends Context, Result>(action: ContextAction, module: string, task: (context: U) => Promise<Result>): Promise<Result>;
    validateTask<T extends ContextAction>(action: T, componentName: string): Promise<ValidationResult>;
    validateContext(): Promise<ValidationResult>;
    getActorInformation(): string;
}
