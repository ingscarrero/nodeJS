import { IndexableCollection, Indexable } from "../common";
import { DeviceStatus } from "../peripherals";
import { Auditable } from "../auditory";

export type DeviceSessionAction =
  | "START"
  | "STOP"
  | "PAUSE"
  | "RESUME"
  | "COMMIT"
  | "UPDATE";
export type SessionRecurrence = "NONE" | "DAILY" | "WEEKLY" | "MONTHLY";
export type SubscriptionModel = "FREEMIUM" | "BASIC" | "PREMIUM" | "PRO";

export type Collections = "Devices" | "Contacts" | "Customers";

interface BusinessCollection<T extends Collections>
  extends IndexableCollection<T> {}

export interface SessionConfiguration {
  start: Date;
  durationInMinutes: number;
  broadcastingUrl: string;
  samplingIntervalInMinutes: number;
  samplingDurationInSeconds: number;
  isBroadcasting: boolean;
  isSampling: boolean;
  recurrence: SessionRecurrence;
  recurrenceDays: Array<number>;
}

export interface Session extends SessionConfiguration {
  reason?: string;
  status: string;
  lastUpdate: string;
  lastUpdatedBy: string;
}

export interface Device {
  status: DeviceStatus;
  uuid: string;
  session?: Session;
}

export interface Contact extends Auditable, IndexableCollection<"Contacts"> {
  name: string;
  surname: string;
  email: string;
  mobile: string;
}

export interface Location {
  lat: number;
  long: number;
}
export interface Customer extends Auditable, IndexableCollection<"Customers"> {
  subscriptionDate: Date;
  subscriptionModel: SubscriptionModel;
  subscriptionTerm: number;
  placeOfBirth?: Location;
  dateOfBirth?: Date;
  profile: CustomerProfile;
}

export interface MusicPreference {
  genre: string;
  hits: number;
}

export interface GenreProfile {
  genre: string;
  likes: number;
  highlights: string;
}

export interface FollowerSubscription extends Auditable {
  follower: Indexable;
  subscriptionDate: Date;
}

export interface FollowingSubscription {
  following: Indexable;
  subscriptionDate: Date;
  isActive: boolean;
}

export type RevealLocationMode =
  | "Off"
  | "All"
  | "Followers"
  | "Following"
  | "Following & Followers";
export interface CustomerProfile extends Auditable {
  musicPreferences: Array<MusicPreference>;
  musicProfile: Array<GenreProfile>;
  photoUrl?: string;
  revealLocation: RevealLocationMode;
  location?: Location;
  likes: number;
  followers: Array<FollowerSubscription>;
  following: Array<FollowingSubscription>;
}
