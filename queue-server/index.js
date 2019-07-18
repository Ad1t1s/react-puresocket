const http = require("http");
const client = require("./socketConnector");

let connections = {};
let socketClients = [];

if (process.env.socketPort) {
  connections[process.env.socketPort] = 0;
}
if (process.env.socketPort1) {
  connections[process.env.socketPort1] = 0;
}
if (process.env.socketPort2) {
  connections[process.env.socketPort2] = 0;
}
if (process.env.socketPort3) {
  connections[process.env.socketPort3] = 0;
}

for (let i = 0; i < Object.keys(connections).length; i++) {
  let port = Object.keys(connections)[i];

  socketClients.push(client.getConn(port));

  socketClients[i].onmessage = evt => {
    connections[Object.keys(connections)[i]] = evt.data;
  };
}

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
      for (let i = 0; i < socketClients.length; i++) {
        socketClients[i].send("users on the server now");
      }

      if (Object.keys(connections).length) {
        let arrayForCheck = [];
        for (let i = 0; i < Object.keys(connections).length; i++) {
          const key = Object.keys(connections)[i];
          if (arrayForCheck.length === 0) {
            arrayForCheck.push(key);
            arrayForCheck.push(connections[key]);
          } else {
            if (connections[key] < arrayForCheck[1]) {
              arrayForCheck[0] = key;
              arrayForCheck[1] = connections[key];
            }
          }
        }
        response.end(JSON.stringify(parseInt(arrayForCheck[0])));

        for (let i = 0; i < Object.keys(connections).length; i++) {
          connections[Object.keys(connections)[i]] = 0;
          console.log(Object.keys(connections)[i],'Object.keys(connections)[i]');
        }
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
