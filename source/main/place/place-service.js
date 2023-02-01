const placeValidator = require("../validations/create-update-place");
const placeDal = require("../place/place-dal");
const entitySerializer = require("../entity/entity-serializer");
const log = require("../utility/logger");
const { object } = require("joi");
const userDal = require("../user/user-dal");
const companyDal = require("../company/company-dal");
const routeDal = require("../route/route-dal");

class PlaceService {
  async modifyPlaceDetailsPayload(placeDetails) {
    delete placeDetails["is_deleted"];
    delete placeDetails["deleted_at"];
    return placeDetails;
  }

  async createPlace(placeDetails) {
    placeDetails = await this.modifyPlaceDetailsPayload(placeDetails);
    log.info(
      `trying to create place with details : ${JSON.stringify(placeDetails)}`
    );
    let result = await placeValidator.validateCreateUpdatePlaceData(
      placeDetails
    );
    if (result.error === undefined) {
      placeDetails = await this.handleCreatedByUserCascading(placeDetails);
      placeDetails = await this.handleParentIdCascading(placeDetails);
      placeDetails = await this.attachGeoPointAndGeoShapeDetails(placeDetails);
      await placeDal.createPlace(placeDetails);
    } else log.fatal(result.error);
  }

  async updatePlace(placeDetails) {
    placeDetails = await this.modifyPlaceDetailsPayload(placeDetails);
    log.info(
      `trying to update place with details : ${JSON.stringify(placeDetails)}`
    );
    let result = await placeValidator.validateCreateUpdatePlaceData(
      placeDetails
    );
    if (result.error === undefined) {
      placeDetails = await this.handleCreatedByUserCascading(placeDetails);
      placeDetails = await this.handleUpdatedByUserCascading(placeDetails);
      placeDetails = await this.handleParentIdCascading(placeDetails);
      placeDetails = await this.attachGeoPointAndGeoShapeDetails(placeDetails);
      await placeDal.updatePlace(placeDetails);
      let scriptBody = await this.getBodyForCascadeUpdateCompany(
        placeDetails,
        false
      );
      companyDal.updateCompanyIndexByQuery(scriptBody);
      scriptBody = await this.getBodyForCascadeUpdateRoute(placeDetails, false);
      await routeDal.updateRouteIndexByQuery(scriptBody);
    } else log.fatal(result.error);
  }

  async deletePlace(placeDetails) {
    placeDetails = await this.modifyPlaceDetailsPayload(placeDetails);
    log.info(
      `trying to delete place with details : ${JSON.stringify(placeDetails)}`
    );
    let result = await placeValidator.validateCreateUpdatePlaceData(
      placeDetails
    );
    if (result.error === undefined) {
      await placeDal.deletePlace(placeDetails);
      let scriptBody = await this.getBodyForCascadeUpdateCompany(
        placeDetails,
        true
      );
      companyDal.updateCompanyIndexByQuery(scriptBody);
      scriptBody = await this.getBodyForCascadeUpdateRoute(placeDetails, true);
      await routeDal.updateRouteIndexByQuery(scriptBody);
    } else log.fatal(result.error);
  }

  async handleUpdatedByUserCascading(placeDetails) {
    if (placeDetails.updated_by !== null) {
      placeDetails.updated_by = await entitySerializer.cascadedUserSerializer(
        await userDal.getUserById(placeDetails.updated_by)
      );
    }
    return placeDetails;
  }

  async handleCreatedByUserCascading(placeDetails) {
    if (placeDetails.created_by !== null) {
      placeDetails.created_by = await entitySerializer.cascadedUserSerializer(
        await userDal.getUserById(placeDetails.created_by)
      );
    }
    return placeDetails;
  }

  async handleParentIdCascading(placeDetails) {
    placeDetails.parent = await entitySerializer.cascadedCompanySerializer(
      await companyDal.getCompanyById(placeDetails.parent_id)
    );
    return placeDetails;
  }

  async attachGeoPointAndGeoShapeDetails(placeDetails) {
    if (placeDetails.lat && placeDetails.lng)
      placeDetails["geo_point"] = `${placeDetails.lat},${placeDetails.lng}`;
    let geometry;
    if (placeDetails.attributes && placeDetails.attributes.google)
      geometry = placeDetails.attributes.google.geometry;
    if (
      geometry.viewport &&
      geometry.viewport.northeast &&
      geometry.viewport.southwest
    ) {
      placeDetails["geo_shape"] = {
        type: "polygon",
        coordinates: [
          [
            [geometry.viewport.northeast.lng, geometry.viewport.northeast.lat],
            [geometry.viewport.southwest.lng, geometry.viewport.northeast.lat],
            [geometry.viewport.southwest.lng, geometry.viewport.southwest.lat],
            [geometry.viewport.northeast.lng, geometry.viewport.southwest.lat],
            [geometry.viewport.northeast.lng, geometry.viewport.northeast.lat],
          ],
        ],
      };
    }
    placeDetails["latlng_source"] = "google";
    return placeDetails;
  }

  async getBodyForCascadeUpdateCompany(placeDetails, isNull) {
    let body = {
      query: {
        bool: {
          minimum_should_match: 1,
          should: [
            {
              match: {
                place_id: placeDetails.pid,
              },
            },
            {
              match: {
                head_office_id: placeDetails.pid,
              },
            },
          ],
        },
      },
      script: {
        source: `
        Map placeMetaData = new HashMap();
        if(!${isNull}) {
          placeMetaData.put('pid', '${placeDetails.pid}');
          placeMetaData.put('address', '${placeDetails.address}');
          placeMetaData.put('label', '${placeDetails.label}');
        }
        if(ctx._source.place_id == '${placeDetails.pid}') {
          ctx._source.place_id = ${isNull} ? null : '${placeDetails.pid}';
          ctx._source.place = ${isNull} ? null : placeMetaData;
        }
        if(ctx._source.head_office_id == '${placeDetails.pid}') {
          ctx._source.head_office_id = ${isNull} ? null : '${placeDetails.pid}';
          ctx._source.head_office = ${isNull} ? null : placeMetaData;
        }
        `,
      },
    };
    return body;
  }

  async getBodyForCascadeUpdateRoute(placeDetails, isNull) {
    let body = {
      query: {
        bool: {
          minimum_should_match: 1,
          should: [
            {
              match: {
                destination_pid: placeDetails.pid,
              },
            },
            {
              match: {
                origin_pid: placeDetails.pid,
              },
            },
          ],
        },
      },
      script: {
        source: `
        Map placeMetaData = new HashMap();
        if(!${isNull}) {
          placeMetaData.put('pid', '${placeDetails.pid}');
          placeMetaData.put('address', '${placeDetails.address}');
          placeMetaData.put('label', '${placeDetails.label}');
          placeMetaData.put('lat', ${placeDetails.lat});
          placeMetaData.put('lng', ${placeDetails.lng});
          placeMetaData.put('short_code', '${placeDetails.short_code}');
          placeMetaData.put('attributes', ${placeDetails.attributes});
          placeMetaData.put('formatted_address', '${
            placeDetails.formatted_address
          }');
          placeMetaData.put('region', '${
            placeDetails.region === undefined ? null : placeDetails.region
          }');
          placeMetaData.put('locality', '${
            placeDetails.locality === undefined ? null : placeDetails.locality
          }');
          placeMetaData.put('country', '${
            placeDetails.country === undefined ? null : placeDetails.country
          }');
          placeMetaData.put('postal_code', ${
            placeDetails.postal_code === undefined
              ? null
              : placeDetails.postal_code
          });
        }
        if(ctx._source.destination_pid == '${placeDetails.pid}') {
          ctx._source.destination_pid = ${isNull} ? null : '${
          placeDetails.pid
        }';
          ctx._source.destination = ${isNull} ? null : placeMetaData;
        }
        if(ctx._source.origin_pid == '${placeDetails.pid}') {
          ctx._source.origin_pid = ${isNull} ? null : '${placeDetails.pid}';
          ctx._source.origin = ${isNull} ? null : placeMetaData;
        }
        `,
      },
    };
    return body;
  }
}

module.exports = new PlaceService();
