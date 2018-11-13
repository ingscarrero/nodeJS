/**
 *
 *
 * @class ClassGenerator
 */
declare class ClassGenerator {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof ClassGenerator
     */
    private path;
    /**
     *
     */
    constructor(path: string);
    generateModules(): Promise<string>;
}
export default ClassGenerator;
