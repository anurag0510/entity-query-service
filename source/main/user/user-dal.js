const EntityDal = require("../entity/entity-dal");
const log = require("../utility/logger");

class UserDal extends EntityDal {
  async getUserById(userId) {
    log.info(`Trying to get user details by id : ${userId}`);
    try {
      const response = await super.getElasticClient().get({
        index: "user",
        type: "_doc",
        id: userId,
      });
      if (response.found == false) log.info(`No such user with id : ${userId}`);
      return response._source;
    } catch (error) {
      log.warn(error.message);
    }
  }

  async getUsers(shouldObject, minimumMatch) {
    log.info(
      `Get users for a match of : ${JSON.stringify(
        shouldObject
      )} and minimum match of ${minimumMatch}`
    );
    try {
      const response = await super.getElasticClient().search({
        index: "user",
        body: {
          query: {
            bool: {
              minimum_should_match: minimumMatch,
              should: shouldObject,
            },
          },
        },
      });
      if (response.found == false)
        log.info(`No such user with mentioned details found`);
      log.info(JSON.stringify(response.hits));
      return response;
    } catch (error) {
      log.warn(error.message);
    }
  }

  async createUser(userDetails) {
    try {
      const response = await super.getElasticClient().create({
        index: "user",
        type: "_doc",
        id: userDetails.uid,
        body: userDetails,
      });
      log.info(JSON.stringify(response));
    } catch (error) {
      log.warn(error.message);
    }
  }

  async updateUser(userDetails) {
    try {
      const response = await super.getElasticClient().update({
        index: "user",
        type: "_doc",
        id: userDetails.uid,
        body: {
          doc: userDetails,
        },
      });
      log.info(JSON.stringify(response));
    } catch (error) {
      log.warn(error.message);
    }
  }

  async updateEntityByQuery(queryAndScriptDetails) {
    log.info(JSON.stringify(queryAndScriptDetails));
    try {
      const response = await super.getElasticClient().updateByQuery({
        index: "user",
        conflicts: "proceed",
        body: queryAndScriptDetails,
      });
      log.info(JSON.stringify(response));
    } catch (error) {
      log.warn(error.message);
    }
  }

  async deleteUser(userDetails) {
    try {
      const response = await super.getElasticClient().delete({
        index: "user",
        type: "_doc",
        id: userDetails.uid,
      });
      log.info(JSON.stringify(response));
    } catch (error) {
      log.warn(error.message);
    }
  }
}

const userDal = new UserDal();
module.exports = userDal;
