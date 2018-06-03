import { DomainError } from "./DomainError";
import { PlatformError } from "./PlatformError";
import {
  ValidationResult,
  ContextAction,
  EventKind,
  Store,
  Event
} from "./Common";
import * as admin from "firebase-admin";
import { firestore } from "firebase-admin";

export abstract class Logger {
  logStore: Store<Event<"Warning" | "Error" | "Info">>;

  constructor(store: Store<Event<"Warning" | "Error" | "Info">>) {
    this.logStore = store;
  }
  abstract map<T extends EventKind, U>(event: Event<T>): U;
  public async log<T extends EventKind>(entry: Event<T>): Promise<void> {
    let result = await this.logStore.write(entry);
  }
  public async read<U>(
    from: Date,
    to?: Date,
    kind?: EventKind,
    actor?: string,
    component?: string
  ): Promise<Array<U>> {
    let longEntries = await this.logStore.read({
      from,
      to,
      actor,
      component
    });
    return longEntries.map(e => this.map(e));
  }
}

export abstract class Context {
  logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }
  public abstract performTask<
    U extends Context,
    T extends ContextAction,
    Result
  >(
    action: T,
    module: string,
    task: (context: U) => Promise<Result>
  ): Promise<Result>;
}

export abstract class DataProvider {
  dataSource: firestore.Firestore;
  constructor(dataSource: firestore.Firestore) {
    this.dataSource = dataSource;
  }
}

export abstract class ValidableContext extends Context {
  constructor(logger: Logger) {
    super(logger);
  }
  abstract validateContext(): Promise<ValidationResult>;
  abstract validateTask(
    action: ContextAction,
    componentName: string
  ): Promise<ValidationResult>;
  abstract getActorInformation(): string;

  public async performTask<U extends Context, Result>(
    action: ContextAction,
    module: string,
    task: (context: U) => Promise<Result>
  ): Promise<Result> {
    let contextValidation = await this.validateContext();
    let taskValidation = await this.validateTask(action, module);

    if (contextValidation.passed && taskValidation.passed) {
      try {
        let context = Object.assign({} as U, this);
        let result = await task(context);
        this.logger.log({
          description: `[${action}] operation performed successfully.`,
          actor: this.getActorInformation(),
          date: new Date(Date.now()),
          component: module,
          kind: "Info"
        });
        return result;
      } catch (error) {
        this.logger.log({
          description: error.message,
          actor: this.getActorInformation(),
          date: new Date(Date.now()),
          component: module,
          kind: "Error"
        });

        return Promise.reject(
          new PlatformError(
            "TASK_EXECUTION_ERROR",
            `Error while performing [${action}] operation`,
            module,
            "Please validate the context's information",
            error.stack,
            "MEDIUM",
            error.message
          )
        );
      }
    } else if (!contextValidation.passed) {
      this.logger.log({
        description: `Context Validation not passed for [${action}] operation`,
        actor: this.getActorInformation(),
        date: new Date(Date.now()),
        component: module,
        kind: "Warning"
      });
      return Promise.reject(
        new DomainError(
          "INVALID_CONTEXT",
          `Context Validation not passed for [${action}] operation`,
          module,
          "Please validate the context's information",
          undefined,
          "LOW",
          contextValidation.details.join("\n")
        )
      );
    } else {
      this.logger.log({
        description: `Task Validation not passed for [${action}] operation`,
        actor: this.getActorInformation(),
        date: new Date(Date.now()),
        component: module,
        kind: "Warning"
      });
      return Promise.reject(
        new DomainError(
          "INVALID_TASK",
          `Context Validation not passed for [${action}] operation`,
          module,
          "Please validate the context's information",
          undefined,
          "LOW",
          taskValidation.details.join("\n")
        )
      );
    }
  }
}
