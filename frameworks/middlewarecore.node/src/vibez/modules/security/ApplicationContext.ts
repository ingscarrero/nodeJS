import { ApplicationManager } from "./ApplicationManager";
import { ApplicationLogger } from "./ApplicationLogger";
import { Permit, VERSION_FORMAT } from "./Security";
import {
  ValidableContext,
  IndexableCollection,
  Store,
  Event,
  ValidationResult,
  ContextAction
} from "../common";

const NMSPTransport = require("nodemailer-sparkpost-transport");
const { MAIL } = process.env;

export class ApplicationContext extends ValidableContext {
  component?: IndexableCollection<"Components">;
  appID: string;
  appKey: string;
  appAddress: string;
  appVersion: {
    major: number;
    minor: number;
    patch: number;
  };

  constructor(
    appID: string,
    appKey: string,
    appAddress: string,
    appVersion: string,
    store: Store<Event<"Warning" | "Error" | "Info">>
  ) {
    let logger = new ApplicationLogger(store);
    super(logger);

    let appVersionMatches = appVersion.match(VERSION_FORMAT);

    if (!appVersionMatches) {
      let entry: Event<"Error"> = {
        actor: this.getActorInformation(),
        component: appID,
        date: new Date(Date.now()),
        description:
          "Failed Application Context Initialization because of invalid component version",
        kind: "Error"
      };
      this.logger.log(entry);
      throw new Error("Invalid app version");
    }

    let [major, minor, patch] = [
      ...appVersionMatches.slice(1).map(item => parseInt(item))
    ];

    this.appVersion = { major, minor, patch };

    this.appID = appID;
    this.appAddress = appAddress;
    this.appKey = appKey;
  }

  async validateContext(): Promise<ValidationResult> {
    let result: ValidationResult = {
      passed: true,
      details: new Array<string>()
    };

    if (!this.appID) {
      result.passed = false;
      result.details.push(
        "We were unable to determine the app ID that is assigned to this context"
      );
      return result;
    }

    if (!this.appKey) {
      result.passed = false;
      result.details.push(
        "We were unable to determine the app key that is assigned to this context"
      );
      return result;
    }

    if (!this.appAddress) {
      result.passed = false;
      result.details.push(
        "We were unable to determine the app origin that is assigned to this context"
      );
      return result;
    }

    if (!this.appVersion) {
      result.passed = false;
      result.details.push(
        "We were unable to determine the app version that is assigned to this context"
      );
      return result;
    }

    let appUser = await ApplicationManager.authenticateApp(
      this.appID,
      this.appKey,
      this.appVersion
    );

    if (!appUser) {
      result.passed = false;
      result.details.push(
        "App's account that is assigned to this context hasn't been properly initialized"
      );
      return result;
    }

    if (!appUser.validatedOn) {
      result.passed = false;
      result.details.push(
        "App's account that is assigned to this context hasn't yet been validated. Please check your account's email to a message with corresponding directions to fullfil the account's validation process"
      );
      return result;
    }

    return result;
  }
  async validateTask<T extends ContextAction>(
    action: T,
    componentName: string
  ): Promise<ValidationResult> {
    let result: ValidationResult = {
      passed: true,
      details: new Array<string>()
    };

    let appUser = await ApplicationManager.authenticateApp(
      this.appID,
      this.appKey,
      this.appVersion
    );

    if (!appUser) {
      result.passed = false;
      result.details.push(
        "App's account that is assigned to this context hasn't been properly initialized"
      );
      return result;
    }

    if (!appUser.role) {
      result.passed = false;
      result.details.push(
        "App's account that is assigned to this context has no role associated"
      );
      return result;
    }

    let profile = await ApplicationManager.getRoleProfile(appUser.role);

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
        "App's account that is assigned to this context has no authorization over this component"
      );
      return result;
    }

    switch (action) {
      case "Read":
        if (!permit.authorization.canRead) {
          result.passed = false;
          result.details.push(
            "App's account that is assigned to this context has no reading authorization over this component"
          );
          return result;
        }
        break;
      case "Write":
        if (!permit.authorization.canWrite) {
          result.passed = false;
          result.details.push(
            "App's account that is assigned to this context has no writing authorization over this component"
          );
          return result;
        }
        break;
      case "Delete":
        if (!permit.authorization.canWrite) {
          result.passed = false;
          result.details.push(
            "App's account that is assigned to this context has no writing authorization over this component"
          );
          return result;
        }
        break;
      default:
        break;
    }
    return result;
  }
  getActorInformation(): string {
    return `App: [${this.appID}] with Version: [${this.appVersion.major}, ${
      this.appVersion.minor
    }, ${this.appVersion.patch}]from IP:[${this.appAddress}]`;
  }
}
