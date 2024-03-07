import { graphql } from "../../gql";

export const QueryBuild = graphql(/* GraphQL */ `
  query AddonVisualTestsBuild(
    $projectId: ID!
    $branches: [String!]
    $gitUserEmailHash: String
    $repositoryOwnerName: String
    $storyId: String!
    $testStatuses: [TestStatus!]!
    $selectedBuildId: ID!
    $hasSelectedBuildId: Boolean!
    $isLocalBuild: Boolean
  ) {
    project(id: $projectId) {
      name
      lastBuildOnBranch: lastBuild(
        branches: $branches
        repositoryOwnerName: $repositoryOwnerName
        localBuilds: { localBuildEmailHash: $gitUserEmailHash, isLocalBuild: $isLocalBuild }
        defaultBranch: $isLocalBuild
      ) {
        ...LastBuildOnBranchBuildFields
        ...SelectedBuildFields @skip(if: $hasSelectedBuildId)
      }
      lastBuild {
        id
        slug
        branch
      }
    }
    selectedBuild: build(id: $selectedBuildId) @include(if: $hasSelectedBuildId) {
      ...SelectedBuildFields
    }
    viewer {
      preferences {
        vtaOnboarding
      }
      projectMembership(projectId: $projectId) {
        userCanReview: meetsAccessLevel(minimumAccessLevel: REVIEWER)
      }
    }
  }
`);

export const FragmentLastBuildOnBranchBuildFields = graphql(/* GraphQL */ `
  fragment LastBuildOnBranchBuildFields on Build {
    __typename
    id
    branch
    status
    committedAt
    ... on StartedBuild {
      testsForStatus: tests(first: 1000, statuses: $testStatuses) {
        nodes {
          ...StatusTestFields
        }
      }
      testsForStory: tests(storyId: $storyId) {
        nodes {
          ...LastBuildOnBranchTestFields
        }
      }
    }
    ... on CompletedBuild {
      result
      testsForStatus: tests(first: 1000, statuses: $testStatuses) {
        nodes {
          ...StatusTestFields
        }
      }
      testsForStory: tests(storyId: $storyId) {
        nodes {
          ...LastBuildOnBranchTestFields
        }
      }
    }
  }
`);

export const FragmentSelectedBuildFields = graphql(/* GraphQL */ `
  fragment SelectedBuildFields on Build {
    __typename
    id
    number
    branch
    commit
    committedAt
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
    result
    story {
      storyId
    }
  }
`);

export const FragmentLastBuildOnBranchTestFields = graphql(/* GraphQL */ `
  fragment LastBuildOnBranchTestFields on Test {
    status
    result
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
        diffImage(signed: true) {
          imageUrl
          imageWidth
        }
        focusImage(signed: true) {
          imageUrl
          imageWidth
        }
      }
      headCapture {
        captureImage(signed: true) {
          backgroundColor
          imageUrl
          imageWidth
          thumbnailUrl
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
        captureImage(signed: true) {
          imageUrl
          imageWidth
        }
      }
    }
    mode {
      name
      globals
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
