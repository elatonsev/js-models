# Js Models
Package allows to describe models with relations in your app, create model objects from the REST API payload and
serialize model object to JSON.

# Installation
```
yarn add @elatonsev/js-models
```

# Examples

### Define models
```javascript
import { Model, attr, belongsTo, hasMany } from '@elatonsev/js-models';

class Client extends Model {
  name = attr('string');
  schedule = attr('json', {defaultValue: []});
}

class Product extends Model {
  name = attr('string');
}

class Order extends Model {
  name = attr('string', {defaultValue: 'Hi'});
  number = attr('number', {defaultValue: 0});
  isValid = attr('boolean');
  date = attr('date');
  products = hasMany(Product);
  client = belongsTo(Client);
}
```

### Define models using TypeScript
```javascript
import { Model, attr, belongsTo, hasMany } from '@elatonsev/js-models';

class Client extends Model {
  name = attr('string');
  customArray = attr('json', {defaultValue: []});
  customObject = attr('json', {defaultValue: {}});
}

class Product extends Model {
  name = attr('string');
}

class Order extends Model {
  name = attr('string', {defaultValue: 'Hi'});
  number = attr('number', {defaultValue: 0});
  isValid = attr('boolean');
  date = attr('date');
  products = hasMany<Product>(Product);
  client = belongsTo<Client>(Client);
}
```

### Create objects from nested JSON payload
```javascript
const order = new Order().pushPayload({
  id: 1,
  date: '2021-05-06',
  name: 'Test name',
  is_valid: false,
  number: '123',
  products: [{
    id: 2,
    name: 'Maffin'
  },
  {
    id: 3,
    name: 'Coffee'
  }],
  client: {
    id: 1,
    name: 'Client1',
    custom_array: [500, 512, 525, 640],
    custom_object: {'key1': 'value1', 'key2': {'nested_key1': 'nested_value'}}
  }
});
```

### Serialize objects to JSON payload
```javascript
client.serialize();
```

### Serialize objects to JSON payload using custom serializer
```javascript
const orderSerializer = function(serializedOrder) {
  return {
    ...serializedOrder,
    date: serializedOrder.date ? moment(serializedOrder.date).format('YYYY-MM-DD') : null
  }
}
order.serialize(orderSerializer);
```