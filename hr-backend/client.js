const socketIo = require("socket.io-client");

const client = socketIo("ws://localhost:8100");

client.on("connect", () => {
   console.log("Connected to the websocket server...");
   client.on('fire', (emp) => {
      console.log(`${emp.fullname} is fired!`);
   });
   client.on('hire', (emp) => {
      console.log(`${emp.fullname} is hired!`);
   });

});
