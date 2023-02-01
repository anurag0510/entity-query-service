const EntityDal = require("../entity/entity-dal");
const log = require("../utility/logger");

class PlaceDal extends EntityDal {
  async getPlaceById(placeId) {
    log.info(`Trying to fetch place by id : ${placeId}`);
    return await super.getEntityById("place", placeId);
  }

  async createPlace(placeDetails) {
    log.info(
      `Trying to index new place with details : ${JSON.stringify(placeDetails)}`
    );
    return await super.createEntity("place", placeDetails.pid, placeDetails);
  }

  async updatePlace(placeDetails) {
    log.info(
      `Trying to update place with details : ${JSON.stringify(placeDetails)}`
    );
    return await super.updateEntity("place", placeDetails.pid, placeDetails);
  }

  async deletePlace(placeDetails) {
    log.info(
      `Trying to delete place with details : ${JSON.stringify(placeDetails)}`
    );
    return await super.deleteEntity("place", placeDetails.pid);
  }

  async updatePlaceIndexByQuery(updateByQueryDetails) {
    log.info(
      `Trying to run update by query on pre-existing places with query details : ${JSON.stringify(
        updateByQueryDetails
      )}`
    );
    return await super.updateEntityByQuery("place", updateByQueryDetails);
  }
}

const placeDal = new PlaceDal();
module.exports = placeDal;
