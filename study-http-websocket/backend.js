//region Kafka Producer
const {Kafka} = require("kafkajs");
const kafka = new Kafka({
    clientId: "trade-consumer",
    brokers: ['localhost:9092']
});

const consumer = kafka.consumer({
    "groupId": "trade-consumer"
});

consumer.connect().then(()=>{
    console.log("Connected to the kafka server.");
    consumer.subscribe({topic: "trades", fromBeginning: true}).then(() =>{
        consumer.run({
            eachMessage: async ({topic, partition, message}) => {
                console.log(`Received message from ${partition}:${topic}.`);
                console.log(`Message key: ${message.key}.`);
                let event = JSON.parse(message.value);
                console.log(event);
            }
        });
    })
});

//endregion