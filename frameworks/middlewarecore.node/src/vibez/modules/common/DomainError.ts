import { VibezErrorPriority, Describable } from "./Common";
import { VibezError } from "./VibezError";
export class DomainError extends VibezError implements Describable {
  description?: string;
  shortDescription: string;

  constructor(
    name: string,
    shortDescription: string,
    module: string,
    message: string,
    stack?: string,
    priority?: VibezErrorPriority,
    description?: string
  ) {
    super(module, message, stack, priority);
    this.name = name;
    this.shortDescription = shortDescription;
    this.description = description;
  }
}
