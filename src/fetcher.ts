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

function getObserver(observerOrNext: { error: Function, next: Function, complete: Function }, error?: Function, complete?: Function) {
  if ( typeof observerOrNext === 'function' ) {
    return {
      next: (v: any) => observerOrNext(v),
      error: (e: Error) => error && error(e),
      complete: () => complete && complete(),
    };
  }

  return observerOrNext;
}

export const graphQLFetcher = (subscriptionsClient: SubscriptionClient, fallbackFetcher?: Function) => {
  let activeSubscriptionId: string | null = null;

  return (graphQLParams: any) => {
    if (subscriptionsClient && activeSubscriptionId !== null) {
      subscriptionsClient.unsubscribe(activeSubscriptionId);
      activeSubscriptionId = null;
    }

    if (subscriptionsClient && (hasSubscriptionOperation(graphQLParams) ||
        (undefined === fallbackFetcher)) ) {
      return {
        subscribe: (observerOrNext: { error: Function, next: Function, complete: Function }, onError?: Function, onComplete?: Function) => {
          const observer = getObserver(observerOrNext, onError, onComplete);
          activeSubscriptionId = subscriptionsClient.executeOperation({
            query: graphQLParams.query,
            variables: graphQLParams.variables,
            operationName: graphQLParams.operationName,
          }, function (error: Error[], result: any) {
            if ( error === null && result === null ) {
              observer.complete();
            } else if (error) {
              observer.error(error[0]);
            } else {
              observer.next(result);
            }
          });

          return {
            unsubscribe: () => {
              subscriptionsClient.unsubscribe(activeSubscriptionId);
              activeSubscriptionId = null;
            },
          };
        },
      };
    } else {
      return fallbackFetcher(graphQLParams);
    }
  };
};
