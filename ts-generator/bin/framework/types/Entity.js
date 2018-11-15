"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Immutable_1 = require("./Immutable");
const Common_1 = require("./Common");
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
    static register(collection, factory) {
        this.factories[collection] = factory;
    }
    static use(collection, context, data) {
        if (!Object.keys(this.factories).includes(collection)) {
            const error = new Error(`No factory has been defined for the collection ${collection}`);
            error.name = Common_1.ERRORS.NOT_SUPPORTED;
            Error.captureStackTrace(error);
            throw error;
        }
        return this.factories[collection](context, data);
    }
}
Entity.factories = {};
exports.Entity = Entity;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW50aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2ZyYW1ld29yay90eXBlcy9FbnRpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQ0FBd0M7QUFFeEMscUNBQWtDO0FBR2xDLE1BQXNCLE1BQVUsU0FBUSxxQkFBWTtJQUdoRCxZQUFZLElBQVEsRUFBRSxPQUFrQjtRQUNwQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDWixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUMzQixDQUFDO0lBRU0sUUFBUSxDQUFDLFFBQW9CO1FBQ2hDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO2FBQ2hCLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFVLEdBQUcsQ0FBQzthQUN4QixNQUFNLENBQ0gsQ0FBQyxRQUFtQixFQUFFLElBQWEsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBRSxDQUFDLEVBQ2pGLElBQUksQ0FBQyxDQUFDO0lBQ3BCLENBQUM7SUFFTSxNQUFNLENBQUMsUUFBUSxDQUFpQixVQUFrQixFQUFFLE9BQTZFO1FBQ3BJLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUcsT0FBd0QsQ0FBQztJQUMxRixDQUFDO0lBRU0sTUFBTSxDQUFDLEdBQUcsQ0FBaUIsVUFBa0IsRUFBRSxPQUFpQixFQUFFLElBQXFCO1FBQzFGLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDbkQsTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsa0RBQWtELFVBQVUsRUFBRSxDQUFDLENBQUM7WUFDeEYsS0FBSyxDQUFDLElBQUksR0FBRyxlQUFNLENBQUMsYUFBYSxDQUFDO1lBQ2xDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvQixNQUFNLEtBQUssQ0FBQTtTQUNkO1FBQ0QsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNyRCxDQUFDOztBQTNCYyxnQkFBUyxHQUFxRSxFQUFFLENBQUM7QUFEcEcsd0JBNkJDIn0=