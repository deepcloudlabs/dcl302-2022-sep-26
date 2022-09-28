//region Consuming Binance's REST on HTTP Api using Fetch Api
const fetch = require("node-fetch");
const restApiUrl = "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT";
setInterval(() => {
    fetch(restApiUrl).then(res => res.json())
                     .then( console.log );
}, 3000);
//endregion

//region Kafka Producer
const {Kafka} = require("kafkajs");
const kafka = new Kafka({
    clientId: "binance-client",
    brokers: ['localhost:9092']
});

const producer = kafka.producer();
producer.connect()
    .then(() => console.log("Connected to the kafka broker..."))
    .catch(console.error)

//endregion

//region Consuming Binance's REST on WebSocket Api
const websocket = require('ws');
const restWsUrl = "wss://stream.binance.com:9443/ws/btcusdt@trade";
const ws = new websocket(restWsUrl);
ws.on('message', frame => {
   const trade = JSON.parse(frame);
    let payload = {
        "topic": "trades",
        "messages": [
            {"key": "btcusdt", value: frame}
        ]
    }
    producer.send(payload);
});
//endregion



