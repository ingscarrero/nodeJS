"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Immutable_1 = require("./Immutable");
class Entity extends Immutable_1.Immutable {
    constructor(data, context) {
        super(data);
        this.context = context;
    }
    setState(newState) {
        Object.keys(newState)
            .map(key => key)
            .reduce((previous, next) => previous.setProperty(next, newState[next]), this);
    }
}
exports.Entity = Entity;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW50aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2ZyYW1ld29yay90eXBlcy9FbnRpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQ0FBd0M7QUFJeEMsTUFBc0IsTUFBVSxTQUFRLHFCQUFZO0lBRWhELFlBQVksSUFBUSxFQUFFLE9BQWtCO1FBQ3BDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNaLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0lBQzNCLENBQUM7SUFFTSxRQUFRLENBQUMsUUFBb0I7UUFDaEMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7YUFDaEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQVUsR0FBRyxDQUFDO2FBQ3hCLE1BQU0sQ0FDSCxDQUFDLFFBQW1CLEVBQUUsSUFBYSxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFFLENBQUMsRUFDakYsSUFBSSxDQUFDLENBQUM7SUFDcEIsQ0FBQztDQUNKO0FBZEQsd0JBY0MifQ==