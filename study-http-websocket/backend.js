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
                //console.log(`Received message from ${partition}:${topic}.`);
                //console.log(`Message key: ${message.key}.`);
                let event = JSON.parse(message.value);
                console.log(event);
                sessions.forEach(session => session.emit('trade',JSON.stringify(event)));
            }
        });
    })
});

//endregion

//region REST on ws
// ws://localhost:8100
let sessions = [];
const socketIo = require("socket.io");
const http = require("http");
const server = http.createServer((req,res)=>{
    console.error("We do not expect an http request!");
});

server.listen(4100);
console.log("backend node app is listening at 4100");

const io = socketIo(server, {
    "cors": {
        "origins": "*",
        "methods": ["GET", "POST"]
    }
});
io.on('connection', (session) => {
    console.log(`A new connection is open for session (${session.id})`);
    sessions.push(session);
    io.on('disconnect', () => {
        // console.log(`The session (${session.id}) is closes.`);
        sessions = sessions.filter(_session => _session.id !== session.id);
    });
});
//endregion
