const log = require("../utility/logger");
const userService = require("../user/user-service");
const companyService = require("../company/company-service");
const placeService = require("../place/place-service");
const routeService = require("../route/route-service");

class EntityService {
  async processMessage(msg) {
    switch (msg.event_type.split("_")[0]) {
      case "create":
        await this.createEntity(msg);
        break;
      case "update":
        await this.updateEntity(msg);
        break;
      case "delete":
        await this.deleteEntity(msg);
        break;
    }
  }

  async createEntity(entityDetails) {
    log.info("message receive to create entity");
    switch (entityDetails.event_type.split("_")[1]) {
      case "user":
        await userService.createUser(entityDetails.message_body);
        break;
      case "company":
        await companyService.createCompany(entityDetails.message_body);
        break;
      case "place":
        await placeService.createPlace(entityDetails.message_body);
        break;
      case "route":
        await routeService.createRoute(entityDetails.message_body);
        break;
    }
  }

  async updateEntity(entityDetails) {
    log.info("message receive to update entity");
    switch (entityDetails.event_type.split("_")[1]) {
      case "user":
        await userService.updateUser(entityDetails.message_body);
        break;
      case "company":
        await companyService.updateCompany(entityDetails.message_body);
        break;
      case "place":
        await placeService.updatePlace(entityDetails.message_body);
        break;
      case "route":
        await routeService.updateRoute(entityDetails.message_body);
        break;
    }
  }

  async deleteEntity(entityDetails) {
    log.info("message receive to delete entity");
    switch (entityDetails.event_type.split("_")[1]) {
      case "user":
        await userService.deleteUser(entityDetails.message_body);
        break;
      case "company":
        await companyService.deleteCompany(entityDetails.message_body);
        break;
      case "place":
        await placeService.deletePlace(entityDetails.message_body);
        break;
      case "route":
        await routeService.deleteRoute(entityDetails.message_body);
        break;
    }
  }
}

module.exports = new EntityService();
