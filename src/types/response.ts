export type Optional<T> = T | undefined;
export type Nullable<T> = T | null;
export type AtLeastOne<T> = {
    [K in keyof T]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<keyof T, K>>>;
}[keyof T];

export type ResourceIdentifier =
    | {
          id: string;
          type: string;
      }
    | {
          lid: string;
          type: string;
      };

// Non-standard metadata object type.
export type Meta = Record<string, unknown>;

export type Link = {
    href: string;
} & Partial<{
    rel: Optional<string>;
    describedby: Optional<string>;
    title: Optional<string>;
    type: Optional<string>;
    hreflang: Optional<string | string[]>;
    meta: Optional<Meta>;
}>;

// Where specified, a links member can be used to represent links.
export type Links = Record<string, string | Nullable<Link>>;

export type JsonError = AtLeastOne<{
    id: string;
    links: Links;
    status: string;
    code: string;
    title: string;
    detail: string;
    source: Partial<{
        pointer: string;
        parameter: string;
        header: string;
    }>;
    meta: Meta;
}>;

export type Attributes = Record<string, unknown>;

export type ResourceLink = ResourceIdentifier | ResourceIdentifier[] | null;

export type Relationship = {
    links: Links;
    data: ResourceLink;
    meta: Meta;
};

export type Relationships = Record<string, Relationship>;

export type Resource = ResourceIdentifier &
    Partial<{
        attributes: Attributes;
        relationships: Relationships;
        links: Links;
        meta: Meta;
    }>;

export type JsonData =
    | Resource
    | Resource[]
    | ResourceIdentifier
    | ResourceIdentifier[]
    | null;

export type JsonApi = Partial<{
    version: string;
    ext: string[];
    profile: string[];
    meta: Meta;
}>;

export type JsonResponse = AtLeastOne<{
    data: JsonData;
    errors: JsonError[];
    meta: Meta;
}> &
    Partial<{
        jsonapi: JsonApi;
        links: Links;
        included: Resource[];
    }>;
