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

//region Kafka Producer
const {Kafka} = require("kafkajs");
const kafka = new Kafka({
   clientId: "hr-consumer",
   brokers: ['localhost:9092']
});

const consumer = kafka.consumer({
   "groupId": "hr-consumer"
});

consumer.connect().then(()=>{
   console.log("Connected to the kafka server.");
   consumer.subscribe({topic: "hr", fromBeginning: true}).then(() =>{
      consumer.run({
         eachMessage: async ({topic, partition, message}) => {
            console.log(`Received message from ${partition}:${topic}.`);
            console.log(`Message key: ${message.key}.`);
            let event = JSON.parse(message.value);
            console.log(`Event Type: ${event.type}.`);
            console.log(`Event Data: ${JSON.stringify(event.data)}.`);
         }
      });
   })
});

//endregion