import { graphql } from "../../gql";

export const QueryBuild = graphql(/* GraphQL */ `
  query AddonVisualTestsBuild(
    $projectId: ID!
    $branch: String!
    $gitUserEmailHash: String!
    $slug: String
    $storyId: String!
    $testStatuses: [TestStatus!]!
    $storyBuildId: ID!
    $hasStoryBuildId: Boolean!
  ) {
    project(id: $projectId) {
      name
      lastBuild(
        branches: [$branch]
        slug: $slug
        localBuilds: { localBuildEmailHash: $gitUserEmailHash }
      ) {
        ...NextBuildFields
        ...StoryBuildFields @skip(if: $hasStoryBuildId)
      }
    }
    storyBuild: build(id: $storyBuildId) @include(if: $hasStoryBuildId) {
      ...StoryBuildFields
    }
  }
`);

export const FragmentNextBuildFields = graphql(/* GraphQL */ `
  fragment NextBuildFields on Build {
    __typename
    id
    commit
    committedAt
    browsers {
      id
      key
      name
    }
    ... on StartedBuild {
      changeCount: testCount(results: [ADDED, CHANGED, FIXED])
      brokenCount: testCount(results: [CAPTURE_ERROR])
      testsForStatus: tests(first: 1000, statuses: $testStatuses) {
        nodes {
          ...StatusTestFields
        }
      }
    }
    ... on CompletedBuild {
      result
      changeCount: testCount(results: [ADDED, CHANGED, FIXED])
      brokenCount: testCount(results: [CAPTURE_ERROR])
      testsForStatus: tests(statuses: $testStatuses) {
        nodes {
          ...StatusTestFields
        }
      }
    }
  }
`);

export const FragmentStoryBuildFields = graphql(/* GraphQL */ `
  fragment StoryBuildFields on Build {
    __typename
    id
    number
    branch
    uncommittedHash
    status
    ... on StartedBuild {
      startedAt
      testsForStory: tests(storyId: $storyId) {
        nodes {
          ...StoryTestFields
        }
      }
    }
    ... on CompletedBuild {
      startedAt
      testsForStory: tests(storyId: $storyId) {
        nodes {
          ...StoryTestFields
        }
      }
    }
  }
`);

export const FragmentStatusTestFields = graphql(/* GraphQL */ `
  fragment StatusTestFields on Test {
    id
    status
    story {
      storyId
    }
  }
`);

export const FragmentStoryTestFields = graphql(/* GraphQL */ `
  fragment StoryTestFields on Test {
    id
    status
    result
    webUrl
    comparisons {
      id
      result
      browser {
        id
        key
        name
        version
      }
      captureDiff {
        diffImage {
          imageUrl
          imageWidth
        }
      }
      headCapture {
        captureImage {
          imageUrl
          imageWidth
        }
        captureError {
          kind
          ... on CaptureErrorInteractionFailure {
            error
          }
          ... on CaptureErrorJSError {
            error
          }
          ... on CaptureErrorFailedJS {
            error
          }
        }
      }
      baseCapture {
        captureImage {
          imageUrl
          imageWidth
        }
      }
      viewport {
        id
        name
        width
        isDefault
      }
    }
    parameters {
      viewport {
        id
        name
        width
        isDefault
      }
    }
    story {
      storyId
      name
      component {
        name
      }
    }
  }
`);

export const MutationReviewTest = graphql(/* GraphQL */ `
  mutation ReviewTest($input: ReviewTestInput!) {
    reviewTest(input: $input) {
      updatedTests {
        id
        status
      }
      userErrors {
        ... on UserError {
          __typename
          message
        }
        ... on BuildSupersededError {
          build {
            id
          }
        }
        ... on TestUnreviewableError {
          test {
            id
          }
        }
      }
    }
  }
`);
