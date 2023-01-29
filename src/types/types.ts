// TODO Implement the Json:API document structure in types

export type TEntity = {
    type: string;
    id: string;
};

export type JsonApiDataItem = TEntity &
    Partial<{
        attributes: Record<string, string>;
        relationships: Record<string, JsonApiResponse | undefined>;
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

// Experimenting with candidate for improved types.
type Join<K, P> = K extends string | number
    ? P extends string | number
        ? `${K}${'' extends P ? '' : '.'}${P}`
        : never
    : never;

type Prev = [
    never,
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    ...0[]
];

type Paths<T, D extends number = 10> = [D] extends [never]
    ? never
    : T extends object
    ? {
          [K in keyof T]-?: K extends string | number
              ? `${K}` | Join<K, Paths<T[K], Prev[D]>>
              : never;
      }[keyof T]
    : '';

type Leaves<T, D extends number = 10> = [D] extends [never]
    ? never
    : T extends object
    ? { [K in keyof T]-?: Join<K, Leaves<T[K], Prev[D]>> }[keyof T]
    : '';

type AttributePaths<T extends object> = {
    keys: Array<Paths<T>>;
};

const trans = {
    a: 'one',
    b: 'two',
    c: {
        d: 'four',
        e: {
            f: 'six',
            g: 'seven',
        },
    },
};

export type S = Paths<typeof trans>;
export type T = Leaves<typeof trans.c.e>;
export type U = AttributePaths<typeof trans>;
