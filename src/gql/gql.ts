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
    "\n  query AddonVisualTestsBuild(\n    $projectId: ID!\n    $branch: String!\n    $gitUserEmailHash: String!\n    $slug: String\n    $storyId: String!\n    $testStatuses: [TestStatus!]!\n    $storyBuildId: ID!\n    $hasStoryBuildId: Boolean!\n  ) {\n    project(id: $projectId) {\n      name\n      nextBuild: lastBuild(\n        branches: [$branch]\n        slug: $slug\n        localBuilds: { localBuildEmailHash: $gitUserEmailHash }\n      ) {\n        ...NextBuildFields\n        ...StoryBuildFields @skip(if: $hasStoryBuildId)\n      }\n    }\n    storyBuild: build(id: $storyBuildId) @include(if: $hasStoryBuildId) {\n      ...StoryBuildFields\n    }\n    viewer {\n      projectMembership(projectId: $projectId) {\n        userCanReview: meetsAccessLevel(minimumAccessLevel: REVIEWER)\n      }\n    }\n  }\n": types.AddonVisualTestsBuildDocument,
    "\n  fragment NextBuildFields on Build {\n    __typename\n    id\n    status\n    committedAt\n    ... on StartedBuild {\n      testsForStatus: tests(first: 1000, statuses: $testStatuses) {\n        nodes {\n          ...StatusTestFields\n        }\n      }\n      testsForStory: tests(storyId: $storyId) {\n        nodes {\n          ...NextStoryTestFields\n        }\n      }\n    }\n    ... on CompletedBuild {\n      result\n      testsForStatus: tests(statuses: $testStatuses) {\n        nodes {\n          ...StatusTestFields\n        }\n      }\n      testsForStory: tests(storyId: $storyId) {\n        nodes {\n          ...NextStoryTestFields\n        }\n      }\n    }\n  }\n": types.NextBuildFieldsFragmentDoc,
    "\n  fragment StoryBuildFields on Build {\n    __typename\n    id\n    number\n    branch\n    committedAt\n    uncommittedHash\n    status\n    ... on StartedBuild {\n      startedAt\n      testsForStory: tests(storyId: $storyId) {\n        nodes {\n          ...StoryTestFields\n        }\n      }\n    }\n    ... on CompletedBuild {\n      startedAt\n      testsForStory: tests(storyId: $storyId) {\n        nodes {\n          ...StoryTestFields\n        }\n      }\n    }\n  }\n": types.StoryBuildFieldsFragmentDoc,
    "\n  fragment StatusTestFields on Test {\n    id\n    status\n    story {\n      storyId\n    }\n  }\n": types.StatusTestFieldsFragmentDoc,
    "\n  fragment NextStoryTestFields on Test {\n    status\n  }\n": types.NextStoryTestFieldsFragmentDoc,
    "\n  fragment StoryTestFields on Test {\n    id\n    status\n    result\n    webUrl\n    comparisons {\n      id\n      result\n      browser {\n        id\n        key\n        name\n        version\n      }\n      captureDiff {\n        diffImage {\n          imageUrl\n          imageWidth\n        }\n      }\n      headCapture {\n        captureImage {\n          imageUrl\n          imageWidth\n        }\n        captureError {\n          kind\n          ... on CaptureErrorInteractionFailure {\n            error\n          }\n          ... on CaptureErrorJSError {\n            error\n          }\n          ... on CaptureErrorFailedJS {\n            error\n          }\n        }\n      }\n      baseCapture {\n        captureImage {\n          imageUrl\n          imageWidth\n        }\n      }\n      viewport {\n        id\n        name\n        width\n        isDefault\n      }\n    }\n    parameters {\n      viewport {\n        id\n        name\n        width\n        isDefault\n      }\n    }\n    story {\n      storyId\n      name\n      component {\n        name\n      }\n    }\n  }\n": types.StoryTestFieldsFragmentDoc,
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
export function graphql(source: "\n  query AddonVisualTestsBuild(\n    $projectId: ID!\n    $branch: String!\n    $gitUserEmailHash: String!\n    $slug: String\n    $storyId: String!\n    $testStatuses: [TestStatus!]!\n    $storyBuildId: ID!\n    $hasStoryBuildId: Boolean!\n  ) {\n    project(id: $projectId) {\n      name\n      nextBuild: lastBuild(\n        branches: [$branch]\n        slug: $slug\n        localBuilds: { localBuildEmailHash: $gitUserEmailHash }\n      ) {\n        ...NextBuildFields\n        ...StoryBuildFields @skip(if: $hasStoryBuildId)\n      }\n    }\n    storyBuild: build(id: $storyBuildId) @include(if: $hasStoryBuildId) {\n      ...StoryBuildFields\n    }\n    viewer {\n      projectMembership(projectId: $projectId) {\n        userCanReview: meetsAccessLevel(minimumAccessLevel: REVIEWER)\n      }\n    }\n  }\n"): (typeof documents)["\n  query AddonVisualTestsBuild(\n    $projectId: ID!\n    $branch: String!\n    $gitUserEmailHash: String!\n    $slug: String\n    $storyId: String!\n    $testStatuses: [TestStatus!]!\n    $storyBuildId: ID!\n    $hasStoryBuildId: Boolean!\n  ) {\n    project(id: $projectId) {\n      name\n      nextBuild: lastBuild(\n        branches: [$branch]\n        slug: $slug\n        localBuilds: { localBuildEmailHash: $gitUserEmailHash }\n      ) {\n        ...NextBuildFields\n        ...StoryBuildFields @skip(if: $hasStoryBuildId)\n      }\n    }\n    storyBuild: build(id: $storyBuildId) @include(if: $hasStoryBuildId) {\n      ...StoryBuildFields\n    }\n    viewer {\n      projectMembership(projectId: $projectId) {\n        userCanReview: meetsAccessLevel(minimumAccessLevel: REVIEWER)\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment NextBuildFields on Build {\n    __typename\n    id\n    status\n    committedAt\n    ... on StartedBuild {\n      testsForStatus: tests(first: 1000, statuses: $testStatuses) {\n        nodes {\n          ...StatusTestFields\n        }\n      }\n      testsForStory: tests(storyId: $storyId) {\n        nodes {\n          ...NextStoryTestFields\n        }\n      }\n    }\n    ... on CompletedBuild {\n      result\n      testsForStatus: tests(statuses: $testStatuses) {\n        nodes {\n          ...StatusTestFields\n        }\n      }\n      testsForStory: tests(storyId: $storyId) {\n        nodes {\n          ...NextStoryTestFields\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  fragment NextBuildFields on Build {\n    __typename\n    id\n    status\n    committedAt\n    ... on StartedBuild {\n      testsForStatus: tests(first: 1000, statuses: $testStatuses) {\n        nodes {\n          ...StatusTestFields\n        }\n      }\n      testsForStory: tests(storyId: $storyId) {\n        nodes {\n          ...NextStoryTestFields\n        }\n      }\n    }\n    ... on CompletedBuild {\n      result\n      testsForStatus: tests(statuses: $testStatuses) {\n        nodes {\n          ...StatusTestFields\n        }\n      }\n      testsForStory: tests(storyId: $storyId) {\n        nodes {\n          ...NextStoryTestFields\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment StoryBuildFields on Build {\n    __typename\n    id\n    number\n    branch\n    committedAt\n    uncommittedHash\n    status\n    ... on StartedBuild {\n      startedAt\n      testsForStory: tests(storyId: $storyId) {\n        nodes {\n          ...StoryTestFields\n        }\n      }\n    }\n    ... on CompletedBuild {\n      startedAt\n      testsForStory: tests(storyId: $storyId) {\n        nodes {\n          ...StoryTestFields\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  fragment StoryBuildFields on Build {\n    __typename\n    id\n    number\n    branch\n    committedAt\n    uncommittedHash\n    status\n    ... on StartedBuild {\n      startedAt\n      testsForStory: tests(storyId: $storyId) {\n        nodes {\n          ...StoryTestFields\n        }\n      }\n    }\n    ... on CompletedBuild {\n      startedAt\n      testsForStory: tests(storyId: $storyId) {\n        nodes {\n          ...StoryTestFields\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment StatusTestFields on Test {\n    id\n    status\n    story {\n      storyId\n    }\n  }\n"): (typeof documents)["\n  fragment StatusTestFields on Test {\n    id\n    status\n    story {\n      storyId\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment NextStoryTestFields on Test {\n    status\n  }\n"): (typeof documents)["\n  fragment NextStoryTestFields on Test {\n    status\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment StoryTestFields on Test {\n    id\n    status\n    result\n    webUrl\n    comparisons {\n      id\n      result\n      browser {\n        id\n        key\n        name\n        version\n      }\n      captureDiff {\n        diffImage {\n          imageUrl\n          imageWidth\n        }\n      }\n      headCapture {\n        captureImage {\n          imageUrl\n          imageWidth\n        }\n        captureError {\n          kind\n          ... on CaptureErrorInteractionFailure {\n            error\n          }\n          ... on CaptureErrorJSError {\n            error\n          }\n          ... on CaptureErrorFailedJS {\n            error\n          }\n        }\n      }\n      baseCapture {\n        captureImage {\n          imageUrl\n          imageWidth\n        }\n      }\n      viewport {\n        id\n        name\n        width\n        isDefault\n      }\n    }\n    parameters {\n      viewport {\n        id\n        name\n        width\n        isDefault\n      }\n    }\n    story {\n      storyId\n      name\n      component {\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  fragment StoryTestFields on Test {\n    id\n    status\n    result\n    webUrl\n    comparisons {\n      id\n      result\n      browser {\n        id\n        key\n        name\n        version\n      }\n      captureDiff {\n        diffImage {\n          imageUrl\n          imageWidth\n        }\n      }\n      headCapture {\n        captureImage {\n          imageUrl\n          imageWidth\n        }\n        captureError {\n          kind\n          ... on CaptureErrorInteractionFailure {\n            error\n          }\n          ... on CaptureErrorJSError {\n            error\n          }\n          ... on CaptureErrorFailedJS {\n            error\n          }\n        }\n      }\n      baseCapture {\n        captureImage {\n          imageUrl\n          imageWidth\n        }\n      }\n      viewport {\n        id\n        name\n        width\n        isDefault\n      }\n    }\n    parameters {\n      viewport {\n        id\n        name\n        width\n        isDefault\n      }\n    }\n    story {\n      storyId\n      name\n      component {\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ReviewTest($input: ReviewTestInput!) {\n    reviewTest(input: $input) {\n      updatedTests {\n        id\n        status\n      }\n      userErrors {\n        ... on UserError {\n          __typename\n          message\n        }\n        ... on BuildSupersededError {\n          build {\n            id\n          }\n        }\n        ... on TestUnreviewableError {\n          test {\n            id\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation ReviewTest($input: ReviewTestInput!) {\n    reviewTest(input: $input) {\n      updatedTests {\n        id\n        status\n      }\n      userErrors {\n        ... on UserError {\n          __typename\n          message\n        }\n        ... on BuildSupersededError {\n          build {\n            id\n          }\n        }\n        ... on TestUnreviewableError {\n          test {\n            id\n          }\n        }\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;