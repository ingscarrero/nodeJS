import { Permit, User, UserKind } from "./Security";
import { ApplicationContext } from "./ApplicationContext";
import { ApplicationManager } from "./ApplicationManager";
import {
  ValidableContext,
  Indexable,
  Context,
  ContextAction,
  ValidationResult
} from "../common";
const NMSPTransport = require("nodemailer-sparkpost-transport");
const { MAIL } = process.env;
export class SecurityContext<T extends UserKind> extends ValidableContext {
  // PROPERTIES
  readonly actor: User<T>;
  readonly clientAddress: string;
  readonly applicationContext: ApplicationContext;
  readonly credential: Indexable;

  // INITIALIZERS
  constructor(
    actor: User<T>,
    clientAddress: string,
    applicationContext: ApplicationContext
  ) {
    super(applicationContext.logger);

    this.actor = actor;
    this.clientAddress = clientAddress;
    this.applicationContext = applicationContext;
    this.credential = actor.credentials![0];
  }

  public async performTask<U extends Context, Result>(
    action: ContextAction,
    module: string,
    task: (context: U) => Promise<Result>
  ) {
    let result = await this.applicationContext.performTask<
      ApplicationContext,
      Result
    >(action, module, async appContext => {
      let result = await super.performTask<U, Result>(action, module, task);
      return result;
    });

    return result;
  }
  // METHODS
  async validateTask<T extends ContextAction>(
    action: T,
    componentName: string
  ): Promise<ValidationResult> {
    let result: ValidationResult = {
      passed: true,
      details: new Array<string>()
    };

    if (!this.actor) {
      result.passed = false;
      result.details.push(
        "Identity's account that is assigned to this context hasn't been properly initialized"
      );
      return result;
    }

    if (!this.actor.role) {
      result.passed = false;
      result.details.push(
        "Identity's account that is assigned to this context has no role associated"
      );
      return result;
    }

    let profile = await ApplicationManager.getRoleProfile(this.actor.role);

    let component = await ApplicationManager.getComponentIndexByName(
      componentName
    );

    if (!component) {
      result.passed = false;
      result.details.push("Task's component is not a valid one");
      return result;
    }

    let now = new Date(Date.now());

    let permit = profile.permits.find(
      (p: Permit) =>
        p.component.id == component.id &&
        p.issuedOn < now &&
        new Date(
          p.issuedOn.getFullYear(),
          p.issuedOn.getMonth(),
          p.issuedOn.getDate() + p.validity
        ) > now
    );

    if (!permit) {
      result.passed = false;
      result.details.push(
        "Identity's account that is assigned to this context has no authorization over this component"
      );
      return result;
    }

    switch (action) {
      case "Read":
        if (!permit.authorization.canRead) {
          result.passed = false;
          result.details.push(
            "Identity's account that is assigned to this context has no reading authorization over this component"
          );
          return result;
        }
        break;
      case "Write":
        if (!permit.authorization.canWrite) {
          result.passed = false;
          result.details.push(
            "Identity's account that is assigned to this context has no writing authorization over this component"
          );
          return result;
        }
        break;
      case "Delete":
        if (!permit.authorization.canWrite) {
          result.passed = false;
          result.details.push(
            "Identity's account that is assigned to this context has no writing authorization over this component"
          );
          return result;
        }
        break;
      default:
        break;
    }
    return result;
  }
  async validateContext(): Promise<ValidationResult> {
    let result: ValidationResult = {
      passed: true,
      details: new Array<string>()
    };

    if (!this.credential) {
      result.passed = false;
      result.details.push(
        "We were unable to determine the credentials validated for this context"
      );
      return result;
    }

    if (!this.clientAddress) {
      result.passed = false;
      result.details.push(
        "We were unable to determine the client IP that is assigned to this context"
      );
      return result;
    }

    if (!this.actor) {
      result.passed = false;
      result.details.push(
        "Identity's account that is assigned to this context hasn't been properly initialized"
      );
      return result;
    }

    if (!this.actor.validatedOn) {
      result.passed = false;
      result.details.push(
        "Identity's account that is assigned to this context hasn't yet been validated. Please check your account's email to a message with corresponding directions to fullfil the account's validation process"
      );
      return result;
    }

    if (!this.actor.role) {
      result.passed = false;
      result.details.push(
        "Identity's account that is assigned to this context has no role associated"
      );
      return result;
    }

    if (!this.applicationContext) {
      result.passed = false;
      result.details.push(
        "We were unable to determine the application context through which this context was initialized"
      );
    }

    let profile = await ApplicationManager.getRoleProfile(this.actor.role);

    let now = new Date(Date.now());

    let permit = profile.permits.find(
      (p: Permit) =>
        p.component.id == this.applicationContext.appID &&
        p.issuedOn < now &&
        new Date(
          p.issuedOn.getFullYear(),
          p.issuedOn.getMonth(),
          p.issuedOn.getDate() + p.validity
        ) > now
    );

    if (!permit) {
      result.passed = false;
      result.details.push(
        "Identity's account that is assigned to this context has no authorization over this channel"
      );
      return result;
    }

    if (!permit.authorization.canRead) {
      result.passed = false;
      result.details.push(
        "Identity's account that is assigned to this context has no authorization over this channel"
      );
      return result;
    }

    return result;
  }

  getActorInformation(): string {
    return `Identity: [${this.actor.identity.id}] from IP:[${
      this.clientAddress
    }] through Application:[${this.applicationContext.appID}]/${
      this.applicationContext.appVersion
    }`;
  }
}
