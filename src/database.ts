import * as mongodb from 'mongodb';
const client = mongodb.MongoClient;

export const connection = function() {
  const connectionstring = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${
    process.env.MONGO_HOST
  }:${process.env.MONGO_PORT}/${process.env.MONGO_DB}?authSource=${process.env.MONGO_AUTHSOURCE}`;

  return client.connect(connectionstring);
};
