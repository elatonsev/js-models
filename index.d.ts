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


interface Model {
  id?: string;
  new (): ProxyConstructor;
  pushPayload(data: PayloadType): Model;
  serialize(serializer?: (resultJSON: PayloadType) => PayloadType): PayloadType;
}

declare function belongsTo(model: ModelConstructorType): BelongsToRelation;
declare function hasMany(model: ModelConstructorType): HasManyRelation;
declare function attr(type: AttrType, params?: AttrParamsType): Attr;
