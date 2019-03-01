import { parse } from 'graphql';
import { SubscriptionClient } from 'subscriptions-transport-ws';

const hasSubscriptionOperation = (graphQlParams: any) => {
  const queryDoc = parse(graphQlParams.query);

  for (const definition of queryDoc.definitions) {
    if (definition.kind === 'OperationDefinition') {
      const operation = definition.operation;
      if (operation === 'subscription') {
        return true;
      }
    }
  }

  return false;
};

export const graphQLFetcher = (
  subscriptionsClient: SubscriptionClient,
  fallbackFetcher: (graphQLParams: object) => Promise<any>,
) => {
  let activeSubscription: { unsubscribe: () => void } | null = null;

  return (graphQLParams: any) => {
    if (activeSubscription !== null) {
      activeSubscription.unsubscribe();
    }

    if (subscriptionsClient && hasSubscriptionOperation(graphQLParams)) {
      return {
        subscribe: (observer: {
          error: (error: Error) => void;
          next: (value: any) => void;
        }) => {
          observer.next(
            'Your subscription data will appear here after server publication!',
          );

          activeSubscription = subscriptionsClient
            .request({
              query: graphQLParams.query,
              variables: graphQLParams.varaibles,
            })
            .subscribe(observer);
        },
      };
    }

    return fallbackFetcher(graphQLParams);
  };
};
