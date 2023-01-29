class EntitySerializer {
  async cascadedUserSerializer(userDetails) {
    if (userDetails !== undefined)
      return {
        uid: userDetails.uid,
        first_name: userDetails.first_name,
        last_name: userDetails.last_name,
      };
    else return null;
  }

  async cascadedCompanySerializer(companyDetails) {
    if (companyDetails !== undefined)
      return { cid: companyDetails.cid, name: companyDetails.name };
    else return null;
  }

  async cascadedPlaceSerializer(placeDetails) {
    if (placeDetails !== undefined)
      return {
        pid: placeDetails.pid,
        label: placeDetails.label,
        address: placeDetails.address,
      };
    else return null;
  }

  async cascadedPlaceSerializerForRoutes(placeDetails) {
    if (placeDetails !== undefined)
      return {
        pid: placeDetails.pid,
        label: placeDetails.label,
        address: placeDetails.address,
        lat: placeDetails.lat,
        lng: placeDetails.lng,
        short_code: placeDetails.short_code,
        attributes: placeDetails.attributes,
        formatted_address: placeDetails.formatted_address,
        region: placeDetails.region,
        locality: placeDetails.locality,
        country: placeDetails.country,
        postal_code: placeDetails.postal_code,
      };
    else return null;
  }
}

module.exports = new EntitySerializer();
