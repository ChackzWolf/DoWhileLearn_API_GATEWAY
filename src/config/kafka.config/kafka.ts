import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'api-gateway',
  brokers: ['localhost:9092'], // Update if using different broker addresses
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'api-gateway-group' });

export { producer, consumer };
