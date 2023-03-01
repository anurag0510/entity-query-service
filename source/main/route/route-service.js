const routeValidator = require("../validations/create-update-route");
const routeDal = require("../route/route-dal");
const entitySerializer = require("../entity/entity-serializer");
const log = require("../utility/logger");
const { object } = require("joi");
const userDal = require("../user/user-dal");
const companyDal = require("../company/company-dal");
const placeDal = require("../place/place-dal");

class RouteService {
  async modifyRouteDetailsPayload(routeDetails) {
    delete routeDetails["is_deleted"];
    delete routeDetails["deleted_at"];
    return routeDetails;
  }

  async createRoute(routeDetails) {
    routeDetails = await this.modifyRouteDetailsPayload(routeDetails);
    log.info(
      `trying to create route with details : ${JSON.stringify(routeDetails)}`
    );
    let result = await routeValidator.validateCreateUpdateRouteData(
      routeDetails
    );
    if (result.error === undefined) {
      routeDetails = await this.handleCreatedByUserCascading(routeDetails);
      routeDetails = await this.handleParentIdCascading(routeDetails);
      routeDetails = await this.handlePlaceDetailsCascadingForOrigin(
        routeDetails
      );
      routeDetails = await this.handlePlaceDetailsCascadingForDestination(
        routeDetails
      );
      await routeDal.createRoute(routeDetails);
    } else log.fatal(result.error);
  }

  async updateRoute(routeDetails) {
    routeDetails = await this.modifyRouteDetailsPayload(routeDetails);
    log.info(
      `trying to update route with details : ${JSON.stringify(routeDetails)}`
    );
    let result = await placeValidator.validateCreateUpdatePlaceData(
      routeDetails
    );
    if (result.error === undefined) {
      routeDetails = await this.handleCreatedByUserCascading(routeDetails);
      routeDetails = await this.handleUpdatedByUserCascading(routeDetails);
      routeDetails = await this.handleParentIdCascading(routeDetails);
      routeDetails = await this.handlePlaceDetailsCascadingForOrigin(
        routeDetails
      );
      routeDetails = await this.handlePlaceDetailsCascadingForDestination(
        routeDetails
      );
      await routeDal.updateRoute(routeDetails);
    } else log.fatal(result.error);
  }

  async deleteRoute(routeDetails) {
    routeDetails = await this.modifyRouteDetailsPayload(routeDetails);
    log.info(
      `trying to delete route with details : ${JSON.stringify(routeDetails)}`
    );
    let result = await placeValidator.validateCreateUpdatePlaceData(
      routeDetails
    );
    if (result.error === undefined) {
      await routeDal.deleteRoute(routeDetails);
    } else log.fatal(result.error);
  }

  async handleUpdatedByUserCascading(routeDetails) {
    if (routeDetails.updated_by !== null) {
      routeDetails.updated_by = await entitySerializer.cascadedUserSerializer(
        await userDal.getUserById(routeDetails.updated_by)
      );
    }
    return routeDetails;
  }

  async handleCreatedByUserCascading(routeDetails) {
    if (routeDetails.created_by !== null) {
      routeDetails.created_by = await entitySerializer.cascadedUserSerializer(
        await userDal.getUserById(routeDetails.created_by)
      );
    }
    return routeDetails;
  }

  async handleParentIdCascading(routeDetails) {
    routeDetails.parent = await entitySerializer.cascadedCompanySerializer(
      await companyDal.getCompanyById(routeDetails.parent_id)
    );
    return routeDetails;
  }

  async handlePlaceDetailsCascadingForOrigin(routeDetails) {
    routeDetails.origin =
      await entitySerializer.cascadedPlaceSerializerForRoutes(
        await placeDal.getPlaceById(routeDetails.origin_pid)
      );
    return routeDetails;
  }

  async handlePlaceDetailsCascadingForDestination(routeDetails) {
    routeDetails.destination =
      await entitySerializer.cascadedPlaceSerializerForRoutes(
        await placeDal.getPlaceById(routeDetails.destination_pid)
      );
    return routeDetails;
  }
}

module.exports = new RouteService();
