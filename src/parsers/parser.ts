import { JsonApiDataItem, JsonApiResponse, JsonResponse, TEntity } from '../types';

export function normalizeResponseData<T extends TEntity>(
    responseData: JsonApiDataItem[],
    includeLinks = false
): Record<string, T> {
    const data: Record<string, T> = {};

    for (const item of responseData) {
        const result: TEntity & Record<string, unknown> = {
            type: item.type,
            id: item.id,
            ...(item.attributes ?? {}),
        };

        if (includeLinks) {
            result['links'] = item.links;
        }

        const relationKeys = Object.keys(item.relationships ?? {});

        for (const key of relationKeys) {
            if (item.relationships && item.relationships[key] !== undefined) {
                result[key] = normalizeResponse(item.relationships[key]);
            }
        }

        data[item.id] = result as T;
    }

    return data;
}

export function normalizeResponse<T extends TEntity>(
    response: JsonApiResponse | undefined,
    includeLinks = false,
    includeIncluded = false
): JsonResponse<T> | undefined {
    if (response === undefined) {
        return undefined;
    }

    const dataArray = Array.isArray(response.data) ? response.data : [response.data];

    return {
        data: normalizeResponseData<T>(dataArray, includeLinks),
        links: includeLinks ? response.links : undefined,
        included:
            includeIncluded && response.included
                ? normalizeResponseData(response.included, includeLinks)
                : undefined,
    };
}
