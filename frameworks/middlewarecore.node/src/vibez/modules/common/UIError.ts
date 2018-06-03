import { VibezErrorPriority, Describable } from "./Common";
import { VibezError } from "./VibezError";
export class UIError extends VibezError implements Describable {
  description?: string;
  shortDescription: string;
  infoUrl?: string;

  constructor(
    name: string,
    shortDescription: string,
    module: string,
    message: string,
    stack?: string,
    priority?: VibezErrorPriority,
    description?: string,
    infoUrl?: string
  ) {
    super(module, message, stack, priority);
    this.shortDescription = shortDescription;
    this.description = description;
    this.infoUrl = infoUrl;
  }
}
