import { VibezErrorPriority, Describable } from "./Common";
import { VibezError } from "./VibezError";
export declare class UIError extends VibezError implements Describable {
    description?: string;
    shortDescription: string;
    infoUrl?: string;
    constructor(name: string, shortDescription: string, module: string, message: string, stack?: string, priority?: VibezErrorPriority, description?: string, infoUrl?: string);
}
