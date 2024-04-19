const https = require('https');
const fs = require("fs");
const { parse } = require('node-html-parser');

let imgs = []

counter = 0
end = 146

for (var i=0;i<end;i++){
    https.get(`https://stopgame.ru/games/pc/best?year_start=2010&p=${i}`, (resp) => {
        let data = '';
      
        // A chunk of data has been received.
        resp.on('data', (chunk) => {
          data += chunk;
        });
      
        // The whole response has been received. Print out the result.
        resp.on('end', () => {

          var root = parse(data);
          var arr = root.querySelectorAll("._image_1vde2_8")
          var arr2 = root.querySelectorAll("._card_1vde2_1")

          for (var j=0;j<arr.length;j++){
            imgs.push({img:arr[j]._attrs.src,name:arr2[j]._attrs.title})
          }
          counter++;
          if(counter==end){
            fs.writeFileSync("res.json",JSON.stringify(imgs));
          }
        });

        

      }).on("error", (err) => {
        console.log("Error: " + err.message);
      });
}
