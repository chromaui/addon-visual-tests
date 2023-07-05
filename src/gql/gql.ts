/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n  query SelectProjectsQuery {\n    accounts {\n      id\n      name\n      avatarUrl\n      projects {\n        id\n        name\n        webUrl\n        lastBuild {\n          branch\n          number\n        }\n      }\n    }\n  }\n": types.SelectProjectsQueryDocument,
    "\n  query ProjectQuery($projectId: ID!) {\n    project(id: $projectId) {\n      id\n      name\n      webUrl\n      lastBuild {\n        branch\n        number\n      }\n    }\n  }\n": types.ProjectQueryDocument,
    "\n  query LastBuild($projectId: ID!, $branch: String!, $storyId: String!) {\n    project(id: $projectId) {\n      id\n      name\n      webUrl\n      lastBuild(branches: [$branch]) {\n        id\n        number\n        branch\n        commit\n        status\n        browsers {\n          id\n          key\n          name\n        }\n        ... on TestedBuild {\n          changeCount: testCount(results: [ADDED, CHANGED, FIXED])\n          startedAt\n          tests(storyId: $storyId) {\n            nodes {\n              id\n              result\n              status\n              comparisons {\n                result\n                browser {\n                  id\n                }\n                viewport {\n                  id\n                }\n              }\n              parameters {\n                viewport {\n                  id\n                  name\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n": types.LastBuildDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SelectProjectsQuery {\n    accounts {\n      id\n      name\n      avatarUrl\n      projects {\n        id\n        name\n        webUrl\n        lastBuild {\n          branch\n          number\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query SelectProjectsQuery {\n    accounts {\n      id\n      name\n      avatarUrl\n      projects {\n        id\n        name\n        webUrl\n        lastBuild {\n          branch\n          number\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ProjectQuery($projectId: ID!) {\n    project(id: $projectId) {\n      id\n      name\n      webUrl\n      lastBuild {\n        branch\n        number\n      }\n    }\n  }\n"): (typeof documents)["\n  query ProjectQuery($projectId: ID!) {\n    project(id: $projectId) {\n      id\n      name\n      webUrl\n      lastBuild {\n        branch\n        number\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query LastBuild($projectId: ID!, $branch: String!, $storyId: String!) {\n    project(id: $projectId) {\n      id\n      name\n      webUrl\n      lastBuild(branches: [$branch]) {\n        id\n        number\n        branch\n        commit\n        status\n        browsers {\n          id\n          key\n          name\n        }\n        ... on TestedBuild {\n          changeCount: testCount(results: [ADDED, CHANGED, FIXED])\n          startedAt\n          tests(storyId: $storyId) {\n            nodes {\n              id\n              result\n              status\n              comparisons {\n                result\n                browser {\n                  id\n                }\n                viewport {\n                  id\n                }\n              }\n              parameters {\n                viewport {\n                  id\n                  name\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query LastBuild($projectId: ID!, $branch: String!, $storyId: String!) {\n    project(id: $projectId) {\n      id\n      name\n      webUrl\n      lastBuild(branches: [$branch]) {\n        id\n        number\n        branch\n        commit\n        status\n        browsers {\n          id\n          key\n          name\n        }\n        ... on TestedBuild {\n          changeCount: testCount(results: [ADDED, CHANGED, FIXED])\n          startedAt\n          tests(storyId: $storyId) {\n            nodes {\n              id\n              result\n              status\n              comparisons {\n                result\n                browser {\n                  id\n                }\n                viewport {\n                  id\n                }\n              }\n              parameters {\n                viewport {\n                  id\n                  name\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;