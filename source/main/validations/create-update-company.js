const Joi = require("joi");

const companyParamKeys = {
  cid: Joi.string().regex(
    /^COM-[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/
  ),
  name: Joi.string().min(5).max(128),
  gstin: Joi.string().min(3).max(50),
  tan: Joi.string().min(3).max(50),
  tin: Joi.string().min(3).max(50),
  cin: Joi.string().min(3).max(50),
  pan: Joi.string().min(3).max(50),
  types: Joi.array().items(Joi.string()),
  short_code: Joi.string().min(3).max(50),
  contact_number: Joi.string().length(10),
  contact_user_id: Joi.string().regex(
    /^USR-[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/
  ),
  place_id: Joi.string().regex(
    /^PLC-[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/
  ),
  head_office_id: Joi.string().regex(
    /^PLC-[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/
  ),
  is_active: Joi.boolean(),
  created_at: Joi.date().timestamp("unix"),
  updated_at: Joi.date().timestamp("unix"),
  created_by: Joi.string().regex(
    /^USR-[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/
  ),
  updated_by: Joi.string().regex(
    /^USR-[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/
  ),
};

class CreateUpdateCompanyValidation {
  async validateCreateUpdateCompanyData(payload) {
    const schema = Joi.object({
      cid: companyParamKeys.cid.required(),
      name: companyParamKeys.name.required(),
      gstin: companyParamKeys.gstin.allow(null).required(),
      tan: companyParamKeys.tan.allow(null).required(),
      tin: companyParamKeys.tin.allow(null).required(),
      cin: companyParamKeys.cin.allow(null).required(),
      pan: companyParamKeys.pan.allow(null).required(),
      types: companyParamKeys.types.required(),
      short_code: companyParamKeys.short_code.required(),
      contact_number: companyParamKeys.contact_number.allow(null).required(),
      contact_user_id: companyParamKeys.contact_user_id.allow(null).required(),
      place_id: companyParamKeys.place_id.allow(null).required(),
      head_office_id: companyParamKeys.head_office_id.allow(null).required(),
      is_active: companyParamKeys.is_active.required(),
      created_at: companyParamKeys.created_at.allow(null).required(),
      updated_at: companyParamKeys.updated_at.allow(null).required(),
      created_by: companyParamKeys.created_by.allow(null).required(),
      updated_by: companyParamKeys.updated_by.allow(null).required(),
    }).options({ abortEarly: false, allowUnknown: true });
    let result = await schema.validate(payload);
    return result;
  }
}

module.exports = new CreateUpdateCompanyValidation();
