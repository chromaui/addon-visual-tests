/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: { input: any; output: any; }
  /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSONObject: { input: any; output: any; }
  /** A MongoDB ObjectId. */
  ObjID: { input: any; output: any; }
  /** A field whose value conforms to the standard URL format as specified in RFC3986: https://www.ietf.org/rfc/rfc3986.txt. */
  URL: { input: any; output: any; }
};

export enum AccessLevel {
  Developer = 'DEVELOPER',
  None = 'NONE',
  Owner = 'OWNER',
  Reviewer = 'REVIEWER',
  Viewer = 'VIEWER'
}

export enum AccountSubscriptionStatus {
  /** The account has exceeded the snapshot quota for the current billing cycle. */
  ExceededThreshold = 'EXCEEDED_THRESHOLD',
  /** The subscription is in a trial period. */
  InTrial = 'IN_TRIAL',
  /** The last payment attempt failed. */
  PaymentFailed = 'PAYMENT_FAILED',
  /** Payment is required to resume usage. */
  PaymentRequired = 'PAYMENT_REQUIRED',
  /** The account has not yet run a build. */
  PreSubscribed = 'PRE_SUBSCRIBED',
  /** The account has an active subscription. */
  Subscribed = 'SUBSCRIBED',
  /** The subscription is in a trial period which is ending soon. */
  TrialEnding = 'TRIAL_ENDING'
}

export enum AccountSuspensionReason {
  /** The account has exceeded the snapshot quota for the current billing cycle. */
  ExceededThreshold = 'EXCEEDED_THRESHOLD',
  /** Another reason for suspension, contact support for more information. */
  Other = 'OTHER',
  /** Payment is required to resume usage. */
  PaymentRequired = 'PAYMENT_REQUIRED'
}

export enum Browser {
  Chrome = 'CHROME',
  Edge = 'EDGE',
  Firefox = 'FIREFOX',
  Safari = 'SAFARI'
}

export enum BuildResult {
  /** At least one test on the build had a (user) error. */
  CaptureError = 'CAPTURE_ERROR',
  /** The build successfully completed every test. */
  Success = 'SUCCESS',
  /** At least one test on the build had a system error. */
  SystemError = 'SYSTEM_ERROR',
  /** The build did not complete in time. */
  Timeout = 'TIMEOUT'
}

export enum BuildStatus {
  /** All test changes were accepted. */
  Accepted = 'ACCEPTED',
  /** The build is announced but not yet published. */
  Announced = 'ANNOUNCED',
  /** There was a user (permanent) problem completing the build. */
  Broken = 'BROKEN',
  /** The build was cancelled before it could complete. */
  Cancelled = 'CANCELLED',
  /** At least one test change was denied. */
  Denied = 'DENIED',
  /** There was a system (temporary) problem completing the build. */
  Failed = 'FAILED',
  /** The build is awaiting a result. */
  InProgress = 'IN_PROGRESS',
  /** All tests passed without changes. */
  Passed = 'PASSED',
  /** At least one test has unaccepted changes. */
  Pending = 'PENDING',
  /** The build is ready for testing but not yet started. */
  Prepared = 'PREPARED',
  /** The build is published but not yet ready for testing. */
  Published = 'PUBLISHED'
}

export enum CaptureDiffResult {
  /** The two captures were found to have differences. */
  Changed = 'CHANGED',
  /** The two captures were found to be equal. */
  Equal = 'EQUAL',
  /** The diff failed due to a system error. */
  SystemError = 'SYSTEM_ERROR'
}

export enum CaptureErrorKind {
  /** The component was rendered off screen. */
  ComponentOffPage = 'COMPONENT_OFF_PAGE',
  /** A JavaScript error occurred during capture. */
  FailedJs = 'FAILED_JS',
  /** The image was too large to capture. */
  ImageTooLarge = 'IMAGE_TOO_LARGE',
  /** An interaction failed to complete, or encountered an assertion error. */
  InteractionFailure = 'INTERACTION_FAILURE',
  /** A JavaScript error occurred during capture. */
  JsError = 'JS_ERROR',
  /** The page took too long to load. */
  NavigationTimeout = 'NAVIGATION_TIMEOUT',
  /** The page does not contain (valid) JavaScript. */
  NoJs = 'NO_JS',
  /** The screenshot took too long to capture. */
  ScreenshotTimeout = 'SCREENSHOT_TIMEOUT',
  /** The story was not found. */
  StoryMissing = 'STORY_MISSING'
}

export enum CaptureResult {
  /** The capture failed due to a problem with the story. */
  CaptureError = 'CAPTURE_ERROR',
  /** The capture succeeded an took a screenshot. */
  Success = 'SUCCESS',
  /** The capture failed due to a system error. */
  SystemError = 'SYSTEM_ERROR'
}

export enum ComparisonResult {
  /** The head capture succeeded but there is no base capture. */
  Added = 'ADDED',
  /** The head capture failed because the story is broken. */
  CaptureError = 'CAPTURE_ERROR',
  /** The head and base captures succeeded but are different. */
  Changed = 'CHANGED',
  /** The head capture succeeded and was equal to the base capture. */
  Equal = 'EQUAL',
  /** The base capture had an error but the head capture succeeded. */
  Fixed = 'FIXED',
  /** There was a base capture, but no head capture. */
  Removed = 'REMOVED',
  /** Either the head capture or the diff failed due to a system error. */
  SystemError = 'SYSTEM_ERROR'
}

export type CompletedBuildComponentRepresentationsOrder = {
  direction: OrderDirection;
  field: CompletedBuildComponentRepresentationsOrderField;
};

export enum CompletedBuildComponentRepresentationsOrderField {
  CreatedAt = 'createdAt',
  ResultOrder = 'resultOrder',
  StoryOrder = 'storyOrder',
  UpdatedAt = 'updatedAt'
}

export type CompletedBuildTestsOrder = {
  direction: OrderDirection;
  field: CompletedBuildTestsOrderField;
};

export enum CompletedBuildTestsOrderField {
  CreatedAt = 'createdAt',
  ResultOrder = 'resultOrder',
  StoryOrder = 'storyOrder',
  UpdatedAt = 'updatedAt'
}

export type ComponentsOrder = {
  direction: OrderDirection;
  field: ComponentsOrderField;
};

export enum ComponentsOrderField {
  CreatedAt = 'createdAt',
  UpdatedAt = 'updatedAt'
}

export type CreateFigmaMetadataInput = {
  key: Scalars['String']['input'];
  metadata: Scalars['JSONObject']['input'];
  url: Scalars['String']['input'];
};

export type LocalBuildsSpecifierInput = {
  /** If set, only return builds with isLocalBuild set to this value */
  isLocalBuild?: InputMaybe<Scalars['Boolean']['input']>;
  /** If set, return all global builds, and only local builds from this email hash */
  localBuildEmailHash?: InputMaybe<Scalars['String']['input']>;
};

export enum OrderDirection {
  /** Ascending */
  Asc = 'ASC',
  /** Descending */
  Desc = 'DESC'
}

export type PreparedBuildTestsOrder = {
  direction: OrderDirection;
  field: PreparedBuildTestsOrderField;
};

export enum PreparedBuildTestsOrderField {
  CreatedAt = 'createdAt',
  ResultOrder = 'resultOrder',
  StoryOrder = 'storyOrder',
  UpdatedAt = 'updatedAt'
}

export enum ReviewTestBatch {
  Build = 'BUILD',
  Component = 'COMPONENT',
  Spec = 'SPEC'
}

export type ReviewTestInput = {
  /** Apply review to all tests for the same story, component, or the whole build. */
  batch?: InputMaybe<ReviewTestBatch>;
  /** The new status of the test. */
  status: ReviewTestInputStatus;
  /** The ID of the test to review. */
  testId: Scalars['ID']['input'];
};

export enum ReviewTestInputStatus {
  /** Accept the changes on the test. */
  Accepted = 'ACCEPTED',
  /** Deny the changes on the test. */
  Denied = 'DENIED',
  /** Reset the test back to unreviewed. */
  Pending = 'PENDING'
}

export type StartedBuildTestsOrder = {
  direction: OrderDirection;
  field: StartedBuildTestsOrderField;
};

export enum StartedBuildTestsOrderField {
  CreatedAt = 'createdAt',
  ResultOrder = 'resultOrder',
  StoryOrder = 'storyOrder',
  UpdatedAt = 'updatedAt'
}

export type StoriesOrder = {
  direction: OrderDirection;
  field: StoriesOrderField;
};

export enum StoriesOrderField {
  CreatedAt = 'createdAt',
  UpdatedAt = 'updatedAt'
}

export enum TestKind {
  /** At least one comparison contains an accessibility test */
  Accessibility = 'ACCESSIBILITY',
  /** At least one comparison contains an interaction test */
  Interaction = 'INTERACTION',
  /** At least one comparison contains a visual test */
  Visual = 'VISUAL'
}

export enum TestResult {
  /** Checks passed and no baseline was found. */
  Added = 'ADDED',
  /** At least one comparison had a (user) error. */
  CaptureError = 'CAPTURE_ERROR',
  /** Checks passed, but at least one comparison had a visual change. */
  Changed = 'CHANGED',
  /** Checks passed and all snapshots are equal to their baselines. */
  Equal = 'EQUAL',
  /** Checks passed and at least one comparison was fixed. */
  Fixed = 'FIXED',
  /** Currently unused. Here for future use. */
  Removed = 'REMOVED',
  /** This test was skipped. */
  Skipped = 'SKIPPED',
  /** At least one comparison had a system error. */
  SystemError = 'SYSTEM_ERROR'
}

export enum TestStatus {
  /** The comparison succeeded and the changes have been accepted. */
  Accepted = 'ACCEPTED',
  /** Encountered a Storybook runtime error while testing. */
  Broken = 'BROKEN',
  /** The comparison succeeded and the changes have been denied. */
  Denied = 'DENIED',
  /** Encountered a (temporary) system error while testing. */
  Failed = 'FAILED',
  /** We are waiting on comparisons. */
  InProgress = 'IN_PROGRESS',
  /** All comparisons were visually equal. */
  Passed = 'PASSED',
  /** The comparison succeeded with unconfirmed changes. */
  Pending = 'PENDING'
}

export type UserPreferencesInput = {
  vtaOnboarding?: InputMaybe<VtaOnboardingPreference>;
};

export enum VtaOnboardingPreference {
  Completed = 'COMPLETED',
  Dismissed = 'DISMISSED',
  Unset = 'UNSET'
}

export type VisualTestsProjectCountQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type VisualTestsProjectCountQueryQuery = { __typename?: 'Query', viewer?: { __typename?: 'User', projectCount: number, accounts: Array<{ __typename?: 'Account', newProjectUrl?: string | null }> } | null };

export type SelectProjectsQueryQueryVariables = Exact<{ [key: string]: never; }>;


export type SelectProjectsQueryQuery = { __typename?: 'Query', viewer?: { __typename?: 'User', accounts: Array<{ __typename?: 'Account', id: string, name: string, avatarUrl?: string | null, newProjectUrl?: string | null, projects?: Array<{ __typename?: 'Project', id: string, name: string, webUrl: any, lastBuild?: { __typename?: 'AnnouncedBuild', branch: string, number: number } | { __typename?: 'CompletedBuild', branch: string, number: number } | { __typename?: 'PreparedBuild', branch: string, number: number } | { __typename?: 'PublishedBuild', branch: string, number: number } | { __typename?: 'StartedBuild', branch: string, number: number } | null } | null> | null }> } | null };

export type ProjectQueryQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type ProjectQueryQuery = { __typename?: 'Query', project?: { __typename?: 'Project', id: string, name: string, webUrl: any, lastBuild?: { __typename?: 'AnnouncedBuild', branch: string, number: number } | { __typename?: 'CompletedBuild', branch: string, number: number } | { __typename?: 'PreparedBuild', branch: string, number: number } | { __typename?: 'PublishedBuild', branch: string, number: number } | { __typename?: 'StartedBuild', branch: string, number: number } | null } | null };

export type UpdateUserPreferencesMutationVariables = Exact<{
  input: UserPreferencesInput;
}>;


export type UpdateUserPreferencesMutation = { __typename?: 'Mutation', updateUserPreferences?: { __typename?: 'UpdateUserPreferencesPayload', updatedPreferences?: { __typename?: 'UserPreferences', vtaOnboarding: VtaOnboardingPreference } | null } | null };

export type AddonVisualTestsBuildQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
  branch: Scalars['String']['input'];
  gitUserEmailHash: Scalars['String']['input'];
  repositoryOwnerName?: InputMaybe<Scalars['String']['input']>;
  storyId: Scalars['String']['input'];
  testStatuses: Array<TestStatus> | TestStatus;
  selectedBuildId: Scalars['ID']['input'];
  hasSelectedBuildId: Scalars['Boolean']['input'];
}>;


export type AddonVisualTestsBuildQuery = { __typename?: 'Query', project?: { __typename?: 'Project', name: string, manageUrl: any, account: { __typename?: 'Account', billingUrl?: string | null, suspensionReason?: AccountSuspensionReason | null }, features: { __typename?: 'ProjectFeatures', uiTests: boolean }, lastBuildOnBranch?: (
      { __typename?: 'AnnouncedBuild' }
      & { ' $fragmentRefs'?: { 'LastBuildOnBranchBuildFields_AnnouncedBuild_Fragment': LastBuildOnBranchBuildFields_AnnouncedBuild_Fragment;'SelectedBuildFields_AnnouncedBuild_Fragment': SelectedBuildFields_AnnouncedBuild_Fragment } }
    ) | (
      { __typename?: 'CompletedBuild' }
      & { ' $fragmentRefs'?: { 'LastBuildOnBranchBuildFields_CompletedBuild_Fragment': LastBuildOnBranchBuildFields_CompletedBuild_Fragment;'SelectedBuildFields_CompletedBuild_Fragment': SelectedBuildFields_CompletedBuild_Fragment } }
    ) | (
      { __typename?: 'PreparedBuild' }
      & { ' $fragmentRefs'?: { 'LastBuildOnBranchBuildFields_PreparedBuild_Fragment': LastBuildOnBranchBuildFields_PreparedBuild_Fragment;'SelectedBuildFields_PreparedBuild_Fragment': SelectedBuildFields_PreparedBuild_Fragment } }
    ) | (
      { __typename?: 'PublishedBuild' }
      & { ' $fragmentRefs'?: { 'LastBuildOnBranchBuildFields_PublishedBuild_Fragment': LastBuildOnBranchBuildFields_PublishedBuild_Fragment;'SelectedBuildFields_PublishedBuild_Fragment': SelectedBuildFields_PublishedBuild_Fragment } }
    ) | (
      { __typename?: 'StartedBuild' }
      & { ' $fragmentRefs'?: { 'LastBuildOnBranchBuildFields_StartedBuild_Fragment': LastBuildOnBranchBuildFields_StartedBuild_Fragment;'SelectedBuildFields_StartedBuild_Fragment': SelectedBuildFields_StartedBuild_Fragment } }
    ) | null, lastBuild?: { __typename?: 'AnnouncedBuild', id: string, slug?: string | null, branch: string } | { __typename?: 'CompletedBuild', id: string, slug?: string | null, branch: string } | { __typename?: 'PreparedBuild', id: string, slug?: string | null, branch: string } | { __typename?: 'PublishedBuild', id: string, slug?: string | null, branch: string } | { __typename?: 'StartedBuild', id: string, slug?: string | null, branch: string } | null } | null, selectedBuild?: (
    { __typename?: 'AnnouncedBuild' }
    & { ' $fragmentRefs'?: { 'SelectedBuildFields_AnnouncedBuild_Fragment': SelectedBuildFields_AnnouncedBuild_Fragment } }
  ) | (
    { __typename?: 'CompletedBuild' }
    & { ' $fragmentRefs'?: { 'SelectedBuildFields_CompletedBuild_Fragment': SelectedBuildFields_CompletedBuild_Fragment } }
  ) | (
    { __typename?: 'PreparedBuild' }
    & { ' $fragmentRefs'?: { 'SelectedBuildFields_PreparedBuild_Fragment': SelectedBuildFields_PreparedBuild_Fragment } }
  ) | (
    { __typename?: 'PublishedBuild' }
    & { ' $fragmentRefs'?: { 'SelectedBuildFields_PublishedBuild_Fragment': SelectedBuildFields_PublishedBuild_Fragment } }
  ) | (
    { __typename?: 'StartedBuild' }
    & { ' $fragmentRefs'?: { 'SelectedBuildFields_StartedBuild_Fragment': SelectedBuildFields_StartedBuild_Fragment } }
  ) | null, viewer?: { __typename?: 'User', preferences: { __typename?: 'UserPreferences', vtaOnboarding: VtaOnboardingPreference }, projectMembership?: { __typename?: 'ProjectMembership', userCanReview: boolean } | null } | null };

type LastBuildOnBranchBuildFields_AnnouncedBuild_Fragment = { __typename: 'AnnouncedBuild', id: string, status: BuildStatus, committedAt: any } & { ' $fragmentName'?: 'LastBuildOnBranchBuildFields_AnnouncedBuild_Fragment' };

type LastBuildOnBranchBuildFields_CompletedBuild_Fragment = { __typename: 'CompletedBuild', result: BuildResult, id: string, status: BuildStatus, committedAt: any, testsForStatus?: { __typename?: 'CompletedBuildTestConnection', nodes: Array<(
      { __typename?: 'Test' }
      & { ' $fragmentRefs'?: { 'StatusTestFieldsFragment': StatusTestFieldsFragment } }
    )> } | null, testsForStory?: { __typename?: 'CompletedBuildTestConnection', nodes: Array<(
      { __typename?: 'Test' }
      & { ' $fragmentRefs'?: { 'LastBuildOnBranchTestFieldsFragment': LastBuildOnBranchTestFieldsFragment } }
    )> } | null } & { ' $fragmentName'?: 'LastBuildOnBranchBuildFields_CompletedBuild_Fragment' };

type LastBuildOnBranchBuildFields_PreparedBuild_Fragment = { __typename: 'PreparedBuild', id: string, status: BuildStatus, committedAt: any } & { ' $fragmentName'?: 'LastBuildOnBranchBuildFields_PreparedBuild_Fragment' };

type LastBuildOnBranchBuildFields_PublishedBuild_Fragment = { __typename: 'PublishedBuild', id: string, status: BuildStatus, committedAt: any } & { ' $fragmentName'?: 'LastBuildOnBranchBuildFields_PublishedBuild_Fragment' };

type LastBuildOnBranchBuildFields_StartedBuild_Fragment = { __typename: 'StartedBuild', id: string, status: BuildStatus, committedAt: any, testsForStatus?: { __typename?: 'StartedBuildTestConnection', nodes: Array<(
      { __typename?: 'Test' }
      & { ' $fragmentRefs'?: { 'StatusTestFieldsFragment': StatusTestFieldsFragment } }
    )> } | null, testsForStory?: { __typename?: 'StartedBuildTestConnection', nodes: Array<(
      { __typename?: 'Test' }
      & { ' $fragmentRefs'?: { 'LastBuildOnBranchTestFieldsFragment': LastBuildOnBranchTestFieldsFragment } }
    )> } | null } & { ' $fragmentName'?: 'LastBuildOnBranchBuildFields_StartedBuild_Fragment' };

export type LastBuildOnBranchBuildFieldsFragment = LastBuildOnBranchBuildFields_AnnouncedBuild_Fragment | LastBuildOnBranchBuildFields_CompletedBuild_Fragment | LastBuildOnBranchBuildFields_PreparedBuild_Fragment | LastBuildOnBranchBuildFields_PublishedBuild_Fragment | LastBuildOnBranchBuildFields_StartedBuild_Fragment;

type SelectedBuildFields_AnnouncedBuild_Fragment = { __typename: 'AnnouncedBuild', id: string, number: number, branch: string, commit: string, committedAt: any, uncommittedHash?: string | null, status: BuildStatus } & { ' $fragmentName'?: 'SelectedBuildFields_AnnouncedBuild_Fragment' };

type SelectedBuildFields_CompletedBuild_Fragment = { __typename: 'CompletedBuild', startedAt: any, id: string, number: number, branch: string, commit: string, committedAt: any, uncommittedHash?: string | null, status: BuildStatus, testsForStory?: { __typename?: 'CompletedBuildTestConnection', nodes: Array<(
      { __typename?: 'Test' }
      & { ' $fragmentRefs'?: { 'StoryTestFieldsFragment': StoryTestFieldsFragment } }
    )> } | null } & { ' $fragmentName'?: 'SelectedBuildFields_CompletedBuild_Fragment' };

type SelectedBuildFields_PreparedBuild_Fragment = { __typename: 'PreparedBuild', id: string, number: number, branch: string, commit: string, committedAt: any, uncommittedHash?: string | null, status: BuildStatus } & { ' $fragmentName'?: 'SelectedBuildFields_PreparedBuild_Fragment' };

type SelectedBuildFields_PublishedBuild_Fragment = { __typename: 'PublishedBuild', id: string, number: number, branch: string, commit: string, committedAt: any, uncommittedHash?: string | null, status: BuildStatus } & { ' $fragmentName'?: 'SelectedBuildFields_PublishedBuild_Fragment' };

type SelectedBuildFields_StartedBuild_Fragment = { __typename: 'StartedBuild', startedAt: any, id: string, number: number, branch: string, commit: string, committedAt: any, uncommittedHash?: string | null, status: BuildStatus, testsForStory?: { __typename?: 'StartedBuildTestConnection', nodes: Array<(
      { __typename?: 'Test' }
      & { ' $fragmentRefs'?: { 'StoryTestFieldsFragment': StoryTestFieldsFragment } }
    )> } | null } & { ' $fragmentName'?: 'SelectedBuildFields_StartedBuild_Fragment' };

export type SelectedBuildFieldsFragment = SelectedBuildFields_AnnouncedBuild_Fragment | SelectedBuildFields_CompletedBuild_Fragment | SelectedBuildFields_PreparedBuild_Fragment | SelectedBuildFields_PublishedBuild_Fragment | SelectedBuildFields_StartedBuild_Fragment;

export type StatusTestFieldsFragment = { __typename?: 'Test', id: string, status: TestStatus, result?: TestResult | null, story?: { __typename?: 'Story', storyId: string } | null } & { ' $fragmentName'?: 'StatusTestFieldsFragment' };

export type LastBuildOnBranchTestFieldsFragment = { __typename?: 'Test', status: TestStatus, result?: TestResult | null } & { ' $fragmentName'?: 'LastBuildOnBranchTestFieldsFragment' };

export type StoryTestFieldsFragment = { __typename?: 'Test', id: string, status: TestStatus, result?: TestResult | null, webUrl: any, comparisons: Array<{ __typename?: 'TestComparison', id: string, result?: ComparisonResult | null, browser: { __typename?: 'BrowserInfo', id: string, key: Browser, name: string, version: string }, captureDiff?: { __typename?: 'CaptureDiff', diffImage?: { __typename?: 'CaptureOverlayImage', imageUrl: any, imageWidth: number } | null, focusImage?: { __typename?: 'CaptureOverlayImage', imageUrl: any, imageWidth: number } | null } | null, headCapture?: { __typename?: 'Capture', captureImage?: { __typename?: 'CaptureImage', backgroundColor?: string | null, imageUrl: any, imageWidth: number, imageHeight: number, thumbnailUrl: any } | null, captureError?: { __typename?: 'CaptureErrorComponentOffPage', kind: CaptureErrorKind } | { __typename?: 'CaptureErrorFailedJS', error: any, kind: CaptureErrorKind } | { __typename?: 'CaptureErrorImageTooLarge', kind: CaptureErrorKind } | { __typename?: 'CaptureErrorInteractionFailure', error: any, kind: CaptureErrorKind } | { __typename?: 'CaptureErrorJSError', error: any, kind: CaptureErrorKind } | { __typename?: 'CaptureErrorNavigationTimeout', kind: CaptureErrorKind } | { __typename?: 'CaptureErrorNoJS', kind: CaptureErrorKind } | { __typename?: 'CaptureErrorScreenshotTimeout', kind: CaptureErrorKind } | { __typename?: 'CaptureErrorStoryMissing', kind: CaptureErrorKind } | null } | null, baseCapture?: { __typename?: 'Capture', captureImage?: { __typename?: 'CaptureImage', imageUrl: any, imageWidth: number, imageHeight: number } | null } | null }>, mode: { __typename?: 'TestMode', name: string, globals: any }, story?: { __typename?: 'Story', storyId: string, name: string, component?: { __typename?: 'Component', name: string } | null } | null } & { ' $fragmentName'?: 'StoryTestFieldsFragment' };

export type ReviewTestMutationVariables = Exact<{
  input: ReviewTestInput;
}>;


export type ReviewTestMutation = { __typename?: 'Mutation', reviewTest?: { __typename?: 'ReviewTestPayload', updatedTests?: Array<{ __typename?: 'Test', id: string, status: TestStatus }> | null, userErrors: Array<{ __typename: 'BuildSupersededError', message: string, build: { __typename?: 'AnnouncedBuild', id: string } | { __typename?: 'CompletedBuild', id: string } | { __typename?: 'PreparedBuild', id: string } | { __typename?: 'PublishedBuild', id: string } | { __typename?: 'StartedBuild', id: string } } | { __typename: 'TestNotFoundError', message: string } | { __typename: 'TestUnreviewableError', message: string, test: { __typename?: 'Test', id: string } }> } | null };

export const StatusTestFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StatusTestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Test"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"result"}},{"kind":"Field","name":{"kind":"Name","value":"story"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storyId"}}]}}]}}]} as unknown as DocumentNode<StatusTestFieldsFragment, unknown>;
export const LastBuildOnBranchTestFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LastBuildOnBranchTestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Test"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"result"}}]}}]} as unknown as DocumentNode<LastBuildOnBranchTestFieldsFragment, unknown>;
export const LastBuildOnBranchBuildFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LastBuildOnBranchBuildFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Build"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"committedAt"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StartedBuild"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"testsForStatus"},"name":{"kind":"Name","value":"tests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1000"}},{"kind":"Argument","name":{"kind":"Name","value":"statuses"},"value":{"kind":"Variable","name":{"kind":"Name","value":"testStatuses"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StatusTestFields"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"testsForStory"},"name":{"kind":"Name","value":"tests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storyId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storyId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LastBuildOnBranchTestFields"}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CompletedBuild"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"result"}},{"kind":"Field","alias":{"kind":"Name","value":"testsForStatus"},"name":{"kind":"Name","value":"tests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1000"}},{"kind":"Argument","name":{"kind":"Name","value":"statuses"},"value":{"kind":"Variable","name":{"kind":"Name","value":"testStatuses"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StatusTestFields"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"testsForStory"},"name":{"kind":"Name","value":"tests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storyId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storyId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LastBuildOnBranchTestFields"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StatusTestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Test"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"result"}},{"kind":"Field","name":{"kind":"Name","value":"story"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storyId"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LastBuildOnBranchTestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Test"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"result"}}]}}]} as unknown as DocumentNode<LastBuildOnBranchBuildFieldsFragment, unknown>;
export const StoryTestFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StoryTestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Test"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"result"}},{"kind":"Field","name":{"kind":"Name","value":"webUrl"}},{"kind":"Field","name":{"kind":"Name","value":"comparisons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"result"}},{"kind":"Field","name":{"kind":"Name","value":"browser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}},{"kind":"Field","name":{"kind":"Name","value":"captureDiff"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"diffImage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"signed"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"imageWidth"}}]}},{"kind":"Field","name":{"kind":"Name","value":"focusImage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"signed"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"imageWidth"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"headCapture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"captureImage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"signed"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"backgroundColor"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"imageWidth"}},{"kind":"Field","name":{"kind":"Name","value":"imageHeight"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"captureError"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CaptureErrorInteractionFailure"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"error"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CaptureErrorJSError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"error"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CaptureErrorFailedJS"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"baseCapture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"captureImage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"signed"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"imageWidth"}},{"kind":"Field","name":{"kind":"Name","value":"imageHeight"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"mode"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"globals"}}]}},{"kind":"Field","name":{"kind":"Name","value":"story"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storyId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"component"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<StoryTestFieldsFragment, unknown>;
export const SelectedBuildFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SelectedBuildFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Build"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"branch"}},{"kind":"Field","name":{"kind":"Name","value":"commit"}},{"kind":"Field","name":{"kind":"Name","value":"committedAt"}},{"kind":"Field","name":{"kind":"Name","value":"uncommittedHash"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StartedBuild"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","alias":{"kind":"Name","value":"testsForStory"},"name":{"kind":"Name","value":"tests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storyId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storyId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StoryTestFields"}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CompletedBuild"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","alias":{"kind":"Name","value":"testsForStory"},"name":{"kind":"Name","value":"tests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storyId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storyId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StoryTestFields"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StoryTestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Test"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"result"}},{"kind":"Field","name":{"kind":"Name","value":"webUrl"}},{"kind":"Field","name":{"kind":"Name","value":"comparisons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"result"}},{"kind":"Field","name":{"kind":"Name","value":"browser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}},{"kind":"Field","name":{"kind":"Name","value":"captureDiff"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"diffImage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"signed"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"imageWidth"}}]}},{"kind":"Field","name":{"kind":"Name","value":"focusImage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"signed"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"imageWidth"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"headCapture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"captureImage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"signed"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"backgroundColor"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"imageWidth"}},{"kind":"Field","name":{"kind":"Name","value":"imageHeight"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"captureError"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CaptureErrorInteractionFailure"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"error"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CaptureErrorJSError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"error"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CaptureErrorFailedJS"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"baseCapture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"captureImage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"signed"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"imageWidth"}},{"kind":"Field","name":{"kind":"Name","value":"imageHeight"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"mode"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"globals"}}]}},{"kind":"Field","name":{"kind":"Name","value":"story"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storyId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"component"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<SelectedBuildFieldsFragment, unknown>;
export const VisualTestsProjectCountQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"VisualTestsProjectCountQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"viewer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectCount"}},{"kind":"Field","name":{"kind":"Name","value":"accounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"newProjectUrl"}}]}}]}}]}}]} as unknown as DocumentNode<VisualTestsProjectCountQueryQuery, VisualTestsProjectCountQueryQueryVariables>;
export const SelectProjectsQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SelectProjectsQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"viewer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"newProjectUrl"}},{"kind":"Field","name":{"kind":"Name","value":"projects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"webUrl"}},{"kind":"Field","name":{"kind":"Name","value":"lastBuild"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"branch"}},{"kind":"Field","name":{"kind":"Name","value":"number"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<SelectProjectsQueryQuery, SelectProjectsQueryQueryVariables>;
export const ProjectQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProjectQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"project"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"webUrl"}},{"kind":"Field","name":{"kind":"Name","value":"lastBuild"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"branch"}},{"kind":"Field","name":{"kind":"Name","value":"number"}}]}}]}}]}}]} as unknown as DocumentNode<ProjectQueryQuery, ProjectQueryQueryVariables>;
export const UpdateUserPreferencesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUserPreferences"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UserPreferencesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUserPreferences"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatedPreferences"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"vtaOnboarding"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateUserPreferencesMutation, UpdateUserPreferencesMutationVariables>;
export const AddonVisualTestsBuildDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AddonVisualTestsBuild"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"branch"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"gitUserEmailHash"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"repositoryOwnerName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storyId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"testStatuses"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TestStatus"}}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"selectedBuildId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"hasSelectedBuildId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"project"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"manageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"billingUrl"}},{"kind":"Field","name":{"kind":"Name","value":"suspensionReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"features"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uiTests"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"lastBuildOnBranch"},"name":{"kind":"Name","value":"lastBuild"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"branches"},"value":{"kind":"ListValue","values":[{"kind":"Variable","name":{"kind":"Name","value":"branch"}}]}},{"kind":"Argument","name":{"kind":"Name","value":"repositoryOwnerName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"repositoryOwnerName"}}},{"kind":"Argument","name":{"kind":"Name","value":"localBuilds"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"localBuildEmailHash"},"value":{"kind":"Variable","name":{"kind":"Name","value":"gitUserEmailHash"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LastBuildOnBranchBuildFields"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SelectedBuildFields"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"skip"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hasSelectedBuildId"}}}]}]}]}},{"kind":"Field","name":{"kind":"Name","value":"lastBuild"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"branch"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"selectedBuild"},"name":{"kind":"Name","value":"build"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"selectedBuildId"}}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hasSelectedBuildId"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SelectedBuildFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"viewer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"preferences"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"vtaOnboarding"}}]}},{"kind":"Field","name":{"kind":"Name","value":"projectMembership"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"userCanReview"},"name":{"kind":"Name","value":"meetsAccessLevel"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"minimumAccessLevel"},"value":{"kind":"EnumValue","value":"REVIEWER"}}]}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StatusTestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Test"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"result"}},{"kind":"Field","name":{"kind":"Name","value":"story"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storyId"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LastBuildOnBranchTestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Test"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"result"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StoryTestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Test"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"result"}},{"kind":"Field","name":{"kind":"Name","value":"webUrl"}},{"kind":"Field","name":{"kind":"Name","value":"comparisons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"result"}},{"kind":"Field","name":{"kind":"Name","value":"browser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}},{"kind":"Field","name":{"kind":"Name","value":"captureDiff"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"diffImage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"signed"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"imageWidth"}}]}},{"kind":"Field","name":{"kind":"Name","value":"focusImage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"signed"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"imageWidth"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"headCapture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"captureImage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"signed"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"backgroundColor"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"imageWidth"}},{"kind":"Field","name":{"kind":"Name","value":"imageHeight"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"captureError"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CaptureErrorInteractionFailure"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"error"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CaptureErrorJSError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"error"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CaptureErrorFailedJS"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"baseCapture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"captureImage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"signed"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"imageWidth"}},{"kind":"Field","name":{"kind":"Name","value":"imageHeight"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"mode"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"globals"}}]}},{"kind":"Field","name":{"kind":"Name","value":"story"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storyId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"component"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LastBuildOnBranchBuildFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Build"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"committedAt"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StartedBuild"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"testsForStatus"},"name":{"kind":"Name","value":"tests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1000"}},{"kind":"Argument","name":{"kind":"Name","value":"statuses"},"value":{"kind":"Variable","name":{"kind":"Name","value":"testStatuses"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StatusTestFields"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"testsForStory"},"name":{"kind":"Name","value":"tests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storyId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storyId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LastBuildOnBranchTestFields"}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CompletedBuild"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"result"}},{"kind":"Field","alias":{"kind":"Name","value":"testsForStatus"},"name":{"kind":"Name","value":"tests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1000"}},{"kind":"Argument","name":{"kind":"Name","value":"statuses"},"value":{"kind":"Variable","name":{"kind":"Name","value":"testStatuses"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StatusTestFields"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"testsForStory"},"name":{"kind":"Name","value":"tests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storyId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storyId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LastBuildOnBranchTestFields"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SelectedBuildFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Build"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"branch"}},{"kind":"Field","name":{"kind":"Name","value":"commit"}},{"kind":"Field","name":{"kind":"Name","value":"committedAt"}},{"kind":"Field","name":{"kind":"Name","value":"uncommittedHash"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StartedBuild"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","alias":{"kind":"Name","value":"testsForStory"},"name":{"kind":"Name","value":"tests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storyId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storyId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StoryTestFields"}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CompletedBuild"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","alias":{"kind":"Name","value":"testsForStory"},"name":{"kind":"Name","value":"tests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storyId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storyId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StoryTestFields"}}]}}]}}]}}]}}]} as unknown as DocumentNode<AddonVisualTestsBuildQuery, AddonVisualTestsBuildQueryVariables>;
export const ReviewTestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ReviewTest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ReviewTestInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reviewTest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatedTests"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"Field","name":{"kind":"Name","value":"userErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BuildSupersededError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"build"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TestUnreviewableError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"test"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<ReviewTestMutation, ReviewTestMutationVariables>;