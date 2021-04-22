const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// build directory relative to project root
const readDirectory = "./dist/";
const exclusions = [
  /\.DS_Store$/,
  /\.htaccess$/,
  /^service-worker\.js$/,
];

const templateFile = `${readDirectory}service-worker.js`;
const startSentinel = "/* ASSET LIST START */";
const endSentinel   = "/* ASSET LIST END */";



async function* walkDirectory(dir) {
  for await (const dirEntryData of await fs.promises.opendir(dir)) {
    const entryName = path.join(dir, dirEntryData.name);
    if (dirEntryData.isDirectory()) {
      yield* walkDirectory(entryName);
    }
    else if (dirEntryData.isFile()) {
      yield entryName;
    }
  }
}

function getHashOfFile(filePath) {
  return new Promise(resolve => {
    const sum = crypto.createHash("sha256");
    const reading = fs.ReadStream(filePath);
    reading.on("data", (data) => {
      sum.update(data);
    });
    reading.on("end", () => {
      const hash = sum.digest("hex");
      resolve(hash);
    });
  });
}

async function main() {
  const assets = {};
  for await (const fPath of walkDirectory(readDirectory)) {
    const hash = await getHashOfFile(fPath);
    const entryName = `${fPath.substr((path.normalize(readDirectory)).length)}`;
    if (exclusions.some(re => re.test(entryName))) {
      continue;
    }
    assets[entryName] = hash;
  }
  assets["/projects/gratitude/"] = assets["index.html"];

  const template = fs.readFileSync(templateFile).toString("utf-8");
  const before = template.substr(0, template.indexOf(startSentinel));
  const after = template.substr(template.indexOf(endSentinel) + endSentinel.length);

  const updateTimeStamp = new Date();
  const output = `${before}\n// Updated: ${updateTimeStamp.toISOString()}\n//   (${updateTimeStamp})\nconst assetList = ${JSON.stringify(assets, Object.keys(assets).sort(), 2)};\n${after}`;

  fs.writeFileSync(templateFile, output);
}

main();
