const http = require("http");
const client = require("./socketConnector");

let connections = {
  "9999": 0,
  "8888": 0
};

let ws = client.getConn("9999");
let wss = client.getConn("8888");

ws.onmessage = evt => {
  connections["9999"] = evt.data;
};

wss.onmessage = evt => {
  connections["8888"] = evt.data;
};

const requestHandler = (req, response) => {
  response.writeHead(200, {
    "Content-Type": "text/plain",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  let body = "";
  req.on("data", chunk => (body += chunk));
  req.on("end", () => {
    if (body && JSON.parse(body)["getport"]) {
      ws.send("users on the server now");
      wss.send("users on the server now");

      if (connections["9999"] && connections["8888"]) {
        parseInt(connections["9999"], 10) > parseInt(connections["8888"], 10)
          ? response.end(JSON.stringify(8888))
          : response.end(JSON.stringify(9999));

        connections = {
          "9999": 0,
          "8888": 0
        };
      }
    } else {
      response.end();
    }
  });
};

const server = http.createServer(requestHandler);

server.listen(process.env.serverPort, err => {
  if (err) {
    return console.log("something bad happened", err);
  }
  console.log(`server is listening on ${process.env.serverPort}`);
});
