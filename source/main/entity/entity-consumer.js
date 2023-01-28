const { Kafka } = require("kafkajs");

const log = require("../utility/logger.js");
const config = require("../../../config/config");
const entityService = require("./entity-service");

class EntityConsumer {
  constructor() {
    this.kafka = new Kafka({
      clientId: "my-app",
      brokers: config.kafka.consumers.entity.hosts,
    });
    this.consumer = this.kafka.consumer({
      groupId: config.kafka.consumers.entity.group,
    });
  }

  async startMessageProcessing() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: config.kafka.consumers.entity.topic,
      fromBeginning: true,
    });

    await this.consumer.run({
      autoCommit: true,
      eachMessage: async ({ topic, partition, message }) => {
        // log.info({
        //   partition,
        //   offset: message.offset,
        //   value: JSON.parse(message.value.toString()),
        // });
        log.info(message.value.toString());
        await entityService.processMessage(
          JSON.parse(message.value.toString())
        );
      },
    });
  }

  async initKafka() {
    await this.startMessageProcessing().catch(console.error);
  }
}

module.exports = new EntityConsumer();
