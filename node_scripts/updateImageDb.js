// this file accepts an AllPrintings.json file from mtgjson.com and outputs a json file with only card name / image path key value pairs


const json = require("./AllPrintings.json");

const fs = require("fs");
const path = require("path");

const cache = {};

for (const set in json.data) {
  json.data[set].cards.forEach((card) => {
    if (!cache[card.name]) {
      cache[card.name] = constructImagePath(card);
    }
  });

  fs.writeFileSync(
    path.join(__dirname, "imagePaths.json"),
    JSON.stringify(cache, null, 2)
  );
}

console.log("Image path update done");

// accepts a card object from AllPrintings. returns a string containing a url to fetch the image for that card
function constructImagePath(c) {
    const fileFace = 'front';
    const fileType = 'large';
    const fileFormat = 'jpg';
    const fileName = c.identifiers.scryfallId;
    const dir1 = fileName.charAt(0);
    const dir2 = fileName.charAt(1);
    const imagePath = `https://cards.scryfall.io/${fileType}/${fileFace}/${dir1}/${dir2}/${fileName}.${fileFormat}`;
    return imagePath;
}
