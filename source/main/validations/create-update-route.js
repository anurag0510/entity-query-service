const Joi = require("joi");

const routeParamKeys = {
  rid: Joi.string().regex(
    /^RTE-[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/
  ),
  label: Joi.string().min(3).max(256),
  short_code: Joi.string().min(3).max(50),
  parent_id: Joi.string().regex(
    /^COM-[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/
  ),
  origin_pid: Joi.string().regex(
    /^PLC-[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/
  ),
  destination_pid: Joi.string().regex(
    /^PLC-[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/
  ),
  attributes: Joi.object().keys({
    standard_transit_time_in_mins: Joi.number(),
    standard_distance_in_kilometers: Joi.number(),
  }),
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

class CreateUpdateRouteValidation {
  async validateCreateUpdateRouteData(payload) {
    const schema = Joi.object({
      rid: routeParamKeys.rid.required(),
      label: routeParamKeys.label.required(),
      short_code: routeParamKeys.short_code.required(),
      parent_id: routeParamKeys.parent_id.required(),
      origin_pid: routeParamKeys.origin_pid.required(),
      destination_pid: routeParamKeys.destination_pid.required(),
      attributes: routeParamKeys.attributes.required(),
      is_active: routeParamKeys.is_active.required(),
      created_at: routeParamKeys.created_at.allow(null).required(),
      updated_at: routeParamKeys.updated_at.allow(null).required(),
      created_by: routeParamKeys.created_by.allow(null).required(),
      updated_by: routeParamKeys.updated_by.allow(null).required(),
    }).options({ abortEarly: false, allowUnknown: true });
    let result = await schema.validate(payload);
    return result;
  }
}

module.exports = new CreateUpdateRouteValidation();
