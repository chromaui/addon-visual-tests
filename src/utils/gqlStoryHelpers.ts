/* eslint-disable import/no-extraneous-dependencies */

import type { ResultOf, VariablesOf } from "@graphql-typed-document-node/core";
import { getOperationAST } from "graphql";
import { graphql } from "msw";
import { TypedDocumentNode } from "urql";

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
  if (queryName)
    return withGraphQLQueryParameters(queryName, (req, res, ctx) =>
      res(ctx.data(result(req.variables)))
    );
  throw new Error(`Couldn't determine query name from query`);
}

export const withGraphQLMutationParameters = (...args: Parameters<typeof graphql.mutation>) => ({
  msw: {
    handlers: [graphql.mutation(...args)],
  },
});
