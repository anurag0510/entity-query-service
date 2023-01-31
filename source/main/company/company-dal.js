const EntityDal = require("../entity/entity-dal");
const log = require("../utility/logger");

class CompanyDal extends EntityDal {
  async getCompanyById(companyId) {
    log.info(`Trying to fetch company by id : ${companyId}`);
    return await super.getEntityById("company", companyId);
  }

  async createCompany(companyDetails) {
    log.info(
      `Trying to index new company with details : ${JSON.stringify(
        companyDetails
      )}`
    );
    return await super.createEntity(
      "company",
      companyDetails.cid,
      companyDetails
    );
  }

  async updateCompany(companyDetails) {
    log.info(
      `Trying to update company with details : ${JSON.stringify(
        companyDetails
      )}`
    );
    return await super.updateEntity(
      "company",
      companyDetails.cid,
      companyDetails
    );
  }

  async deleteCompany(companyDetails) {
    log.info(
      `Trying to delete company with details : ${JSON.stringify(
        companyDetails
      )}`
    );
    return await super.deleteEntity("company", companyDetails.cid);
  }

  async updateCompanyIndexByQuery(updateByQueryDetails) {
    log.info(
      `Trying to run update by query on pre-existing company with query details : ${JSON.stringify(
        updateByQueryDetails
      )}`
    );
    return await super.updateEntityByQuery("company", updateByQueryDetails);
  }
}

const companyDal = new CompanyDal();
module.exports = companyDal;
