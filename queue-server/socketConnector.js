const WebSocket = require("ws");

module.exports = {
  getConn(port = 9999) {
    let client = new WebSocket("ws://localhost:" + port);
    client.onopen = () => {
      console.log("connected");
      client.send("users on the server now");
    };

    client.onclose = () => {
      console.log("disconnected");
    };
    return client;
  }
};
