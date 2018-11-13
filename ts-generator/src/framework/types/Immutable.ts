export abstract class Immutable<T> {
    private data: Readonly<T>;
    /**
     *
     */
    constructor(data?: T) {
        this.data = data ? data : <T>{};
    }

    public getState(): Readonly<T> {
        return Object.assign({}, this.data) as Readonly<T>;
    }

    protected setProperty(name: keyof T, value: T[keyof T]) {
        this.data = Object.assign(this.data, ({ [name]: value }));
        this.handleSetProperty(name, value);
        return this;
    }

    protected handleSetProperty(name: keyof T, value: T[keyof T]): void {
        name;
        value;
    }

}