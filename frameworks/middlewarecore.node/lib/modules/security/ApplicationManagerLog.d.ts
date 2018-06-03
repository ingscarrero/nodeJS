import { Store, Event, WritingResult, DataProvider } from "../common";
import { firestore } from "firebase-admin";
export declare class ApplicationManagerLog extends DataProvider implements Store<Event<"Warning" | "Error" | "Info">> {
    constructor(dataSource: firestore.Firestore);
    write(entry: Event<"Warning" | "Error" | "Info">): Promise<WritingResult>;
    read(filter?: any): Promise<Event<"Warning" | "Error" | "Info">[]>;
}
