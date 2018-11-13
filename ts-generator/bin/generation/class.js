"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
/**
 *
 *
 * @class ClassGenerator
 */
class ClassGenerator {
    /**
     *
     */
    constructor(path) {
        this.path = path;
    }
    generateModules() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const schema = fs_1.default.readFileSync(this.path, { encoding: "utf-8" });
                const config = JSON.parse(schema);
                if (!config.hasOwnProperty("outputFolder")) {
                    return Promise.reject(new Error("No output directory has been defined."));
                }
                const { outputFolder } = config;
                fs_1.default.mkdirSync(outputFolder);
                const entityFolder = `${outputFolder}/entities`;
                fs_1.default.mkdirSync(entityFolder);
                if (!config.hasOwnProperty("entities")) {
                    return Promise.reject(new Error("No interfaces have been defined."));
                }
                const entities = config.entities
                    .map((i) => (Object.assign({ alias: pascalCase(i.name) }, i)));
                generateInterfaces(entities, entityFolder);
                generateIndex(entityFolder, entities);
                const storeFolder = `${outputFolder}/model`;
                fs_1.default.mkdirSync(storeFolder);
                generateStores(entities, storeFolder);
                return Promise.resolve("Done");
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
}
exports.default = ClassGenerator;
function generateInterfaces(entities, outputFolder) {
    entities.forEach((entity) => {
        fs_1.default.writeFileSync(`${outputFolder}/${entity.alias}.ts`, `
${generateImports(entity)}
${generateStringLiterals(entity)}
/**
* @interface I${entity.alias} 
* ${entity.description}
${entity.extends ? entity.extends.map((parent) => `* @extends ${parent}
`).join("") : ""} 
* 
*/
interface I${entity.alias} ${entity.extends ? `extends ${entity.extends}` : ""} {
    ${generateFields(entity)}
}

export default I${entity.alias};`);
    });
}
function generateStores(entities, outputFolder) {
    entities.forEach((entity) => {
        fs_1.default.writeFileSync(`${outputFolder}/${entity.alias}.ts`, `
${generateImports(entity)}
import * as Entities from '../entities'; 
${importStringLiterals(entity)}

/**
* @class ${entity.alias} 
* ${entity.description}
* @implements I${entity.alias}
${entity.extends ? entity.extends.map((parent) => `* @extends ${parent}
`).join("") : ""} 
* 
*/
class ${entity.alias} implements Entities.I${entity.alias} ${entity.extends ? `extends ${entity.extends}` : ""} {
    ${generateFields(entity, false)}
}

export default ${entity.alias};`);
    });
}
function generateImports(entity) {
    return entity.dependencies ?
        entity.dependencies.map((dependency) => `
import * as ${dependency.alias} from '${dependency.path}';`).join("") : "";
}
function generateFields(entity, includeComments = true) {
    return entity.fields.map((field) => `
    ${includeComments ? `/**
    * @public
    * @attribute
    * ${field.description}.
    * @type {${generateFieldType(field, entity)}}
    * @memberof I${entity.alias}
    */` : ""}
    ${generateFieldName(field)}: ${generateFieldType(field, entity)};`).join("");
}
function generateFieldType(field, entity) {
    return field.values ? generateFieldStringLiteralName(entity.alias, field.name) : field.type;
}
function generateFieldName(field) {
    return field.required ? camelCase(field.name) : `
    ${camelCase(field.name)}?`;
}
function generateStringLiterals(entity) {
    return entity.fields.map((field) => generateFieldStringLiterals(entity.alias, field))
        .join("\n");
}
function generateFieldStringLiterals(entityAlias, field) {
    return field.values ?
        `export type ${generateFieldStringLiteralName(entityAlias, field.name)} = "${field.values.join(`" | "`)}";` :
        "";
}
function importStringLiterals(entity) {
    const stringLiterals = entity.fields.filter((field) => Array.isArray(field.values) && field.values.length).map((field) => generateFieldStringLiteralName(entity.alias, field.name));
    return (Array.isArray(stringLiterals) && stringLiterals.length) ? `import { ${stringLiterals} } from '../entities';` : "";
}
function exportStringLiterals(entity) {
    const stringLiterals = entity.fields.filter((field) => Array.isArray(field.values) && field.values.length).map((field) => generateFieldStringLiteralName(entity.alias, field.name));
    return (Array.isArray(stringLiterals) && stringLiterals.length) ? `export { ${stringLiterals} } from './${entity.alias}'` : "";
}
function generateFieldStringLiteralName(entityAlias, fieldName) {
    return `${entityAlias}${pascalCase(fieldName)}Options`;
}
function generateIndex(outputFolder, interfaces) {
    fs_1.default.writeFileSync(`${outputFolder}/index.ts`, `
    ${interfaces.map((i) => `
    import I${i.alias} from './${i.alias}';`).join("")}
    
    ${interfaces.map((entity) => exportStringLiterals(entity)).join(";")}

    export { 
        ${interfaces.map((i) => `I${i.alias}`)} 
    };`);
}
function camelCase(value) {
    return value.replace(/\s(.)/g, ($1) => $1.toUpperCase()).replace(/\s/g, '').replace(/^(.)/, ($1) => $1.toLowerCase());
}
function pascalCase(value) {
    const [initial, ...remaining] = camelCase(value);
    return initial.toLocaleUpperCase().concat(...remaining);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZ2VuZXJhdGlvbi9jbGFzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUEsNENBQW9CO0FBQ3BCOzs7O0dBSUc7QUFDSCxNQUFNLGNBQWM7SUFXaEI7O09BRUc7SUFDSCxZQUFZLElBQVk7UUFDcEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUVZLGVBQWU7O1lBRXhCLElBQUk7Z0JBRUEsTUFBTSxNQUFNLEdBQUcsWUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7Z0JBQ2pFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBRWxDLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxFQUFFO29CQUN4QyxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsdUNBQXVDLENBQUMsQ0FBQyxDQUFDO2lCQUM3RTtnQkFFRCxNQUFNLEVBQUUsWUFBWSxFQUFFLEdBQUcsTUFBTSxDQUFDO2dCQUVoQyxZQUFFLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUUzQixNQUFNLFlBQVksR0FBRyxHQUFHLFlBQVksV0FBVyxDQUFDO2dCQUNoRCxZQUFFLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUUzQixJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsRUFBRTtvQkFDcEMsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLGtDQUFrQyxDQUFDLENBQUMsQ0FBQztpQkFDeEU7Z0JBRUQsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVE7cUJBQzNCLEdBQUcsQ0FBQyxDQUFDLENB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