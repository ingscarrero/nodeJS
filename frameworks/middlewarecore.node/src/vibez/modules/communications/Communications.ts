export interface MailTransportConfiguration {
  secret: string;
}
export interface Mail {
  from: string;
  to: string | Array<string>;
  cc?: string | Array<string>;
  subject: string;
  body: string;
}
