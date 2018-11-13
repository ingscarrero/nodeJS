import ClassGenerator from "./generation/class";

function run() {
    console.log("Running generator...");
    const gen = new ClassGenerator("./inputs/test.json");
    gen.generateModules().then(res => {
        console.info(res);
    }).catch(err => {
        console.log(`Error generating backend components... ${err.message}`);
    });
}

run();