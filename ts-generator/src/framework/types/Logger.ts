export interface ILogger<T> {
    reportInfo(entry: T): Promise<void>;
    reportError(entry: T): Promise<void>;
    reportWarning(entry: T): Promise<void>;
    read(filter: () => {}): Promise<Array<T>>;
    findByKey(key: () => string): Promise<T>;
}