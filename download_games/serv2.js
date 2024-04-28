const https = require('https');
const fs = require("fs");
const { parse } = require('node-html-parser');

const imgs = [];
let counter = 0;
let game_id = 0;
const end = 160;

function fetchData(url, callback) {
    https.get(url, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
           console.log("=======================new+page=====================================")
            const root = parse(data);
            const arr = root.querySelectorAll("._image_1ld6v_16");
            const arr2 = root.querySelectorAll("._card_1ld6v_4");
            for (let j = 0; j < arr.length; j++) {
                console.log(arr2[j]._attrs.title)
                imgs.push({ id: game_id, img: arr[j]._attrs.src, name: arr2[j]._attrs.title });
                game_id++
            }
            callback();
        });
    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

function processPage(pageNumber) {
    fetchData(`https://stopgame.ru/games/pc/best?year_start=2010&p=${pageNumber}`, () => {
        counter++;
        if (counter === end) {
            fs.writeFileSync("res_new.json", JSON.stringify(imgs));
            console.log("Data saved to file.");
        }
    });
}

for (let i = 0; i < end; i++) {
    processPage(i);
}
