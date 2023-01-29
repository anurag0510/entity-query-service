const elasticClient = require("../utility/elasticConnection");
const log = require("../utility/logger");

class EntityDAL {
  constructor() {
    this.elasticClient = elasticClient;
  }

  getElasticClient() {
    return this.elasticClient;
  }

  async getEntityById(index, entityId) {
    log.info(`Trying to get ${index} details by id : ${entityId}`);
    try {
      const response = await this.elasticClient.get({
        index: index,
        type: "_doc",
        id: entityId,
      });
      if (response.found == false)
        log.info(`No such ${index} with id : ${entityId}`);
      return response._source;
    } catch (error) {
      log.warn(error.message);
    }
  }

  async createEntity(index, entityId, entityDetails) {
    try {
      const response = await this.elasticClient.create({
        index: index,
        type: "_doc",
        id: entityId,
        body: entityDetails,
      });
      log.info(JSON.stringify(response));
    } catch (error) {
      log.warn(error.message);
    }
  }

  async updateEntity(index, entityId, entityDetails) {
    try {
      const response = await this.elasticClient.update({
        index: index,
        type: "_doc",
        id: entityId,
        body: {
          doc: entityDetails,
        },
      });
      log.info(JSON.stringify(response));
    } catch (error) {
      log.warn(error.message);
    }
  }

  async deleteEntity(index, entityId) {
    try {
      const response = await this.elasticClient.delete({
        index: index,
        type: "_doc",
        id: entityId,
      });
      log.info(JSON.stringify(response));
    } catch (error) {
      log.warn(error.message);
    }
  }

  async updateEntityByQuery(index, queryAndScriptDetails) {
    log.info(
      `running update entity by query on ${index} with query details as : ${JSON.stringify(
        queryAndScriptDetails
      )}`
    );
    try {
      const response = await this.elasticClient.updateByQuery({
        index: index,
        conflicts: "proceed",
        body: queryAndScriptDetails,
      });
      log.info(JSON.stringify(response));
    } catch (error) {
      log.warn(error.message);
    }
  }
}

module.exports = EntityDAL;
