const elasticsearch = require("elasticsearch");
const config = require("../../../config/config");
const log = require("../utility/logger.js");

const elasticClient = (client = new elasticsearch.Client({
  host: config.elasticsearch.host,
  log: config.elasticsearch.log,
  apiVersion: config.elasticsearch.apiVersion, // use the same version of your Elasticsearch instance
}));

log.info("Generated elastic client");

module.exports = elasticClient;
