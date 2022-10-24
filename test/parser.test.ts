import { normalizeResponse, normalizeResponseData } from '../src/parsers/parser';
import {
  JsonApiData,
  JsonApiDataItem,
  JsonApiResponse,
  JsonResponse,
} from '../src/types';

describe('Normalize response data', () => {
  describe('No relationships', () => {
    it('Empty array gives empty TDict', () => {
      const responseData: JsonApiData = [];
      const parsedResponse = normalizeResponseData(responseData);

      expect(parsedResponse).toEqual({});
    });

    it('Parses type and id', () => {
      const responseData: JsonApiData = [
        {
          type: 'cat',
          id: 'c',
        },
        {
          type: 'fox',
          id: 'f',
        },
        {
          type: 'duck',
          id: 'd',
        }
      ];

      const expected = {
        'c': { type: 'cat', id: 'c' },
        'f': { type: 'fox', id: 'f' },
        'd': { type: 'duck', id: 'd' }
      }

      const actual = normalizeResponseData(responseData);

      expect(actual).toEqual(expected);
    });

    it('Parses attributes', () => {
      const responseData: JsonApiData = [
        {
          type: 'with-attributes',
          id: '1',
          attributes: {
            name: 'Jim',
            age: '32',
            sex: 'M'
          }
        },
        {
          type: 'with-attributes',
          id: '2',
          attributes: {
            name: 'Sally',
            age: '23',
            sex: 'F'
          }
        }
      ];

      const expected = {
        '1': {
          type: 'with-attributes',
          id: '1',
          name: 'Jim',
          age: '32',
          sex: 'M'
        },
        '2': {
          type: 'with-attributes',
          id: '2',
          name: 'Sally',
          age: '23',
          sex: 'F'
        }
      }

      const actual = normalizeResponseData(responseData, false);

      expect(actual).toEqual(expected);
    });

    describe('Links', () => {
      const responseData: JsonApiDataItem[] = [
        {
          type: 'data-item-with-link',
          id: '1',
          links: {
            self: 'link-to-self-1',
          }
        },
        {
          type: 'data-item-with-link',
          id: '2',
          links: {
            self: 'link-to-self-2',
            previous: 'link-to-self-1',
          }
        }
      ];

      it('Parses links keys if includeLinks is true', () => {
        const expected = {
          '1': {
            type: 'data-item-with-link',
            id: '1',
            links: {
              self: 'link-to-self-1',
            }
          },
          '2': {
            type: 'data-item-with-link',
            id: '2',
            links: {
              self: 'link-to-self-2',
              previous: 'link-to-self-1',
            }
          }
        }

        const actual = normalizeResponseData(responseData, true);

        expect(actual).toEqual(expected);
      });

      it('Skips links keys if includeLinks is false', () => {
        const expected = {
          '1': {
            type: 'data-item-with-link',
            id: '1',
          },
          '2': {
            type: 'data-item-with-link',
            id: '2',
          }
        }

        const actual = normalizeResponseData(responseData, false);

        expect(actual).toEqual(expected);
      });
    })
  });
});

describe('Normalize response', () => {
  describe('Links', () => {
    const response: JsonApiResponse = {
      links: {
        'self': 'link-to-self',
        'next': 'next-page',
        'last': 'last-page',
      },
      data: [],
    }

    it('Parses links if includeLinks is true', () => {
      const expected: JsonResponse<never> = {
        links: response.links,
        data: {},
      }

      const actual = normalizeResponse(response, true, false);

      expect(actual).toEqual(expected);
    });

    it('Skips links if includeLinks is false', () => {
      const expected: JsonResponse<never> = {
        data: {}
      }

      const actual = normalizeResponse(response, false, false);

      expect(actual).toEqual(expected);
    })
  })

  describe('Includes', () => {
    const response: JsonApiResponse = {
      data: [],
      included: [
        {
          type: 'included-item',
          id: '1',
        },
        {
          type: 'included-item',
          id: '3',
        }
      ]
    }

    it('Parses includes if includeIncluded is true', () => {
      const expected: JsonResponse<never> = {
        data: {},
        included: {
          [response.included![0]!.id]: response.included![0]!,
          [response.included![1]!.id]: response.included![1]!,
        },
      }

      const actual = normalizeResponse(response, false, true);

      expect(actual).toEqual(expected);
    });

    it('Skips includes if includeIncluded is false', () => {
      const expected: JsonResponse<never> = {
        data: {},
      }

      const actual = normalizeResponse(response, false, false);

      expect(actual).toEqual(expected);
    })
  })

  describe('Parses data consistently with "normalizeResponseData"', () => {
    it('Handles single data item', () => {
      const response: JsonApiResponse = {
        data: {
          type: 'single-data-item',
          id: '1'
        }
      }

      assertConsistency(response);
    })

    it('Handles data item array', () => {
      const response: JsonApiResponse = {
        data: [
          {
            type: 'multi-item-1',
            id: '3',
          },
          {
            type: 'multi-item-2',
            id: '5'
          }
        ]
      }

      assertConsistency(response);
    });

    /* In this implementation, treat a single data object as a data item array
    *  containing a single object.
    */
    function assertConsistency(response: JsonApiResponse): void {
      const expected = normalizeResponse(response).data;

      const dataArray = Array.isArray(response.data)
        ? response.data
        : [response.data];

      const actual = normalizeResponseData(dataArray);

      expect(actual).toEqual(expected);
    }
  })
});