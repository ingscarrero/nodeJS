import { IndexableCollection } from "../common";

export type DeviceStatus =
  | "ACTIVE"
  | "IDLE"
  | "NEW"
  | "OFFLINE"
  | "ONLINE"
  | "READY";
export type MountStatus =
  | "ASSIGNED"
  | "NEW"
  | "OFFLINE"
  | "ONLINE"
  | "CANCELED";

export type Collections = "Mounts" | "VGEARS";

export interface PeripheralsCollection<T extends Collections>
  extends IndexableCollection<T> {}

export interface Mount extends PeripheralsCollection<"Mounts"> {
  status: MountStatus;
  owner?: IndexableCollection<"Customers">;
  pathSuffix?: string;
}

export interface VGEAR extends PeripheralsCollection<"VGEARS"> {
  status: DeviceStatus;
  owner?: IndexableCollection<"Customers">;
  macAddress?: string;
  lastStatusReportTime?: Date;
  lastUpdateTime?: Date;
  coreVersion?: string;
  mount?: IndexableCollection<"Mounts">;
  partNumber: string;
}
