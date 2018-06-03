export interface Action {
  description: string;
  date: Date;
  actor: string;
}

export interface Auditable {
  actions: Array<Action>;
}
