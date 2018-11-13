export declare abstract class Immutable<T> {
    private data;
    /**
     *
     */
    constructor(data?: T);
    getState(): Readonly<T>;
    protected setProperty(name: keyof T, value: T[keyof T]): this;
    protected handleSetProperty(name: keyof T, value: T[keyof T]): void;
}
