import { JsonApiData, TEntity } from '../types';

/* A minimal parser which flattens attributes and relationships, while ignoring links
 *  and included keys.
 */
export function flattenResponseData<T extends TEntity>(
    responseData: JsonApiData | undefined
): T | Record<string, T> | undefined {
    if (responseData === undefined) {
        return undefined;
    }

    if (Array.isArray(responseData)) {
        const flatData: Record<string, T> = {};

        for (const item of responseData) {
            const result: TEntity & Record<string, unknown> = {
                type: item.type,
                id: item.id,
                ...(item.attributes ?? {}),
            };

            for (const key in item.relationships) {
                if (item.relationships[key] && item.relationships[key]?.data) {
                    result[key] = flattenResponseData<TEntity>(
                        item.relationships[key]?.data
                    );
                }
            }

            flatData[item.id] = result as T;
        }

        return flatData;
    } else {
        const flatData: TEntity & Record<string, unknown> = {
            type: responseData.type,
            id: responseData.id,
            ...(responseData.attributes ?? {}),
        };

        for (const key in responseData.relationships) {
            if (
                responseData.relationships[key] &&
                responseData.relationships[key]?.data
            ) {
                flatData[key] = flattenResponseData<TEntity>(
                    responseData.relationships[key]?.data
                );
            }
        }

        return flatData as T;
    }
}
