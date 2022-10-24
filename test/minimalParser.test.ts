import { JsonApiDataItem, TDict, TEntity } from "../src/types"
import { flattenResponseData } from "../src/parsers/minimalParser"

describe('Minimal parser: flattenResponseData', () => {
  describe('Single data object', () => {
    const baseData: JsonApiDataItem = {
      type: 'single-data-item',
      id: '1',
      attributes: {
        age: '19',
        height: '168',
        hair: 'brown',
      },
    }

    const flatBaseData = {
      type: 'single-data-item',
      id: '1',
      age: '19',
      height: '168',
      hair: 'brown',
    }

    it('Picks up id, type and attributes, ignores links', () => {
      const actual = flattenResponseData(baseData);

      expect(actual).toEqual(flatBaseData);
    });

    it('Flattens relationships', () => {
      const responseData = {
        ...baseData,
        relationships: {
          college: {
            data: {
              type: 'college',
              id: '5',
              attributes: {
                name: 'New College',
              },
            },
          },
        }
      }

      const expected = {
        ...flatBaseData,
        college: {
          type: 'college',
          id: '5',
          name: 'New College',
        },
      }

      const actual = flattenResponseData(responseData);

      expect(actual).toEqual(expected);
    });

    it('Ignores links', () => {
      const responseData = {
        ...baseData,
        links: {
          self: 'link-to-self',
        }
      }

      const flatData = flattenResponseData<TEntity & { links: string }>(responseData);

      expect(flatData['links']).toBeUndefined();
    });
  });

  describe('Handles data item array', () => {
    it('With single level relationships', () => {
      const responseData: JsonApiDataItem[] = [
        {
          type: 'student',
          id: '1',
          attributes: {
            name: 'Izzy',
            age: '22',
          },
          relationships: {
            college: {
              data: {
                type: 'college',
                id: '4',
                attributes: {
                  name: 'New College',
                },
              },
            },
          },
        },
        {
          type: 'student',
          id: '2',
          attributes: {
            name: 'Tom',
            age: '28',
          },
          relationships: {
            college: {
              data: {
                type: 'college',
                id: '5',
                attributes: {
                  name: 'Greenleaf'
                },
              },
            },
          },
        },
      ];

      type TResponse = TEntity & {
        name: string,
        age: string,
        college: TEntity & { name: string },
      }

      const expected: TDict<TResponse> = {
        '1': {
          type: 'student',
          id: '1',
          name: 'Izzy',
          age: '22',
          college: {
            type: 'college',
            id: '4',
            name: 'New College',
          },
        },
        '2': {
          type: 'student',
          id: '2',
          name: 'Tom',
          age: '28',
          college: {
            type: 'college',
            id: '5',
            name: 'Greenleaf',
          },
        }
      }

      const actual = flattenResponseData<TResponse>(responseData);

      expect(actual).toEqual(expected);
    });
  });

  describe('Handles complex relationships', () => {
    it('Deep and narrow', () => {
      const responseData: JsonApiDataItem[] = [
        {
          type: 'student',
          id: '1',
          attributes: {
            name: 'Izzy',
            age: '22',
          },
          relationships: {
            college: {
              data: {
                type: 'college',
                id: '4',
                attributes: {
                  name: 'New College',
                },
                relationships: {
                  university: {
                    data: {
                      type: 'university',
                      id: '7',
                      attributes: {
                        name: 'Oxford',
                      },
                      relationships: {
                        country: {
                          data: {
                            type: 'country',
                            id: '1',
                            attributes: {
                              name: 'United Kingdom',
                            },
                            relationships: {
                              continent: {
                                data: {
                                  type: 'continent',
                                  id: '19',
                                  attributes: {
                                    name: 'Europe',
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        {
          type: 'student',
          id: '2',
          attributes: {
            name: 'Tom',
            age: '28',
          },
          relationships: {
            college: {
              data: {
                type: 'college',
                id: '5',
                attributes: {
                  name: 'Greenleaf'
                },
                relationships: {
                  university: {
                    data: {
                      type: 'university',
                      id: '11',
                      attributes: {
                        name: 'Bath',
                      },
                      relationships: {
                        country: {
                          data: {
                            type: 'country',
                            id: '1',
                            attributes: {
                              name: 'United Kingdom',
                            },
                            relationships: {
                              continent: {
                                data: {
                                  type: 'continent',
                                  id: '19',
                                  attributes: {
                                    name: 'Europe',
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      ];

      type TResponse = TEntity & {
        name: string,
        age: string,
        college: TEntity & {
          name: string,
          university: TEntity & {
            name: string,
            country: TEntity & {
              name: string,
              continent: TEntity & {
                name: string,
              },
            },
          },
        },
      }

      const expected: TDict<TResponse> = {
        '1': {
          type: 'student',
          id: '1',
          name: 'Izzy',
          age: '22',
          college: {
            type: 'college',
            id: '4',
            name: 'New College',
            university: {
              type: 'university',
              id: '7',
              name: 'Oxford',
              country: {
                type: 'country',
                id: '1',
                name: 'United Kingdom',
                continent: {
                  type: 'continent',
                  id: '19',
                  name: 'Europe',
                }
              },
            },
          },
        },
        '2': {
          type: 'student',
          id: '2',
          name: 'Tom',
          age: '28',
          college: {
            type: 'college',
            id: '5',
            name: 'Greenleaf',
            university: {
              type: 'university',
              id: '11',
              name: 'Bath',
              country: {
                type: 'country',
                id: '1',
                name: 'United Kingdom',
                continent: {
                  type: 'continent',
                  id: '19',
                  name: 'Europe',
                }
              },
            },
          },
        },
      }

      const actual = flattenResponseData<TResponse>(responseData);

      expect(actual).toEqual(expected);
    });

    it('Shallow, wide and mixed objects and arrays', () => {
      const responseData: JsonApiDataItem = {
        type: 'profile',
        id: '32',
        attributes: {
          name: 'Tim',
        },
        relationships: {
          career: {
            data: {
              type: 'career',
              id: '1',
              attributes: {
                name: 'Software Developer',
                level: 'Junior',
              },
            }
          },
          degrees: {
            data: [
              {
                type: 'degree',
                id: '0',
                attributes: {
                  name: 'Master of Mathematics',
                  title: 'MMath',
                },
                relationships: {
                  university: {
                    data: {
                      type: 'university',
                      id: '17',
                      attributes: {
                        name: 'University of Bath',
                      },
                    },
                  },
                },
              },
              {
                type: 'degree',
                id: '1',
                attributes: {
                  name: 'Doctor of Philosophy',
                  title: 'Dr',
                },
                relationships: {
                  university: {
                    data: {
                      type: 'university',
                      id: '17',
                      attributes: {
                        name: 'University of Bath',
                      },
                    },
                  },
                },
              },
            ],
          },
        },
      }

      type TResponse = TEntity & {
        name: string,
        career: TEntity & {
          name: string,
          level: string,
        },
        degrees: TDict<TEntity & {
          name: string,
          title: string
          university: TEntity & { name: string }
        }>,
      }

      const expected: TResponse = {
        type: 'profile',
        id: '32',
        name: 'Tim',
        career: {
          type: 'career',
          id: '1',
          name: 'Software Developer',
          level: 'Junior',
        },
        degrees: {
          '0': {
            type: 'degree',
            id: '0',
            name: 'Master of Mathematics',
            title: 'MMath',
            university: {
              type: 'university',
              id: '17',
              name: 'University of Bath',
            }
          },
          '1': {
            type: 'degree',
            id: '1',
            name: 'Doctor of Philosophy',
            title: 'Dr',
            university: {
              type: 'university',
              id: '17',
              name: 'University of Bath',
            }
          },
        },
      }

      const actual = flattenResponseData<TResponse>(responseData);

      expect(actual).toEqual(expected);
    });
  });
});
