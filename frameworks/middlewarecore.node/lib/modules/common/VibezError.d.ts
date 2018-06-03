import { VibezErrorPriority, Indexable } from "./Common";
export declare class VibezError extends Error implements Indexable {
    id: string;
    stack?: string | undefined;
    module: string;
    priority: VibezErrorPriority;
    constructor(module: string, message: string, stack?: string, priority?: VibezErrorPriority);
}
