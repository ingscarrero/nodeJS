import { Logger, EventKind, Store, Event } from "../common";

export class ApplicationLogger extends Logger {
  constructor(store: Store<Event<"Warning" | "Error" | "Info">>) {
    super(store);
  }
  map<T extends EventKind, U>(event: Event<T>): U {
    let record = Object.assign({} as U, event);
    return record;
  }
}
