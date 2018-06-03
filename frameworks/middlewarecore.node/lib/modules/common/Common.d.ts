export interface Describable {
    name: string;
    description?: string;
    shortDescription: string;
}
export interface Indexable {
    id: string;
}
export interface IndexableCollection<T extends string> extends Indexable {
    readonly collection: T;
}
export interface JSONResponse<T> {
    code: number;
    error?: Error;
    message?: T;
    reason?: string;
}
export declare type Collections = "Errors";
export declare type VibezErrorPriority = "LOW" | "MEDIUM" | "HIGH";
export declare type ContextAction = "Read" | "Delete" | "Write";
export declare type EventKind = "Info" | "Warning" | "Error";
export interface CommonCollection<T extends Collections> extends IndexableCollection<T> {
}
export interface Event<T extends EventKind> {
    kind: T;
    date: Date;
    description: string;
    actor: string;
    component: string;
}
export interface WritingResult {
    date: Date;
}
export interface Store<T> {
    write(entry: T): Promise<WritingResult>;
    read(filter?: any): Promise<Array<T>>;
}
export interface ValidationResult {
    passed: boolean;
    details: Array<string>;
}
