import moment from 'moment';

/**
 * Relaton abstract class
 */
class Relation {
  constructor (model) {
    this.value = null;
    this.model = model;
  }

  getValue() {
    return this.value;
  }
}

/**
 * One-To-One relation
 */
class BelongsToRelation extends Relation {
  setValue(value) {
    if (value instanceof this.model) {
      this.value = value;
    } else {
      this.value = new this.model().pushPayload(value);
    }
  }
}

/**
 * Class for storing HasManyRelations
 */
class HasManyRelationValue extends Array {};

/**
 * One-To-Many relation
 */
class HasManyRelation extends Relation {
  constructor (model) {
    super(model);
    this.value = new HasManyRelationValue();
  }

  setValue(values) {
    this.value = new HasManyRelationValue();

    values.forEach(value => {
      if (value instanceof this.model) {
        this.value.push(value);
      } else {
        this.value.push(new this.model().pushPayload(value));
      }
    });
  }
}

/**
 * Modal attribute
 */
class Attr {
  constructor (type, params={}) {
    this.type = type;
    this.value = null;
    this.params = params;

    if ('defaultValue' in params) {
      this.setValue(params.defaultValue);
    }
  }

  setValue(value) {
    switch (this.type) {
      case 'number':
        this.value = Number(typeof value == 'string' ? value.replace(',', '.') : value);
        break;
      case 'string':
        this.value = String(value);
        break;
      case 'date':
        // Use moment, because old Safari versions ignore timezone shift while using new Date();
        this.value = moment(value).toDate();
        break;
      case 'boolean':
        this.value = Boolean(value);
        break;
      case 'json':
        this.value = value;
        break;
    }
  }

  getValue() {
    return this.value;
  }
}

/**
 * Model class
 */
class Model {
  constructor () {
    this.id = attr('string');

    return new Proxy(this, {
      set: (object, key, value) => {
        if (object[key] instanceof Relation || object[key] instanceof Attr) {
          object[key].setValue(value);
        } else {
          object[key] = value;
        }
        return true;
      },
      get: function(object, key){
        if (object[key] instanceof Relation || object[key] instanceof Attr) {
          return object[key].getValue();
        } else {
          return object[key];
        }
      }
    });
  }

  pushPayload (data={}) {
    for (let key in this) {
      // В payload есть данные для этого ключа
      if (key in data && data[key] != null) {
        if (this[key] instanceof Relation || this[key] instanceof Attr) {
          this[key].setValue(data[key]);
        } else {
          this[key] = data[key];
        }
      }
    }
    return this;
  }

  serialize(serializer=null) {
    let resultJSON = {};

    for (let key in this) {
      if (this[key] instanceof Model) {
        resultJSON[key] = this[key].serialize();
      }
      else if (this[key] instanceof HasManyRelationValue) {
        resultJSON[key] = [];
        this[key].forEach(model => {
          resultJSON[key].push(model.serialize());
        });
      }
      else {
        resultJSON[key] = this[key];
      }
    }

    if (serializer) {
      return serializer(resultJSON);
    } else {
      return resultJSON;
    }
  }
}


/**
 * One-To-One relation alias
 */
function belongsTo(model) {
  return new BelongsToRelation(model);
}

/**
 * One-To-Many relation alias
 */
function hasMany(model) {
  return new HasManyRelation(model);
}

/**
 * Model attribute alias
 */
function attr(type, options) {
  return new Attr(type, options);
}

export { Model, belongsTo, hasMany, attr };