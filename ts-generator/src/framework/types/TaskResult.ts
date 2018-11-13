export interface ITaskResult<T> {
    startedAt: Date;
    concludedAt: Date;
    result: T | Array<T> | Error;
    comments: string;
}