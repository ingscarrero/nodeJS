"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class TaskContext {
    /**
     *
     */
    constructor(context, logger, entryParser) {
        this.context = context;
        this.logger = logger;
        this.entryParser = entryParser;
    }
    execute(task, description) {
        return __awaiter(this, void 0, void 0, function* () {
            const taskResult = {
                startedAt: new Date(),
            };
            try {
                this.logger.reportInfo(this.entryParser("INFO", this.context, description));
                const comments = `Task successfully concluded: ${this.context.description}. ${description}`;
                const result = yield task();
                const details = Array.isArray(result) ? `${result.length} records.` : `1 record.`;
                taskResult.comments = comments.concat(details);
                taskResult.concludedAt = new Date();
                taskResult.result = result;
                this.logger.reportInfo(this.entryParser("INFO", this.context, comments.concat(details)));
                return Promise.resolve(taskResult);
            }
            catch (error) {
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
                taskResult.comments = errorDescription;
            }
            return taskResult;
        });
    }
}
exports.default = TaskContext;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFza0NvbnRleHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZnJhbWV3b3JrL2NvbW1vbi9UYXNrQ29udGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBR0EsTUFBZSxXQUFXO0lBTXRCOztPQUVHO0lBQ0gsWUFDSSxPQUFpQixFQUNqQixNQUF5QixFQUN6QixXQUFvRjtRQUVwRixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztJQUNuQyxDQUFDO0lBQ2UsT0FBTyxDQUFJLElBQWlDLEVBQUUsV0FBbUI7O1lBQzdFLE1BQU0sVUFBVSxHQUFHO2dCQUNmLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTthQUNOLENBQUM7WUFDcEIsSUFBSTtnQkFFQSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBRTVFLE1BQU0sUUFBUSxHQUFHLGdDQUFnQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsS0FBSyxXQUFXLEVBQUUsQ0FBQztnQkFFNUYsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLEVBQUUsQ0FBQztnQkFFNUIsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxXQUFXLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQztnQkFFbEYsVUFBVSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUMvQyxVQUFVLENBQUMsV0FBVyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBQ3BDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO2dCQUUzQixJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUV6RixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7YUFFdEM7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDWixJQUFJLGdCQUFnQixHQUFHLEdBQUcsS0FBSyxDQUFDLElBQUk7cUJBQzNCLFdBQVc7O2NBRWxCLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVzs7Y0FFeEIsS0FBSyxDQUFDLE9BQU87O2NBRWIsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUVoQixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQztnQkFFbkYsVUFBVSxDQUFDLFdBQVcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO2dCQUNwQyxVQUFVLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztnQkFDMUIsVUFBVSxDQUFDLFFBQVEsR0FBRyxnQkFBZ0IsQ0FBQTthQUN6QztZQUNELE9BQU8sVUFBVSxDQUFDO1FBQ3RCLENBQUM7S0FBQTtDQUNKO0FBRUQsa0JBQWUsV0FBVyxDQUFDIn0=