const fs = require("fs");


const log = (text) => {
    if (typeof (text) !== "string") {
        text = JSON.stringify(text);
    }
    const date = new Date();
    text = date.toLocaleString() + ' - ' + text + "\n";
    fs.writeFileSync("app.log", text, {encoding: "utf8", flag: "a"});
    console.log(text);
}


module.exports = log;
