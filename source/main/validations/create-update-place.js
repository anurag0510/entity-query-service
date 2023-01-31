const Joi = require("joi");

const placeParamKeys = {
  pid: Joi.string().regex(
    /^PLC-[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/
  ),
  label: Joi.string().min(5).max(128),
  address: Joi.string().min(3).max(256),
  latitude: Joi.number(),
  longitude: Joi.number(),
  geometry: Joi.object().keys({
    type: Joi.string(),
    coordinates: Joi.array().items(Joi.number()),
  }),
  shape: Joi.object().keys({
    type: Joi.string(),
    coordinates: Joi.array().items(
      Joi.array().items(Joi.array().items(Joi.number()))
    ),
  }),
  attributes: Joi.object().keys({
    google: Joi.object().keys({
      place_id: Joi.string(),
      geometry: Joi.object().keys({
        location: Joi.object().keys({
          lat: Joi.number(),
          lng: Joi.number(),
        }),
        viewport: Joi.object().keys({
          northeast: Joi.object().keys({
            lat: Joi.number(),
            lng: Joi.number(),
          }),
          southwest: Joi.object().keys({
            lat: Joi.number(),
            lng: Joi.number(),
          }),
        }),
      }),
    }),
  }),
  region: Joi.string().min(3).max(50),
  locality: Joi.string().min(3).max(50),
  country: Joi.string().min(3).max(50),
  short_code: Joi.string().min(3).max(50),
  google_place_id: Joi.string(),
  formatted_address: Joi.string(),
  parent_id: Joi.string().regex(
    /^COM-[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/
  ),
  postal_code: Joi.string().min(3).max(50),
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

class CreateUpdatePlaceValidation {
  async validateCreateUpdatePlaceData(payload) {
    const schema = Joi.object({
      pid: placeParamKeys.pid.required(),
      label: placeParamKeys.label.required(),
      address: placeParamKeys.address,
      lat: placeParamKeys.latitude.required(),
      lng: placeParamKeys.longitude.required(),
      geometry: placeParamKeys.geometry.required(),
      shape: placeParamKeys.shape.required(),
      attributes: placeParamKeys.attributes.required(),
      region: placeParamKeys.region.allow(null),
      locality: placeParamKeys.locality.allow(null),
      country: placeParamKeys.country.allow(null),
      short_code: placeParamKeys.short_code.required(),
      google_place_id: placeParamKeys.google_place_id.required(),
      formatted_address: placeParamKeys.formatted_address,
      parent_id: placeParamKeys.parent_id.required(),
      postal_code: placeParamKeys.postal_code.allow(null),
      is_active: placeParamKeys.is_active.required(),
      created_at: placeParamKeys.created_at.allow(null).required(),
      updated_at: placeParamKeys.updated_at.allow(null).required(),
      created_by: placeParamKeys.created_by.allow(null).required(),
      updated_by: placeParamKeys.updated_by.allow(null).required(),
    }).options({ abortEarly: false, allowUnknown: true });
    let result = await schema.validate(payload);
    return result;
  }
}

module.exports = new CreateUpdatePlaceValidation();
