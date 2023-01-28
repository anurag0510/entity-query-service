const Joi = require("joi");

const userParamKeys = {
  uid: Joi.string().regex(
    /^USR-[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/
  ),
  user_name: Joi.string().min(5).max(30),
  first_name: Joi.string().min(3).max(128),
  last_name: Joi.string().min(3).max(128),
  email_address: Joi.string().email(),
  country_code: Joi.string().valid("91"),
  mobile_number: Joi.string().length(10),
  address: Joi.string().min(10).max(255),
  country: Joi.string().min(2).max(100),
  city: Joi.string().min(2).max(100),
  is_active: Joi.boolean(),
  created_at: Joi.date().timestamp("unix"),
  updated_at: Joi.date().timestamp("unix"),
  created_by: Joi.string().regex(
    /^USR-[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/
  ),
  updated_by: Joi.string().regex(
    /^USR-[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/
  ),
  creater_updater_object: Joi.object().keys({
    uid: Joi.string().regex(
      /^USR-[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/
    ),
    first_name: Joi.string().min(3).max(128),
    last_name: Joi.string().min(3).max(128),
  }),
};

class CreateUpdateUserValidation {
  async validateCreateUpdateUserData(payload) {
    const schema = Joi.object({
      uid: userParamKeys.uid.required(),
      user_name: userParamKeys.user_name.required(),
      first_name: userParamKeys.first_name.required(),
      last_name: userParamKeys.last_name.required(),
      email_address: userParamKeys.email_address.required(),
      country_code: userParamKeys.country_code.required(),
      mobile_number: userParamKeys.mobile_number.required(),
      address: userParamKeys.address,
      country: userParamKeys.country,
      city: userParamKeys.city,
      is_active: userParamKeys.is_active.required(),
      created_at: userParamKeys.created_at.allow(null).required(),
      updated_at: userParamKeys.updated_at.allow(null).required(),
      created_by: Joi.alternatives(
        userParamKeys.created_by,
        userParamKeys.creater_updater_object
      )
        .allow(null)
        .required(),
      updated_by: Joi.alternatives(
        userParamKeys.updated_by,
        userParamKeys.creater_updater_object
      )
        .allow(null)
        .required(),
    }).options({ abortEarly: false, allowUnknown: true });
    let result = await schema.validate(payload);
    return result;
  }
}

module.exports = new CreateUpdateUserValidation();
