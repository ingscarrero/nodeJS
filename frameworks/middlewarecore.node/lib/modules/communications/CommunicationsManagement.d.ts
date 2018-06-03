import { Mail } from "./Communications";
import { SecurityContext, UserKind } from "../security";
export declare class CommunicationsManager<T extends UserKind> {
    context: SecurityContext<T>;
    private static readonly COMPONENT;
    constructor(context: SecurityContext<T>);
    private sendMailByNodeMailer(context, mail);
    sendMail(mail: Mail): Promise<boolean>;
}
