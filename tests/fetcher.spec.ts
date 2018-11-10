import { graphQLFetcher } from '../src/fetcher';

describe('GraphiQL Fetcher', () => {
  let subscriptionsClient;
  let fallbackFetcher;
  let fetcher: Function;

  beforeEach(() => {
    subscriptionsClient = {
      request: jest.fn(),
      unsubscribeAll: jest.fn(),
    };
    fallbackFetcher = jest.fn();
    fetcher = graphQLFetcher(<any>subscriptionsClient, fallbackFetcher);
  });

  it('should use subscriptions fetcher when using with named operation', () => {
    fetcher({
      query: 'subscription commentAdded { field }',
      operationName: 'commentAdded',
    });

    expect(subscriptionsClient.request.mock.calls.length).toBe(1);
  });

  it('should use subscriptions fetcher when using with named operation with fragments', () => {
    fetcher({
      query: 'fragment f on MyType { field } subscription commentAdded { ...f }',
      operationName: 'commentAdded',
    });

    expect(subscriptionsClient.request.mock.calls.length).toBe(1);
  });

  it('should use subscriptions fetcher when using with operation with fragments', () => {
    fetcher({
      query: 'fragment f on MyType { field } subscription { ...f }',
    });

    expect(subscriptionsClient.request.mock.calls.length).toBe(1);
  });

  it('should use subscriptions fetcher when using with operation', () => {
    fetcher({
      query: 'subscription { ...f }',
    });

    expect(subscriptionsClient.request.mock.calls.length).toBe(1);
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

  describe('with no fallbackFetcher', () => {
    beforeEach(() => {
      fetcher = graphQLFetcher(<any>subscriptionsClient);
    });

    it('should use subscriptions fetcher when using with operation', () => {
      fetcher({
        query: 'subscription { ...f }',
      });

      expect(subscriptionsClient.request.mock.calls.length).toBe(1);
    });

    it('should use subscriptions fetcher when using query', () => {
      fetcher({
        query: 'query { field }',
      });

      expect(subscriptionsClient.request.mock.calls.length).toBe(1);
    });

    it('should use subscriptions fetcher when using mutations', () => {
      fetcher({
        query: 'mutation { field }',
      });

      expect(subscriptionsClient.request.mock.calls.length).toBe(1);
    });
  });
});
