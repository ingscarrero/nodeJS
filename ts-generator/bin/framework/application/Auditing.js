"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
class Auditable extends types_1.Entity {
    constructor(context, data, trace) {
        super(data, context);
        this.trace = trace || new Array();
    }
    setState(newState) {
        const { actor, description, provider, user } = this.context;
        this.stateDetails = new Array();
        super.setState(newState);
        this.trace.push({
            actor,
            details: this.stateDetails,
            description,
            provider,
            user,
            date: new Date()
        });
    }
    handleSetProperty(name, value) {
        if (this.stateDetails) {
            this.stateDetails.push({
                field: name,
                from: this.getState()[name],
                to: value
            });
        }
    }
}
exports.Auditable = Auditable;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXVkaXRpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZnJhbWV3b3JrL2FwcGxpY2F0aW9uL0F1ZGl0aW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsb0NBQXdEO0FBY3hELE1BQXNCLFNBQWdDLFNBQVEsY0FBUztJQUluRSxZQUFZLE9BQWlCLEVBQUUsSUFBUSxFQUFFLEtBQTZCO1FBQ2xFLEtBQUssQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDckIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLElBQUksSUFBSSxLQUFLLEVBQWtCLENBQUM7SUFDdEQsQ0FBQztJQUdNLFFBQVEsQ0FBQyxRQUFvQjtRQUVoQyxNQUFNLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQVEsQ0FBQztRQUU3RCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksS0FBSyxFQUF3QixDQUFDO1FBRXRELEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFekIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7WUFDWixLQUFLO1lBQ0wsT0FBTyxFQUFFLElBQUksQ0FBQyxZQUFZO1lBQzFCLFdBQVc7WUFDWCxRQUFRO1lBQ1IsSUFBSTtZQUNKLElBQUksRUFBRSxJQUFJLElBQUksRUFBRTtTQUNuQixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRVMsaUJBQWlCLENBQUMsSUFBYSxFQUFFLEtBQWlCO1FBQ3hELElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNuQixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQztnQkFDbkIsS0FBSyxFQUFFLElBQUk7Z0JBQ1gsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUM7Z0JBQzNCLEVBQUUsRUFBRSxLQUFLO2FBQ1osQ0FBQyxDQUFBO1NBQ0w7SUFDTCxDQUFDO0NBQ0o7QUFyQ0QsOEJBcUNDIn0=