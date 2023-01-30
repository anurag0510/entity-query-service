const companyValidator = require("../validations/create-update-company");
const companyDAL = require("../company/company-dal");
const entitySerializer = require("../entity/entity-serializer");
const log = require("../utility/logger");
const { object } = require("joi");
const userDal = require("../user/user-dal");
const placeDal = require("../place/place-dal");
const routeDal = require("../route/route-dal");

class CompanyService {
  async modifyCompanyDetailsPayload(companyDetails) {
    delete companyDetails["is_deleted"];
    delete companyDetails["deleted_at"];
    return companyDetails;
  }

  async createCompany(companyDetails) {
    companyDetails = await this.modifyCompanyDetailsPayload(companyDetails);
    log.info(
      `trying to create company with details : ${JSON.stringify(
        companyDetails
      )}`
    );
    let result = await companyValidator.validateCreateUpdateCompanyData(
      companyDetails
    );
    if (result.error === undefined) {
      companyDetails = await this.handleCreatedByUserCascading(companyDetails);
      companyDetails = await this.handleContactUserCascading(companyDetails);
      await companyDAL.createCompany(companyDetails);
    } else log.fatal(result.error);
  }

  async updateCompany(companyDetails) {
    companyDetails = await this.modifyCompanyDetailsPayload(companyDetails);
    log.info(
      `trying to update company with details : ${JSON.stringify(
        companyDetails
      )}`
    );
    let result = await companyValidator.validateCreateUpdateCompanyData(
      companyDetails
    );
    if (result.error === undefined) {
      companyDetails = await this.handleCreatedByUserCascading(companyDetails);
      companyDetails = await this.handleUpdatedByUserCascading(companyDetails);
      companyDetails = await this.handleContactUserCascading(companyDetails);
      companyDetails = await this.handlePlaceAndHeadOfficeDetailsCascading(
        companyDetails
      );
      await companyDAL.updateCompany(companyDetails);
      let scriptBody = await this.getBodyForCascadeUpdatePlaces(
        companyDetails,
        false
      );
      await placeDal.updatePlaceIndexByQuery(scriptBody);
      await routeDal.updateRouteIndexByQuery(scriptBody);
    } else log.fatal(result.error);
  }

  async deleteCompany(companyDetails) {
    companyDetails = await this.modifyCompanyDetailsPayload(companyDetails);
    log.info(
      `trying to delete company with details : ${JSON.stringify(
        companyDetails
      )}`
    );
    let result = await companyValidator.validateCreateUpdateCompanyData(
      companyDetails
    );
    if (result.error === undefined) {
      await companyDAL.deleteCompany(companyDetails);
      let scriptBody = await this.getBodyForCascadeUpdatePlaces(
        companyDetails,
        true
      );
      await placeDal.updatePlaceIndexByQuery(scriptBody);
      await routeDal.updateRouteIndexByQuery(scriptBody);
    } else log.fatal(result.error);
  }

  async handleCreatedByUserCascading(companyDetails) {
    if (companyDetails.created_by !== null) {
      companyDetails.created_by_uid = companyDetails.created_by;
      companyDetails.created_by = await entitySerializer.cascadedUserSerializer(
        await userDal.getUserById(companyDetails.created_by)
      );
    } else {
      companyDetails.created_by = null;
      companyDetails.created_by_uid = null;
    }
    return companyDetails;
  }

  async handleUpdatedByUserCascading(companyDetails) {
    if (companyDetails.updated_by !== null) {
      companyDetails.updated_by_uid = companyDetails.updated_by;
      companyDetails.updated_by = await entitySerializer.cascadedUserSerializer(
        await userDal.getUserById(companyDetails.updated_by)
      );
    } else companyDetails.updated_by_uid = null;
    return companyDetails;
  }

  async handleContactUserCascading(companyDetails) {
    if (companyDetails.contact_user_id !== null) {
      companyDetails.contact_user =
        await entitySerializer.cascadedUserSerializer(
          await userDal.getUserById(companyDetails.contact_user_id)
        );
    } else companyDetails.contact_user = null;
    return companyDetails;
  }

  async handlePlaceAndHeadOfficeDetailsCascading(companyDetails) {
    if (companyDetails.place_id !== null) {
      companyDetails.place = await entitySerializer.cascadedPlaceSerializer(
        await placeDal.getPlaceById(companyDetails.place_id)
      );
    } else companyDetails.place = null;
    if (companyDetails.head_office_id !== null) {
      companyDetails.head_office =
        await entitySerializer.cascadedPlaceSerializer(
          await placeDal.getPlaceById(companyDetails.head_office_id)
        );
    } else companyDetails.head_office = null;
    return companyDetails;
  }

  async getBodyForCascadeUpdatePlaces(companyDetails, isNull) {
    let body = {
      query: {
        bool: {
          minimum_should_match: 1,
          should: [
            {
              match: {
                parent_id: companyDetails.cid,
              },
            },
          ],
        },
      },
      script: {
        source: `
        if(!${isNull}) {
          ctx._source.parent.cid = '${companyDetails.cid}';
          ctx._source.parent.name = '${companyDetails.name}';
        } else {
          ctx._source.parent = null;
          ctx._source.parent_id = null;
        }
        `,
      },
    };
    return body;
  }
}

module.exports = new CompanyService();
