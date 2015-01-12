
/**
 * Module Dependencies
 */

var _ = require('lodash'),
    ObjectId = require('mongodb').ObjectID,
    utils = require('./utils'),
    hasOwnProperty = utils.object.hasOwnProperty;

/**
 * Document
 *
 * Represents a single document in a collection. Responsible for serializing values before
 * writing to a collection.
 *
 * @param {Object} values
 * @param {Object} schema
 * @api private
 */

var Document = module.exports = function Document(values, schema) {

  // Keep track of the current document's values
  this.values = {};

  // Grab the schema for normalizing values
  this.schema = schema || {};

  // If values were passed in, use the setter
  if(values) this.values = this.setValues(values);

  return this;
};


/////////////////////////////////////////////////////////////////////////////////
// PRIVATE METHODS
/////////////////////////////////////////////////////////////////////////////////


/**
 * Set values
 *
 * Normalizes values into proper formats.
 *
 * @param {Object} values
 * @return {Object}
 * @api private
 */

Document.prototype.setValues = function setValues(values) {
  this.dottedToNested(values);
  this.serializeValues(values);
  this.normalizeId(values);

  return values;
};

/**
 * Normalize ID's
 *
 * Moves values.id into the preferred mongo _id field.
 *
 * @param {Object} values
 * @api private
 */

Document.prototype.normalizeId = function normalizeId(values) {

  if(!values.id) return;

  // Check if data.id looks like a MongoID
  if(_.isString(values.id) && values.id.match(/^[a-fA-F0-9]{24}$/)) {
    values.id = new ObjectId.createFromHexString(values.id);
  }

  values._id = _.cloneDeep(values.id);
  delete values.id;
};

/**
 * Serialize Insert Values
 *
 * @param {Object} values
 * @return {Object}
 * @api private
 */

Document.prototype.serializeValues = function serializeValues(values) {
  var self = this;

  Object.keys(values).forEach(function(key) {
    if(!hasOwnProperty(self.schema, key)) return;

    var type = self.schema[key].type,
        val;

    var foreignKey = self.schema[key].foreignKey || false;

    if(_.isUndefined(values[key])) return;

    // If a foreignKey, check if value matches a mongo id and if so turn it into an objectId
    if(foreignKey && utils.matchMongoId(values[key])) {
      values[key] = new ObjectId.createFromHexString(values[key]);
    }

    if(type === 'json') {
      try {
        val = JSON.parse(values[key]);
      } catch(e) {
        return;
      }
      values[key] = val;
    }
  });

  return values;
};

/**
 * Convert Dotted notation to Nested notation (only one level of nesting)
 *
 * Supported formats include:
 *    
 * comment.by = "value" =>  { comment: { by: "value"} }
 * comment.0.by = "value" => { comment: [ {by: "value"} ] }
 *
 * @param {Object} values
 * @return {Object}
 * @api public
 */

Document.prototype.dottedToNested = function dottedToNested(values) {
  var self = this;

  Object.keys(values).forEach(function(key) {

    var keys = key.split("."),
        val = values[key];
    var k = keys[0];

    // If the key has a single "dot", then split into key and subkey
    if(keys.length == 2) {
      if(_.isUndefined(values[k])) values[k] = {};
      values[k][keys[1]] = val;
      delete values[key];
      return;
    }

    if(keys.length == 3 && !isNaN(Number(keys[1]))) {
      var k = keys[0], 
          idx = Number(keys[1]),
          subkey = keys[2];
      if(_.isUndefined(values[k])) values[k] = [];
      if(_.isUndefined(values[k][idx])) values[k][idx] = {};
      values[k][idx][subkey] = val;
      delete values[key];
      return;
    }

  });

  return values;
};

/**
 * Validates the sub-document. Based on embed and model attributes present
 *
 * @param {Object} values
 * @param {Function} Callback
 * @return {}
 * @api public
 */

Document.prototype.validateSubDocument = function validateSubDocument(values, cb) {
  var self = this;

  Object.keys(values).forEach(function(key) {
    if(!hasOwnProperty(self.schema, key)) return;

    if(_.isUndefined(values[key])) return;

    var embed = self.schema[key].embed;
    var model = self.schema[key].model;

    if(embed && model && sails.models[model] && sails.models[model].validate) {
      sails.models[model].validate(values[key], cb);
    }
  });
};