const userValidator = require("../validations/create-update-user");
const userDAL = require("../user/user-dal");
const entitySerializer = require("../entity/entity-serializer");
const log = require("../utility/logger");
const { object } = require("joi");
const userDal = require("../user/user-dal");
const companyDal = require("../company/company-dal");
const placeDal = require("../place/place-dal");
const routeDal = require("../route/route-dal");

class UserService {
  async modifyUserDetailsPayload(userDetails) {
    delete userDetails["is_deleted"];
    delete userDetails["deleted_at"];
    return userDetails;
  }

  async createUser(userDetails) {
    userDetails = await this.modifyUserDetailsPayload(userDetails);
    log.info(
      `trying to create user with details : ${JSON.stringify(userDetails)}`
    );
    let result = await userValidator.validateCreateUpdateUserData(userDetails);
    if (result.error === undefined) {
      let areSimilarUsersInSystem = await this.areSimilarUsersPresent(
        {
          user_name: userDetails.user_name,
          mobile_number: userDetails.mobile_number,
          country_code: userDetails.country_code,
        },
        2
      );
      if (areSimilarUsersInSystem) {
        log.info(
          `Going to skip user creation due to unique record constraints.`
        );
        return;
      }
      if (userDetails.created_by !== null)
        userDetails.created_by = await entitySerializer.cascadedUserSerializer(
          await userDAL.getUserById(userDetails.created_by)
        );
      await userDAL.createUser(userDetails);
    } else log.fatal(result.error);
  }

  async updateUser(userDetails) {
    userDetails = await this.modifyUserDetailsPayload(userDetails);
    log.info(
      `trying to update user with details : ${JSON.stringify(userDetails)}`
    );
    let result = await userValidator.validateCreateUpdateUserData(userDetails);
    if (result.error === undefined) {
      if (
        userDetails.created_by !== null &&
        typeof userDetails.created_by === "string"
      )
        userDetails.created_by = await entitySerializer.cascadedUserSerializer(
          await userDAL.getUserById(userDetails.created_by)
        );
      if (
        userDetails.updated_by !== null &&
        typeof userDetails.updated_by === "string"
      )
        userDetails.updated_by = await entitySerializer.cascadedUserSerializer(
          await userDAL.getUserById(userDetails.updated_by)
        );
      await userDAL.updateUser(userDetails);
      let scriptBody = await this.getBodyForCascadeUpdateUsers(
        userDetails,
        false
      );
      await userDal.updateEntityByQuery(scriptBody);
      await companyDal.updateCompanyIndexByQuery(scriptBody);
      await placeDal.updatePlaceIndexByQuery(scriptBody);
      await routeDal.updateRouteIndexByQuery(scriptBody);
    } else log.fatal(result.error);
  }

  async deleteUser(userDetails) {
    userDetails = await this.modifyUserDetailsPayload(userDetails);
    log.info(
      `trying to delete user with details : ${JSON.stringify(userDetails)}`
    );
    let result = await userValidator.validateCreateUpdateUserData(userDetails);
    if (result.error === undefined) {
      let scriptBody = await this.getBodyForCascadeUpdateUsers(
        userDetails,
        true
      );
      await userDal.updateEntityByQuery(scriptBody);
      await companyDal.updateCompanyIndexByQuery(scriptBody);
      await placeDal.updatePlaceIndexByQuery(scriptBody);
      await routeDal.updateRouteIndexByQuery(scriptBody);
      await userDAL.deleteUser(userDetails);
    } else log.fatal(result.error);
  }

  async areSimilarUsersPresent(entries, minimumMatch) {
    let shouldObject = [];
    for (let fieldName in entries) {
      let matchField = {};
      matchField[fieldName] = entries[fieldName];
      shouldObject.push({ match: matchField });
    }
    let userList = await userDAL.getUsers(shouldObject, minimumMatch);
    return userList.hits.hits.length > 0;
  }

  async generateScriptForUpdateByQuery(userDetails, isNull) {
    return `
        Map userMetaData = new HashMap();
        if(${isNull} != true) {
          userMetaData.put('uid', '${userDetails.uid}');
          userMetaData.put('first_name', '${userDetails.first_name}');
          userMetaData.put('last_name', '${userDetails.last_name}');
        }
        if(ctx._source.created_by != null && ctx._source.created_by.uid == '${userDetails.uid}') 
          ctx._source.created_by = ${isNull} ? null : userMetaData; 
        if(ctx._source.updated_by != null && ctx._source.updated_by.uid == '${userDetails.uid}') 
          ctx._source.updated_by = ${isNull} ? null : userMetaData;
        if(ctx._source.created_by_uid == '${userDetails.uid}') {
          ctx._source.contact_user = ${isNull} ? null : userMetaData;
          ctx._source.created_by_uid = ${isNull} ? null : '${userDetails.uid}';
        }
    `;
  }

  async getBodyForCascadeUpdateUsers(userDetails, isNull) {
    let scriptData = await this.generateScriptForUpdateByQuery(
      userDetails,
      isNull
    );
    let body = {
      query: {
        bool: {
          minimum_should_match: 1,
          should: [
            {
              match: {
                "created_by.uid": userDetails.uid,
              },
            },
            {
              match: {
                "updated_by.uid": userDetails.uid,
              },
            },
          ],
        },
      },
      script: {
        source: scriptData,
      },
    };
    console.log(JSON.stringify(body));
    return body;
  }
}

module.exports = new UserService();
