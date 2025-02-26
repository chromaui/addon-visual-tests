import type { ResultOf, VariablesOf } from '@graphql-typed-document-node/core';
import { getOperationAST } from 'graphql';
import { graphql, HttpResponse } from 'msw';
import { TypedDocumentNode } from 'urql';

export const withGraphQLQueryParameters = <TQuery extends TypedDocumentNode<any, any>>(
  ...args: Parameters<typeof graphql.query<TQuery, VariablesOf<TQuery>>>
) => ({
  msw: {
    handlers: [graphql.query<TQuery, VariablesOf<TQuery>>(...args)],
  },
});

export function withGraphQLQueryResultParameters<TQuery extends TypedDocumentNode<any, any>>(
  query: TQuery,
  result: (variables: VariablesOf<TQuery>) => ResultOf<TQuery>
) {
  const queryName = getOperationAST(query)?.name?.value;
  if (!queryName) {
    throw new Error(`Couldn't determine query name from query`);
  }
  return withGraphQLQueryParameters(queryName, ({ variables }) =>
    HttpResponse.json({ data: result(variables) })
  );
}

export const withGraphQLMutationParameters = (...args: Parameters<typeof graphql.mutation>) => ({
  msw: {
    handlers: [graphql.mutation(...args)],
  },
});
