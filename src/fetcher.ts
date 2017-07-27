import { SubscriptionClient } from 'subscriptions-transport-ws';
import { parse } from 'graphql/language/parser';

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

export const graphQLFetcher = (subscriptionsClient: SubscriptionClient, fallbackFetcher?: Function) => {
  let activeSubscriptionId: string | null = null;

  return (graphQLParams: any) => {
    if (subscriptionsClient && activeSubscriptionId !== null) {
      subscriptionsClient.unsubscribe(activeSubscriptionId);
      activeSubscriptionId = null;
    }

    if (subscriptionsClient && (hasSubscriptionOperation(graphQLParams) ||
        (undefined === fallbackFetcher)) ) {
      return subscriptionsClient.request({
        query: graphQLParams.query,
        variables: graphQLParams.variables,
        operationName: graphQLParams.operationName,
      });
    } else {
      return fallbackFetcher(graphQLParams);
    }
  };
};
