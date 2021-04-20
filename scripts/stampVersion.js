const fs = require("fs");
const child_process = require("child_process");

const buildFile = "./dist/dist/index.js";


const latestCommit = child_process.execSync("git rev-parse --short HEAD").toString().trim();
const isDirty = child_process.execSync("git status --short").toString().trim().length > 0;

const versionString = `${latestCommit}${isDirty ? "+" : ""}`;

// big file; reading it is inefficient, but we'll be ok
const inputString = fs.readFileSync(buildFile).toString();
const outputString = inputString.replace("#GRATITUDE_VERSION_STRING#", versionString);

fs.writeFileSync(buildFile, outputString);
fs.writeFileSync("./dist/VERSION", versionString);
