import {
  Store,
  Event,
  EventKind,
  WritingResult,
  DomainError,
  DataProvider
} from "../common";
import { firestore } from "firebase-admin";

export class ApplicationManagerLog extends DataProvider
  implements Store<Event<"Warning" | "Error" | "Info">> {
  constructor(dataSource: firestore.Firestore) {
    super(dataSource);
  }
  async write(
    entry: Event<"Warning" | "Error" | "Info">
  ): Promise<WritingResult> {
    let logDocument = await this.dataSource.collection("Logs").add(entry);
    return { date: new Date(Date.now()) };
  }
  async read(filter?: any): Promise<Event<"Warning" | "Error" | "Info">[]> {
    if (!filter) {
      return Promise.reject(
        new DomainError(
          "INVALID_FILTER",
          "The query needs additional information",
          "Application Manager Log",
          "Please validate the submitted criteria",
          undefined,
          "LOW",
          "When reading the application management log, the submitted criteria hadn't the required information"
        )
      );
    }
    let { from, to } = filter;
    if (!from) {
      return Promise.reject(
        new DomainError(
          "INVALID_FILTER",
          "The query needs additional information",
          "Application Manager Log",
          "Please validate the submitted criteria",
          undefined,
          "LOW",
          "When reading the application management log, the submitted criteria hadn't the required information"
        )
      );
    }

    let logCollection = await this.dataSource.collection("Logs");
    let logQuery = logCollection.where("date", ">", from);
    if (to) {
      logQuery = logQuery.where("date", "<", to);
    }
    Object.keys(filter).forEach(k => {
      if (k != "from" && k != "to") {
        logQuery = logQuery.where(k, "==", filter[k]);
      }
    });

    let { empty, docs } = await logQuery.get();
    if (empty) {
      return Promise.reject(
        new DomainError(
          "NOT_FOUND",
          "There were no matches for the submitted criteria",
          "Application Manager Log",
          "Please validate the submitted information",
          undefined,
          "LOW",
          "When fetching the log entries, there were no matches for the submitted criteria"
        )
      );
    }

    let entries = docs.map((d: any) =>
      Object.assign({} as Event<"Warning" | "Error" | "Info">, d.data())
    );

    return entries;
  }
}
