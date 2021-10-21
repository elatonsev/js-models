# Js Models
Package allows to describe models in your app, create model objects from the REST API payload and
serivalize model object to JSON.


# Example

### Define models
```javascript
class Client extends Model {
  name = attr('string');
}

class Product extends Model {
  name = attr('string');
}

class Order extends Model {
  name = attr('string', {defaultValue: 'Hi'});
  number = attr('number', {defaultValue: 0});
  is_valid = attr('boolean');
  date = attr('date');
  products = hasMany(Product);
  client = belongsTo(Client);
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
    name: 'Client1'
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