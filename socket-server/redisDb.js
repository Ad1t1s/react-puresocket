const redis = require("redis");
const clientRedis = redis.createClient();

clientRedis.on("connect", function() {
  console.log("Redis client connected");
});

clientRedis.on("error", function(err) {
  console.log("Something went wrong " + err);
});

module.exports = {
  addMessage: message => {
    clientRedis.rpush("messageList", message, redis.print);

    clientRedis.publish("myCollection", message, function() {
      console.log(message);
    });
  },
  getMessage: async () => {
    let length = await new Promise((s, error) => {
      clientRedis.llen("messageList", (e, data) => {
        if (e) error(e);
        else s(data);
      });
    });

    let startLength = length - 50 < 0 ? 0 : length - 50;

    let results = await new Promise((s, error) => {
      clientRedis.lrange("messageList", startLength, length - 1, (e, data) => {
        if (e) error(e);
        else s(data);
      });
    });
    return results;
  }
};
