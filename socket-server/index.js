const WebSocket = require("ws");
const db = require("./redisDb");
const redis = require("redis");
const subscriber = redis.createClient();

subscriber.subscribe("myCollection");

const wss = new WebSocket.Server({ port: process.env.socketPort });

let counter = 0;

subscriber.on("message", function(channel, message) {
  counter = 0;
  wss.clients.forEach(function each(client) {
    counter++;
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
});

wss.on("connection", function connection(ws) {

  ws.on("message", async function incoming(data) {
    switch (data) {
      case "users on the server now":
        ws.send(counter);
        break;
      case "getMessage from db":
        ws.send(JSON.stringify(await db.getMessage()));
        break;
      default:
        db.addMessage(data);
        break;
    }
  });
});
