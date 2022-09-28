const {Kafka} = require("kafkajs");
const kafka = new Kafka({
    clientId: "admin",
    brokers: ['localhost:9092']
});

const admin = kafka.admin();

const create_topic = async (topic_name) => {
  await admin.createTopics({
      topics: [{
          topic: topic_name
      }]
  }).then(console.log).catch(console.error);
  console.log(`Topic ${topic_name} is created.`);
};

create_topic('hr');