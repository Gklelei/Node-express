const http = require("http");
const pathModule = require("path"); // Renamed to avoid conflict with path module
const fs = require("fs");
const { promisify } = require("util"); // Using promisify to convert fs.readFile to a promise-based function

const logEvents = require("./logEvents");
const eventsEmitter = require("events");
class Emitter extends eventsEmitter {}
const myEmitter = new Emitter();

const PORT = process.env.PORT || 3500;
const server = http.createServer((req, res) => {
  console.log(req.url, req.method);

  let filePath;
  if (req.url === "/" || req.url === "/index.html") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    filePath = pathModule.join(__dirname, "Views", "index.html");
  } else if (req.url === "/style.css") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/css");
    filePath = pathModule.join(__dirname, "public", "style.css");
  } else if (req.url === "/script.js") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/javascript");
    filePath = pathModule.join(__dirname, "public", "script.js");
  } else {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.end("Not Found");
    return;
  }

  const readFileAsync = promisify(fs.readFile);
  readFileAsync(filePath, "utf8")
    .then((data) => {
      res.end(data);
    })
    .catch((err) => {
      console.error(err);
      res.statusCode = 500;
      res.setHeader("Content-Type", "text/plain");
      res.end("Internal Server Error");
    });

  // Log the request
  myEmitter.emit("log", `Request: ${req.url}, Method: ${req.method}`);
});

server.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`);
});
