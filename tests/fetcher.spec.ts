import { graphQLFetcher } from '../src/fetcher';

describe('GraphiQL Fetcher', () => {
  let subscriptionsClient;
  let fallbackFetcher;
  let fetcher: Function;

  beforeEach(() => {
    subscriptionsClient = {
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    };
    fallbackFetcher = jest.fn();
    fetcher = graphQLFetcher(<any>subscriptionsClient, fallbackFetcher);
  });

  it('should use subscriptions fetcher when using with named operation', () => {
    const ret = fetcher({
      query: 'subscription commentAdded { field }',
      operationName: 'commentAdded',
    });

    expect(ret.subscribe).not.toBe(undefined);
  });

  it('should use subscriptions fetcher when using with named operation with fragments', () => {
    const ret = fetcher({
      query: 'fragment f on MyType { field } subscription commentAdded { ...f }',
      operationName: 'commentAdded',
    });

    expect(ret.subscribe).not.toBe(undefined);
  });

  it('should use subscriptions fetcher when using with operation with fragments', () => {
    const ret = fetcher({
      query: 'fragment f on MyType { field } subscription { ...f }',
    });

    expect(ret.subscribe).not.toBe(undefined);
  });

  it('should use subscriptions fetcher when using with operation', () => {
    const ret = fetcher({
      query: 'subscription { ...f }',
    });

    expect(ret.subscribe).not.toBe(undefined);
  });

  it('should use fallback fetcher when using query', () => {
    fetcher({
      query: 'query { field }',
    });

    expect(fallbackFetcher.mock.calls.length).toBe(1);
  });

  it('should use fallback fetcher when using mutations', () => {
    fetcher({
      query: 'mutation { field }',
    });

    expect(fallbackFetcher.mock.calls.length).toBe(1);
  });
});
