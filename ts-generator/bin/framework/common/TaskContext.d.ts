import { ITaskResult, ILogger, IContext } from "../types";
declare abstract class TaskContext<LogEntry> {
    readonly logger: ILogger<LogEntry>;
    readonly context: IContext;
    protected readonly entryParser: (eventType: string, context: IContext, description: string) => LogEntry;
    /**
     *
     */
    constructor(context: IContext, logger: ILogger<LogEntry>, entryParser: (eventType: string, context: IContext, description: string) => LogEntry);
    protected execute<T>(task: () => Promise<T | Array<T>>, description: string): Promise<ITaskResult<T>>;
}
export default TaskContext;
