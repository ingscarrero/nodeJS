import { PlatformError, EventKind, Event } from "../common";
import { MailTransportConfiguration, Mail } from "./Communications";
import { SecurityContext, UserKind } from "../security";

const nodemailer = require("nodemailer");
const NMSPTransport = require("nodemailer-sparkpost-transport");

const { MAIL } = process.env;
export class CommunicationsManager<T extends UserKind> {
  context: SecurityContext<T>;
  private static readonly COMPONENT = "COMMUNICATIONS_MANAGER";
  constructor(context: SecurityContext<T>) {
    this.context = context;
  }

  private async sendMailByNodeMailer(
    context: SecurityContext<T>,
    mail: Mail
  ): Promise<boolean> {
    try {
      let { secret, from } = JSON.parse(MAIL!);

      if (!secret) {
        return Promise.reject(
          new PlatformError(
            "MAIL_DELIVERY_ERROR",
            "Error when sending e-mail",
            CommunicationsManager.COMPONENT,
            "Invalid configuration",
            undefined,
            "MEDIUM",
            `Error when sending email. No secret assigned to this platform's instance`
          )
        );
      }

      if (!from) {
        return Promise.reject(
          new PlatformError(
            "MAIL_DELIVERY_ERROR",
            "Error when sending e-mail",
            CommunicationsManager.COMPONENT,
            "Invalid configuration",
            undefined,
            "MEDIUM",
            `Error when sending email. No sender mail assigned to this platform's instance`
          )
        );
      }

      // let transportSettings: MailTransportConfiguration = {
      //   secret
      // };
      let transportConfiguration = NMSPTransport({ sparkPostApiKey: secret });

      let transport = nodemailer.createTransport(transportConfiguration);

      let result = await new Promise<boolean>((resolve, reject) => {
        transport.sendMail(
          { from, to: mail.to, html: mail.body },
          (err: Error, info: any) => {
            if (err) {
              return reject(
                new PlatformError(
                  "MAIL_DELIVERY_ERROR",
                  "Error when sending e-mail",
                  CommunicationsManager.COMPONENT,
                  err.message,
                  err.stack,
                  "MEDIUM",
                  `Error when sending email by the configured email provider. The Email provider couldn't process the mail sending request`
                )
              );
            } else {
              return resolve(true);
            }
          }
        );
      });
      return result;
    } catch (error) {
      return Promise.reject(
        new PlatformError(
          "MAIL_DELIVERY_ERROR",
          "Error when sending e-mail",
          CommunicationsManager.COMPONENT,
          error.message,
          error.stack,
          "MEDIUM",
          `Error when sending email by the configured email provider. The Email provider couldn't process the mail sending request`
        )
      );
    }
  }
  async sendMail(mail: Mail): Promise<boolean> {
    let result = await this.context.performTask<SecurityContext<T>, boolean>(
      "Write",
      CommunicationsManager.COMPONENT,
      async context => {
        let result = await this.sendMailByNodeMailer(context, mail);
        let event: Event<EventKind>;

        if (result) {
          event = {
            actor: context.getActorInformation(),
            component: CommunicationsManager.COMPONENT,
            date: new Date(Date.now()),
            description: `Email sent to [${mail.to}]`,
            kind: "Info"
          };
        } else {
          event = {
            actor: context.getActorInformation(),
            component: CommunicationsManager.COMPONENT,
            date: new Date(Date.now()),
            description: `Email couldn't be sent to [${mail.to}]`,
            kind: "Warning"
          };
        }

        context.logger.log(event);
        return result;
      }
    );
    return result;
  }
}
