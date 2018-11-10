import { SubscriptionClient } from 'subscriptions-transport-ws';
import { parse } from 'graphql';

const hasSubscriptionOperation = (graphQlParams: any) => {
  const queryDoc = parse(graphQlParams.query);

  for (let definition of queryDoc.definitions) {
    if (definition.kind === 'OperationDefinition') {
      const operation = definition.operation;
      if (operation === 'subscription') {
        return true;
      }
    }
  }

  return false;
};

export const graphQLFetcher = (subscriptionsClient: SubscriptionClient, fallbackFetcher: Function) => {
  let activeSubscription = false;

  return (graphQLParams: any) => {
    if (!subscriptionsClient) {
      return fallbackFetcher(graphQLParams);
    }

    if (activeSubscription) {
      subscriptionsClient.unsubscribeAll();
    }

    const subscriptionRequest = () => {
      activeSubscription = true;

      return subscriptionsClient.request({
        query: graphQLParams.query,
        variables: graphQLParams.variables,
        operationName: graphQLParams.operationName,
      });
    };

    if (hasSubscriptionOperation(graphQLParams)) {
      return subscriptionRequest();
    }

    if (fallbackFetcher) {
      return fallbackFetcher(graphQLParams);
    }

    return subscriptionRequest();
  };
};
