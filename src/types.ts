export type TEntity = {
    type: string;
    id: string;
};

export type JsonApiDataItem = TEntity &
    Partial<{
        attributes: Record<string, string>;
        relationships: Record<string, JsonApiResponse>;
        links: Record<string, string>;
    }>;

export type JsonApiData = JsonApiDataItem | JsonApiDataItem[];

export type JsonApiResponse = {
    data: JsonApiData;
    links?: Record<string, string>;
    included?: JsonApiDataItem[];
};

export type JsonResponse<T extends TEntity> = {
    data: Record<string, T>;
    links?: Record<string, string> | undefined;
    included?: Record<string, JsonApiDataItem> | undefined;
};
