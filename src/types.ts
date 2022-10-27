export type TDict<T> = {
  [key: string]: T;
};

export type TEntity = {
  type: string;
  id: string;
};

export type JsonApiDataItem = TEntity & {
  attributes?: TDict<string>;
  relationships?: TDict<JsonApiResponse>;
  links?: TDict<string>;
};

export type JsonApiData = JsonApiDataItem | JsonApiDataItem[];

export type JsonApiResponse = {
  data: JsonApiData;
  links?: TDict<string>;
  included?: JsonApiDataItem[];
};

export type JsonResponse<T extends TEntity> = {
  data: TDict<T>;
  links?: TDict<string> | undefined;
  included?: TDict<JsonApiDataItem> | undefined;
};
