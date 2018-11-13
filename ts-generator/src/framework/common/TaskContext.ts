import { ITaskResult, ILogger, IContext } from "../types";


abstract class TaskContext<LogEntry> {
    public readonly logger: ILogger<LogEntry>;
    public readonly context: IContext;

    protected readonly entryParser: (eventType: string, context: IContext, description: string) => LogEntry

    /**
     *
     */
    constructor(
        context: IContext,
        logger: ILogger<LogEntry>,
        entryParser: (eventType: string, context: IContext, description: string) => LogEntry) {

        this.context = context;
        this.logger = logger;
        this.entryParser = entryParser;
    }
    protected async execute<T>(task: () => Promise<T | Array<T>>, description: string): Promise<ITaskResult<T>> {
        const taskResult = {
            startedAt: new Date(),
        } as ITaskResult<T>;
        try {

            this.logger.reportInfo(this.entryParser("INFO", this.context, description));

            const comments = `Task successfully concluded: ${this.context.description}. ${description}`;

            const result = await task();

            const details = Array.isArray(result) ? `${result.length} records.` : `1 record.`;

            taskResult.comments = comments.concat(details);
            taskResult.concludedAt = new Date();
            taskResult.result = result;

            this.logger.reportInfo(this.entryParser("INFO", this.context, comments.concat(details)));

            return Promise.resolve(taskResult);

        } catch (error) {
            let errorDescription = `${error.name}
            While "${description}", the task execution has resulted in an error.
            Context:
            ${this.context.description}
            Message:
            ${error.message}
            Stack:
            ${error.stack}`;

            this.logger.reportError(this.entryParser("ERROR", this.context, errorDescription));

            taskResult.concludedAt = new Date();
            taskResult.result = error;
            taskResult.comments = errorDescription
        }
        return taskResult;
    }
}

export default TaskContext;