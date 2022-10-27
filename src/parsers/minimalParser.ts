import { JsonApiData, TDict, TEntity } from '../types';

/* A minimal parser which flattens attributes and relationships, while ignoring links
 *  and included keys.
 */
export function flattenResponseData<T extends TEntity>(
  responseData: JsonApiData | undefined
): T | TDict<T> | undefined {
  if (responseData === undefined) {
    return undefined;
  }

  if (Array.isArray(responseData)) {
    const flatData: TDict<T> = {};

    for (const item of responseData) {
      const result: any = {
        type: item.type,
        id: item.id,
        ...(item.attributes ?? {}),
      };

      for (const key in item.relationships) {
        if (item.relationships[key] && item.relationships[key]?.data) {
          result[key] = flattenResponseData<TEntity>(item.relationships[key]?.data);
        }
      }

      flatData[item.id] = result;
    }

    return flatData;
  } else {
    const flatData: any = {
      type: responseData.type,
      id: responseData.id,
      ...(responseData.attributes ?? {}),
    };

    for (const key in responseData.relationships) {
      if (responseData.relationships[key] && responseData.relationships[key]?.data) {
        flatData[key] = flattenResponseData<TEntity>(
          responseData.relationships[key]?.data
        );
      }
    }

    return flatData as T;
  }
}
