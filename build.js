const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const glob = require("glob");
const rimraf = require("rimraf");

async function main() {
  const files = glob.sync("src/*.js");

  rimraf.sync("docs");
  fs.mkdirSync("docs");

  let iframes = "";
  promises = [];
  for (const file of files) {
    if (file.includes("commands.js") || file.includes("demo.js")) {
      continue;
    }
    const target = path.basename(file).replace(".js", ".min.js");
    console.log(`${file}...`);
    promises.push(execPromise(`browserify ${file} -o docs/${target}`));
    iframes += `<br>${path.basename(file).replace(".js", "")}<br>
                <iframe 
                  style="width: 700px; height: 300px; border: none"
                  srcdoc="<html><head><script src='${target}' defer></script></head><body></body></html>"
                ></iframe>`;
  }

  await Promise.all(promises);

  const html = `
  <html>
    <body style="text-align: center">
      ${iframes}
    </body>
  </html>
  `;

  fs.writeFileSync("docs/index.html", html);

  console.log("done");
}

main();

function execPromise(command) {
  return new Promise(resolve => {
    exec(command, resolve);
  });
}
