declare module "@elatonsev/js-models" {
  type ModelConstructorType = new () => Model;
  type PayloadType = {
    [key: string]: any;
  };

  interface Relation {
    value: Model;
    model: ModelConstructorType;
  }

  interface BelongsToRelation extends Relation {
    setValue(value: Model | PayloadType): void;
    getValue(): Model | PayloadType;
  }

  interface HasManyRelation extends Relation {
    setValue(values: PayloadType[] | Model[]): void;
    getValue(): PayloadType[] | Model[];
  }


  type AttrType = 'number' | 'string' | 'boolean' | 'date';
  type AttrValueType = null | number | string | boolean | Date;
  type AttrParamsType = {
    defaultValue?: AttrValueType;
  };

  interface Attr {
    type: AttrType;
    value: AttrValueType;
    params: AttrParamsType;
    new (type: AttrType, params?: AttrParamsType): Attr;
    setValue(value: AttrValueType): void;
    getValue(): AttrValueType;
  }

  class Model {
    id: Attr;
    new (): ProxyConstructor;
    pushPayload(data: PayloadType): this;
    serialize(serializer?: (resultJSON: PayloadType) => PayloadType): PayloadType;
  }

  function belongsTo<T>(model: ModelConstructorType): T;
  function hasMany<T>(model: ModelConstructorType): T[];
  function attr(type: 'string', params?: AttrParamsType): string;
  function attr(type: 'number', params?: AttrParamsType): number;
  function attr(type: 'boolean', params?: AttrParamsType): boolean;
  function attr(type: 'date', params?: AttrParamsType): Date;
}
