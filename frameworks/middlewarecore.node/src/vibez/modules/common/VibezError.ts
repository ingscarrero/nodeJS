import { VibezErrorPriority, Indexable } from "./Common";
export class VibezError extends Error implements Indexable {
  id: string;
  stack?: string | undefined;
  module: string;
  priority: VibezErrorPriority;

  constructor(
    module: string,
    message: string,
    stack?: string,
    priority: VibezErrorPriority = "LOW"
  ) {
    super(message);
    this.stack = stack;
    this.module = module;
    this.priority = priority;
    this.id = new Date(Date.now()).getTime().toString();
  }
}
