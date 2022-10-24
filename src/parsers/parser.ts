import {
    JsonApiDataItem,
    JsonApiResponse,
    JsonResponse,
    TDict,
    TEntity,
} from "../types";

export function normalizeResponse<T extends TEntity>(
    response: JsonApiResponse,
    includeLinks: boolean = false,
    includeIncluded: boolean = false
): JsonResponse<T> {
    const dataArray = Array.isArray(response.data)
        ? response.data
        : [response.data];

    return {
        data: normalizeResponseData<T>(dataArray, includeLinks),
        links: includeLinks
            ? response.links
            : undefined,
        included: (includeIncluded && response.included)
            ? normalizeResponseData(response.included, includeLinks)
            : undefined,
    };
}

export function normalizeResponseData<T extends TEntity>(
    responseData: JsonApiDataItem[],
    includeLinks: boolean = false,
): TDict<T> {
    let data: TDict<T> = {};

    for (const item of responseData) {
        let result: any = {
            type: item.type,
            id: item.id,
            ...(item.attributes ?? {})
        }

        if (includeLinks) {
            result['links'] = item.links;
        }

        const relationKeys = Object.keys(item.relationships ?? {});

        for (const key of relationKeys) {
            if (item.relationships && item.relationships[key]) {
                result[key] = normalizeResponse(item.relationships[key]!)
            }
        }

        data[item.id] = result as T;
    }

    return data;
}