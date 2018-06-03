import { IndexableCollection, Indexable, Describable } from "../common";
import { Auditable } from "../auditory";

export const VERSION_FORMAT = /(\d)\.(\d)\.(\d)/;
export const DEFAULT_EXPIRATION_SECONDS = 172800;
export const DEFAULT_MODULE = "*";
export const MIN_PASSWORD_LENGTH = 6;
export type CredentialProvider = "Local" | "Facebook";

export type Collections = "Identities" | "Roles" | "Components" | "Users";

export interface SecurityCollection<T extends Collections>
  extends IndexableCollection<T> {}

export interface Credential extends Indexable {
  issuer: CredentialProvider;
  token?: string;
  password?: string;
  expiration: number;
  issuedOn: Date;
  validatedOn: Date;
}

export type UserKind = "END_USER" | "CORPORATE" | "COMPONENT";
export interface User<T extends UserKind>
  extends Auditable,
    SecurityCollection<"Users"> {
  readonly kind: T;
  readonly identity: IndexableCollection<"Identities">;
  role: IndexableCollection<"Roles">;
  credentials?: Array<Credential>;
  validatedOn?: Date;
  resetRequest?: { id: string; ipAddress: string; date: Date };
}

export interface Role
  extends Auditable,
    Describable,
    SecurityCollection<"Roles"> {
  profile?: Profile;
}

export interface Authorization {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
}

export type ComponentKind = "SERVICE" | "PRODUCT" | "RESOURCE";
export interface Component<T extends ComponentKind>
  extends Auditable,
    Describable,
    SecurityCollection<"Components"> {
  kind: T;
  parent?: IndexableCollection<"Components">;
  children?: Array<IndexableCollection<"Components">>;
  enabled: boolean;
  version: { major: number; minor: number; patch: number };
}

export interface Permit {
  component: IndexableCollection<"Components">;
  authorization: Authorization;
  issuedOn: Date;
  validity: number;
}
export interface Profile extends Auditable, Describable {
  permits: Array<Permit>;
}

export interface Identity extends Auditable, SecurityCollection<"Identities"> {
  contact: IndexableCollection<"Contacts">;
}
