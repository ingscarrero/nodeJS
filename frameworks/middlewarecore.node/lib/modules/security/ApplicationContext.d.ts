import { ValidableContext, IndexableCollection, Store, Event, ValidationResult, ContextAction } from "../common";
export declare class ApplicationContext extends ValidableContext {
    component?: IndexableCollection<"Components">;
    appID: string;
    appKey: string;
    appAddress: string;
    appVersion: {
        major: number;
        minor: number;
        patch: number;
    };
    constructor(appID: string, appKey: string, appAddress: string, appVersion: string, store: Store<Event<"Warning" | "Error" | "Info">>);
    validateContext(): Promise<ValidationResult>;
    validateTask<T extends ContextAction>(action: T, componentName: string): Promise<ValidationResult>;
    getActorInformation(): string;
}
