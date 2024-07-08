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
    if (value === null) {
      this.value = null;
    } else if (value instanceof this.model) {
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
    if (values === null) {
      this.value = null;
    } else {
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
    if (value === null) {
      if ('defaultValue' in this.params) {
        this.value = params.defaultValue;
      } else {
        this.value = null;
      }
      return;
    }

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

  convertLocalKeyToServerKey(key) {
    // Преобразование формата локального ключа к серверному.
    // По умолчанию локальные ключи camelCased, серверные snake_case
    return key.split(/\.?(?=[A-Z])/).join('_').toLowerCase();
  }

  pushPayload (data={}) {
    for (let localKey in this) {
      let serverKey = this.convertLocalKeyToServerKey(localKey);

      // В payload есть данные для этого ключа
      if (serverKey in data && data[serverKey] != null) {
        if (this[localKey] instanceof Relation || this[localKey] instanceof Attr) {
          this[localKey].setValue(data[serverKey]);
        } else {
          this[localKey] = data[serverKey];
        }
      }
    }
    return this;
  }

  serialize(serializer=null) {
    let resultJSON = {};

    for (let localKey in this) {
      let serverKey = this.convertLocalKeyToServerKey(localKey);

      if (this[localKey] instanceof Model) {
        resultJSON[serverKey] = this[localKey].serialize();
      }
      else if (this[localKey] instanceof HasManyRelationValue) {
        resultJSON[serverKey] = [];
        this[localKey].forEach(model => {
          resultJSON[serverKey].push(model.serialize());
        });
      }
      else if (this[localKey] instanceof Date) {
        resultJSON[serverKey] = moment(this[localKey]).format('YYYY-MM-DDTHH:mm:ss');
      }
      else {
        resultJSON[serverKey] = this[localKey];
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