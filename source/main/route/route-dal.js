const EntityDal = require("../entity/entity-dal");
const log = require("../utility/logger");

class RouteDal extends EntityDal {
  async getRouteById(routeId) {
    log.info(`Trying to fetch route by id : ${routeId}`);
    return await super.getEntityById("route", routeId);
  }

  async createRoute(routeDetails) {
    log.info(
      `Trying to index new route with details : ${JSON.stringify(routeDetails)}`
    );
    return await super.createEntity("route", routeDetails.rid, routeDetails);
  }

  async updateRoute(routeDetails) {
    log.info(
      `Trying to update route with details : ${JSON.stringify(routeDetails)}`
    );
    return await super.updateEntity("route", routeDetails.rid, routeDetails);
  }

  async deleteRoute(routeDetails) {
    log.info(
      `Trying to delete route with details : ${JSON.stringify(routeDetails)}`
    );
    return await super.deleteEntity("route", routeDetails.rid);
  }

  async updateRouteIndexByQuery(updateByQueryDetails) {
    log.info(
      `Trying to run update by query on pre-existing route with query details : ${JSON.stringify(
        updateByQueryDetails
      )}`
    );
    return await super.updateEntityByQuery("route", updateByQueryDetails);
  }
}

const routeDal = new RouteDal();
module.exports = routeDal;
