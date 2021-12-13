import moment from 'moment';
import { Model, attr, belongsTo, hasMany } from './index';

class Client extends Model {
  name = attr('string');
  custom_array = attr('json', {defaultValue: []});
  custom_object = attr('json', {defaultValue: {}});
}

class Product extends Model {
  name = attr('string');
}

class Order extends Model {
  name = attr('string', {defaultValue: 'Hi'});
  number = attr('number', {defaultValue: 0});
  is_valid = attr('boolean', {defaultValue: false});
  date = attr('date');
  products = hasMany(Product);
  client = belongsTo(Client);
}


test('Create model object', () => {
  const order = new Order();
  order.name = 'Test name';
  order.products.push(new Product().pushPayload({id: 1, name: 'Test product'}));

  expect(order.name).toBe('Test name');
  expect(order.is_valid).toBe(false);
  expect(order.products[0].name).toBe('Test product');
});

test('Push payload', () => {
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

  expect(order).toBeInstanceOf(Order);
  expect(order.client).toBeInstanceOf(Client);
  expect(order.products[0]).toBeInstanceOf(Product);

  expect(order.name).toBe('Test name');
  expect(order.number).toBe(123);
  expect(order.date).toStrictEqual(moment('2021-05-06').toDate());
  expect(order.client.name).toBe('Client1');
  expect(order.products[0].name).toBe('Maffin');
});

test('Serialize object', () => {
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

  const orderSerializer = function(serializedOrder) {
    return {
      ...serializedOrder,
      date: serializedOrder.date ? moment(serializedOrder.date).format('YYYY-MM-DD') : null
    }
  }

  expect(order.serialize(orderSerializer)).toStrictEqual({
    id: '1',
    name: 'Test name',
    number: 123,
    is_valid: false,
    date: '2021-05-06',
    products: [ { id: '2', name: 'Maffin' }, { id: '3', name: 'Coffee' } ],
    client: {
      id: '1',
      name: 'Client1',
      custom_array: [500, 512, 525, 640],
      custom_object: {'key1': 'value1', 'key2': {'nested_key1': 'nested_value'}}
    }
  });
});