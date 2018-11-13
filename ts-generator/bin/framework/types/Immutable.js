"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Immutable {
    /**
     *
     */
    constructor(data) {
        this.data = data ? data : {};
    }
    getState() {
        return Object.assign({}, this.data);
    }
    setProperty(name, value) {
        this.data = Object.assign(this.data, ({ [name]: value }));
        this.handleSetProperty(name, value);
        return this;
    }
    handleSetProperty(name, value) {
        name;
        value;
    }
}
exports.Immutable = Immutable;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW1tdXRhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2ZyYW1ld29yay90eXBlcy9JbW11dGFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxNQUFzQixTQUFTO0lBRTNCOztPQUVHO0lBQ0gsWUFBWSxJQUFRO1FBQ2hCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFJLEVBQUUsQ0FBQztJQUNwQyxDQUFDO0lBRU0sUUFBUTtRQUNYLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBZ0IsQ0FBQztJQUN2RCxDQUFDO0lBRVMsV0FBVyxDQUFDLElBQWEsRUFBRSxLQUFpQjtRQUNsRCxJQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDMUQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNwQyxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRVMsaUJBQWlCLENBQUMsSUFBYSxFQUFFLEtBQWlCO1FBQ3hELElBQUksQ0FBQztRQUNMLEtBQUssQ0FBQztJQUNWLENBQUM7Q0FFSjtBQXhCRCw4QkF3QkMifQ==