import { VibezErrorPriority, Describable } from "./Common";
import { VibezError } from "./VibezError";
export declare class PlatformError extends VibezError implements Describable {
    description?: string;
    shortDescription: string;
    stack?: string | undefined;
    constructor(name: string, shortDescription: string, module: string, message: string, stack?: string, priority?: VibezErrorPriority, description?: string);
}
