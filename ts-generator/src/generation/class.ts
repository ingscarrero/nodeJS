import fs from "fs";
/**
 *
 *
 * @class ClassGenerator
 */
class ClassGenerator {

    /**
     *
     *
     * @private
     * @type {string}
     * @memberof ClassGenerator
     */
    private path: string;

    /**
     *
     */
    constructor(path: string) {
        this.path = path;
    }

    public async generateModules(): Promise<string> {

        try {

            const schema = fs.readFileSync(this.path, { encoding: "utf-8" });
            const config = JSON.parse(schema);

            if (!config.hasOwnProperty("outputFolder")) {
                return Promise.reject(new Error("No output directory has been defined."));
            }

            const { outputFolder } = config;

            fs.mkdirSync(outputFolder);

            const entityFolder = `${outputFolder}/entities`;
            fs.mkdirSync(entityFolder);

            if (!config.hasOwnProperty("entities")) {
                return Promise.reject(new Error("No interfaces have been defined."));
            }

            const entities = config.entities
                .map((i: any) => ({ alias: pascalCase(i.name), ...i }));

            generateInterfaces(entities, entityFolder);
            generateIndex(entityFolder, entities);

            const storeFolder = `${outputFolder}/model`;
            fs.mkdirSync(storeFolder);

            generateStores(entities, storeFolder);

            return Promise.resolve("Done");

        } catch (error) {
            return Promise.reject(error);
        }




    }
}

export default ClassGenerator;

function generateInterfaces(entities: Array<any>, outputFolder: string) {

    entities.forEach((entity: any) => {
        fs.writeFileSync(`${outputFolder}/${entity.alias}.ts`, `
${generateImports(entity)}
${generateStringLiterals(entity)}
/**
* @interface I${entity.alias} 
* ${entity.description}
${entity.extends ? entity.extends.map((parent: string) => `* @extends ${parent}
`).join("") : ""} 
* 
*/
interface I${entity.alias} ${entity.extends ? `extends ${entity.extends}` : ""} {
    ${generateFields(entity)}
}

export default I${entity.alias};`
        );
    });
}

function generateStores(entities: Array<any>, outputFolder: string) {

    entities.forEach((entity: any) => {
        fs.writeFileSync(`${outputFolder}/${entity.alias}.ts`, `
${generateImports(entity)}
import * as Entities from '../entities'; 
${importStringLiterals(entity)}

/**
* @class ${entity.alias} 
* ${entity.description}
* @implements I${entity.alias}
${entity.extends ? entity.extends.map((parent: string) => `* @extends ${parent}
`).join("") : ""} 
* 
*/
class ${entity.alias} implements Entities.I${entity.alias} ${entity.extends ? `extends ${entity.extends}` : ""} {
    ${generateFields(entity, false)}
}

export default ${entity.alias};`
        );
    });
}

function generateImports(entity: any) {
    return entity.dependencies ?
        entity.dependencies.map((dependency: any) => `
import * as ${dependency.alias} from '${dependency.path}';`).join("") : "";
}

function generateFields(entity: any, includeComments = true) {
    return entity.fields.map((field: any) => `
    ${includeComments ? `/**
    * @public
    * @attribute
    * ${field.description}.
    * @type {${generateFieldType(field, entity)}}
    * @memberof I${entity.alias}
    */` : ""}
    ${generateFieldName(field)}: ${generateFieldType(field, entity)};`).join("");
}

function generateFieldType(field: any, entity: any) {
    return field.values ? generateFieldStringLiteralName(entity.alias, field.name) : field.type;
}

function generateFieldName(field: any) {
    return field.required ? camelCase(field.name) : `
    ${camelCase(field.name)}?`;
}

function generateStringLiterals(entity: any) {
    return entity.fields.map((field: any) =>
        generateFieldStringLiterals(entity.alias, field))
        .join("\n");
}



function generateFieldStringLiterals(entityAlias: string, field: any, ) {
    return field.values ?
        `export type ${generateFieldStringLiteralName(entityAlias, field.name)} = "${field.values.join(`" | "`)}";` :
        "";
}

function importStringLiterals(entity: any) {
    const stringLiterals = entity.fields.filter((field: any) => Array.isArray(field.values) && field.values.length).map((field: any) => generateFieldStringLiteralName(entity.alias, field.name));
    return (Array.isArray(stringLiterals) && stringLiterals.length) ? `import { ${stringLiterals} } from '../entities';` : "";
}

function exportStringLiterals(entity: any) {
    const stringLiterals = entity.fields.filter((field: any) => Array.isArray(field.values) && field.values.length).map((field: any) => generateFieldStringLiteralName(entity.alias, field.name));
    return (Array.isArray(stringLiterals) && stringLiterals.length) ? `export { ${stringLiterals} } from './${entity.alias}'` : "";
}

function generateFieldStringLiteralName(entityAlias: string, fieldName: string) {
    return `${entityAlias}${pascalCase(fieldName)}Options`;
}

function generateIndex(outputFolder: string, interfaces: any[]) {
    fs.writeFileSync(`${outputFolder}/index.ts`, `
    ${interfaces.map((i: any) => `
    import I${i.alias} from './${i.alias}';`).join("")}
    
    ${interfaces.map((entity: any) => exportStringLiterals(entity)).join(";")}

    export { 
        ${interfaces.map((i: any) => `I${i.alias}`)} 
    };`);
}

function camelCase(value: string) {
    return value.replace(/\s(.)/g, ($1) => $1.toUpperCase()).replace(/\s/g, '').replace(/^(.)/, ($1) => $1.toLowerCase());
}

function pascalCase(value: string) {
    const [initial, ...remaining] = camelCase(value);
    return initial.toLocaleUpperCase().concat(...remaining);
}