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
    "\n  query SelectProjectsQuery {\n    viewer {\n      accounts {\n        id\n        name\n        avatarUrl\n        projects {\n          id\n          name\n          webUrl\n          projectToken\n          lastBuild {\n            branch\n            number\n          }\n        }\n      }\n    }\n  }\n": types.SelectProjectsQueryDocument,
    "\n  query ProjectQuery($projectId: ID!) {\n    project(id: $projectId) {\n      id\n      name\n      webUrl\n      lastBuild {\n        branch\n        number\n      }\n    }\n  }\n": types.ProjectQueryDocument,
    "\n  query AddonVisualTestsBuild(\n    $hasBuildId: Boolean!\n    $buildId: ID!\n    $projectId: ID!\n    $branch: String!\n    $gitUserEmailHash: String!\n    $slug: String\n    $storyId: String!\n    $testStatuses: [TestStatus!]!\n  ) {\n    build(id: $buildId) @include(if: $hasBuildId) {\n      ...BuildFields\n    }\n    project(id: $projectId) @skip(if: $hasBuildId) {\n      name\n      lastBuild(\n        branches: [$branch]\n        slug: $slug\n        localBuilds: { localBuildEmailHash: $gitUserEmailHash }\n      ) {\n        ...BuildFields\n      }\n    }\n  }\n": types.AddonVisualTestsBuildDocument,
    "\n  fragment BuildFields on Build {\n    __typename\n    id\n    number\n    branch\n    commit\n    uncommittedHash\n    status\n    browsers {\n      id\n      key\n      name\n    }\n    ... on StartedBuild {\n      changeCount: testCount(results: [ADDED, CHANGED, FIXED])\n      brokenCount: testCount(results: [CAPTURE_ERROR])\n      startedAt\n      testsForStatus: tests(first: 1000, statuses: $testStatuses) {\n        nodes {\n          ...StatusTestFields\n        }\n      }\n      testsForStory: tests(storyId: $storyId) {\n        nodes {\n          ...StoryTestFields\n        }\n      }\n    }\n    ... on CompletedBuild {\n      result\n      changeCount: testCount(results: [ADDED, CHANGED, FIXED])\n      brokenCount: testCount(results: [CAPTURE_ERROR])\n      startedAt\n      testsForStatus: tests(statuses: $testStatuses) {\n        nodes {\n          ...StatusTestFields\n        }\n      }\n      testsForStory: tests(storyId: $storyId) {\n        nodes {\n          ...StoryTestFields\n        }\n      }\n    }\n  }\n": types.BuildFieldsFragmentDoc,
    "\n  fragment StatusTestFields on Test {\n    id\n    status\n    story {\n      storyId\n    }\n  }\n": types.StatusTestFieldsFragmentDoc,
    "\n  fragment StoryTestFields on Test {\n    id\n    status\n    result\n    webUrl\n    comparisons {\n      id\n      result\n      browser {\n        id\n        key\n        name\n        version\n      }\n      captureDiff {\n        diffImage {\n          imageUrl\n        }\n      }\n      headCapture {\n        captureImage {\n          imageUrl\n        }\n      }\n      viewport {\n        id\n        name\n        width\n        isDefault\n      }\n    }\n    parameters {\n      viewport {\n        id\n        name\n        width\n        isDefault\n      }\n    }\n    story {\n      storyId\n    }\n  }\n": types.StoryTestFieldsFragmentDoc,
    "\n  mutation ReviewTest($input: ReviewTestInput!) {\n    reviewTest(input: $input) {\n      updatedTests {\n        id\n        status\n      }\n      userErrors {\n        ... on UserError {\n          __typename\n          message\n        }\n        ... on BuildSupersededError {\n          build {\n            id\n          }\n        }\n        ... on TestUnreviewableError {\n          test {\n            id\n          }\n        }\n      }\n    }\n  }\n": types.ReviewTestDocument,
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
export function graphql(source: "\n  query SelectProjectsQuery {\n    viewer {\n      accounts {\n        id\n        name\n        avatarUrl\n        projects {\n          id\n          name\n          webUrl\n          projectToken\n          lastBuild {\n            branch\n            number\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query SelectProjectsQuery {\n    viewer {\n      accounts {\n        id\n        name\n        avatarUrl\n        projects {\n          id\n          name\n          webUrl\n          projectToken\n          lastBuild {\n            branch\n            number\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ProjectQuery($projectId: ID!) {\n    project(id: $projectId) {\n      id\n      name\n      webUrl\n      lastBuild {\n        branch\n        number\n      }\n    }\n  }\n"): (typeof documents)["\n  query ProjectQuery($projectId: ID!) {\n    project(id: $projectId) {\n      id\n      name\n      webUrl\n      lastBuild {\n        branch\n        number\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query AddonVisualTestsBuild(\n    $hasBuildId: Boolean!\n    $buildId: ID!\n    $projectId: ID!\n    $branch: String!\n    $gitUserEmailHash: String!\n    $slug: String\n    $storyId: String!\n    $testStatuses: [TestStatus!]!\n  ) {\n    build(id: $buildId) @include(if: $hasBuildId) {\n      ...BuildFields\n    }\n    project(id: $projectId) @skip(if: $hasBuildId) {\n      name\n      lastBuild(\n        branches: [$branch]\n        slug: $slug\n        localBuilds: { localBuildEmailHash: $gitUserEmailHash }\n      ) {\n        ...BuildFields\n      }\n    }\n  }\n"): (typeof documents)["\n  query AddonVisualTestsBuild(\n    $hasBuildId: Boolean!\n    $buildId: ID!\n    $projectId: ID!\n    $branch: String!\n    $gitUserEmailHash: String!\n    $slug: String\n    $storyId: String!\n    $testStatuses: [TestStatus!]!\n  ) {\n    build(id: $buildId) @include(if: $hasBuildId) {\n      ...BuildFields\n    }\n    project(id: $projectId) @skip(if: $hasBuildId) {\n      name\n      lastBuild(\n        branches: [$branch]\n        slug: $slug\n        localBuilds: { localBuildEmailHash: $gitUserEmailHash }\n      ) {\n        ...BuildFields\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment BuildFields on Build {\n    __typename\n    id\n    number\n    branch\n    commit\n    uncommittedHash\n    status\n    browsers {\n      id\n      key\n      name\n    }\n    ... on StartedBuild {\n      changeCount: testCount(results: [ADDED, CHANGED, FIXED])\n      brokenCount: testCount(results: [CAPTURE_ERROR])\n      startedAt\n      testsForStatus: tests(first: 1000, statuses: $testStatuses) {\n        nodes {\n          ...StatusTestFields\n        }\n      }\n      testsForStory: tests(storyId: $storyId) {\n        nodes {\n          ...StoryTestFields\n        }\n      }\n    }\n    ... on CompletedBuild {\n      result\n      changeCount: testCount(results: [ADDED, CHANGED, FIXED])\n      brokenCount: testCount(results: [CAPTURE_ERROR])\n      startedAt\n      testsForStatus: tests(statuses: $testStatuses) {\n        nodes {\n          ...StatusTestFields\n        }\n      }\n      testsForStory: tests(storyId: $storyId) {\n        nodes {\n          ...StoryTestFields\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  fragment BuildFields on Build {\n    __typename\n    id\n    number\n    branch\n    commit\n    uncommittedHash\n    status\n    browsers {\n      id\n      key\n      name\n    }\n    ... on StartedBuild {\n      changeCount: testCount(results: [ADDED, CHANGED, FIXED])\n      brokenCount: testCount(results: [CAPTURE_ERROR])\n      startedAt\n      testsForStatus: tests(first: 1000, statuses: $testStatuses) {\n        nodes {\n          ...StatusTestFields\n        }\n      }\n      testsForStory: tests(storyId: $storyId) {\n        nodes {\n          ...StoryTestFields\n        }\n      }\n    }\n    ... on CompletedBuild {\n      result\n      changeCount: testCount(results: [ADDED, CHANGED, FIXED])\n      brokenCount: testCount(results: [CAPTURE_ERROR])\n      startedAt\n      testsForStatus: tests(statuses: $testStatuses) {\n        nodes {\n          ...StatusTestFields\n        }\n      }\n      testsForStory: tests(storyId: $storyId) {\n        nodes {\n          ...StoryTestFields\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment StatusTestFields on Test {\n    id\n    status\n    story {\n      storyId\n    }\n  }\n"): (typeof documents)["\n  fragment StatusTestFields on Test {\n    id\n    status\n    story {\n      storyId\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment StoryTestFields on Test {\n    id\n    status\n    result\n    webUrl\n    comparisons {\n      id\n      result\n      browser {\n        id\n        key\n        name\n        version\n      }\n      captureDiff {\n        diffImage {\n          imageUrl\n        }\n      }\n      headCapture {\n        captureImage {\n          imageUrl\n        }\n      }\n      viewport {\n        id\n        name\n        width\n        isDefault\n      }\n    }\n    parameters {\n      viewport {\n        id\n        name\n        width\n        isDefault\n      }\n    }\n    story {\n      storyId\n    }\n  }\n"): (typeof documents)["\n  fragment StoryTestFields on Test {\n    id\n    status\n    result\n    webUrl\n    comparisons {\n      id\n      result\n      browser {\n        id\n        key\n        name\n        version\n      }\n      captureDiff {\n        diffImage {\n          imageUrl\n        }\n      }\n      headCapture {\n        captureImage {\n          imageUrl\n        }\n      }\n      viewport {\n        id\n        name\n        width\n        isDefault\n      }\n    }\n    parameters {\n      viewport {\n        id\n        name\n        width\n        isDefault\n      }\n    }\n    story {\n      storyId\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ReviewTest($input: ReviewTestInput!) {\n    reviewTest(input: $input) {\n      updatedTests {\n        id\n        status\n      }\n      userErrors {\n        ... on UserError {\n          __typename\n          message\n        }\n        ... on BuildSupersededError {\n          build {\n            id\n          }\n        }\n        ... on TestUnreviewableError {\n          test {\n            id\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation ReviewTest($input: ReviewTestInput!) {\n    reviewTest(input: $input) {\n      updatedTests {\n        id\n        status\n      }\n      userErrors {\n        ... on UserError {\n          __typename\n          message\n        }\n        ... on BuildSupersededError {\n          build {\n            id\n          }\n        }\n        ... on TestUnreviewableError {\n          test {\n            id\n          }\n        }\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;