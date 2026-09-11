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

/** A user's level of access to a project. */
export enum AccessLevel {
  /** Can start builds via the CLI and manage project settings. */
  Developer = 'DEVELOPER',
  /** No access to the project. */
  None = 'NONE',
  /** Full control of the project, including settings and billing. */
  Owner = 'OWNER',
  /** Can review builds and accept or deny visual changes. */
  Reviewer = 'REVIEWER',
  /** Read-only access to the project. */
  Viewer = 'VIEWER'
}

/** An accessibility comparison between a story capture and its baseline, for a specific platform and viewport. */
export type AccessibilityComparison = Node & {
  __typename?: 'AccessibilityComparison';
  /** The capture from the baseline test used for comparison. */
  baseCapture?: Maybe<Capture>;
  /** The diff between the baseCapture and headCapture. Available once the diff has completed. */
  diff?: Maybe<AccessibilityDiff>;
  /** The capture of the test this comparison belongs to. Available once the capture is complete. */
  headCapture?: Maybe<Capture>;
  /** The globally unique GraphQL node identifier. */
  id: Scalars['ID']['output'];
  /** The platform used for this comparison. */
  platform: BrowserInfo;
  /** The result of comparing this test's capture against the baseline. Only available once the test has completed. */
  result?: Maybe<ComparisonResult>;
  /** The viewport used for this comparison. */
  viewport: ViewportInfo;
};

/** An accessibility diff between two captures. */
export type AccessibilityDiff = {
  __typename?: 'AccessibilityDiff';
  /** The ID of the diff. */
  id: Scalars['ID']['output'];
  /** The result of comparing the baseCapture and headCapture. */
  result: CaptureDiffResult;
  /** The per-rule breakdown of how accessibility violations changed between the baseCapture and headCapture. */
  rules?: Maybe<Array<AccessibilityDiffRule>>;
};

/** A single accessibility rule and how its violations changed between the baseCapture and headCapture. */
export type AccessibilityDiffRule = {
  __typename?: 'AccessibilityDiffRule';
  /** The net change in the number of violating elements for this rule. */
  change: Scalars['Int']['output'];
  /** A short summary of what the rule checks and how to resolve it. */
  description?: Maybe<Scalars['String']['output']>;
  /** The elements that violate this rule on both the baseCapture and headCapture. */
  existing?: Maybe<Array<AccessibilityViolationElement>>;
  /** Link to detailed documentation for this accessibility rule. */
  helpUrl: Scalars['URL']['output'];
  /** The elements that newly violate this rule on the headCapture. */
  new?: Maybe<Array<AccessibilityViolationElement>>;
  /** The elements that no longer violate this rule compared to the baseCapture. */
  removed?: Maybe<Array<AccessibilityViolationElement>>;
  /** The identifier of the accessibility rule (e.g. the axe rule id). */
  rule: Scalars['String']['output'];
  /** The human-friendly title for the accessibility rule. */
  title: Scalars['String']['output'];
};

/** An element involved in an accessibility rule change. */
export type AccessibilityViolationElement = {
  __typename?: 'AccessibilityViolationElement';
  /** CSS selector locating the element in the captured DOM. */
  selector: Scalars['String']['output'];
};

/** A Chromatic account. */
export type Account = Node & Temporal & {
  __typename?: 'Account';
  /** URL of the account's avatar image. */
  avatarUrl?: Maybe<Scalars['String']['output']>;
  /** Link to the account's billing page on Chromatic. */
  billingUrl?: Maybe<Scalars['String']['output']>;
  /** When the entity was first created in Chromatic. */
  createdAt: Scalars['DateTime']['output'];
  /** The globally unique GraphQL node identifier. */
  id: Scalars['ID']['output'];
  /** Whether this is a personal account (ie an account associated with a single user). */
  isPersonal: Scalars['Boolean']['output'];
  /** Account name, typically the repository owner. */
  name: Scalars['String']['output'];
  /** Link to create a new project under this account on Chromatic. */
  newProjectUrl?: Maybe<Scalars['String']['output']>;
  /** Link to the notification preference settings page on Chromatic. The page shows notification settings for all accounts the user belongs to. */
  notificationsUrl?: Maybe<Scalars['String']['output']>;
  /** List of projects belonging to this account. */
  projects?: Maybe<Array<Maybe<Project>>>;
  /** Billing subscription details for this account. */
  subscription: AccountSubscription;
  /** If suspended, the reason for suspending the account. */
  suspensionReason?: Maybe<AccountSuspensionReason>;
  /** When the entity was last updated or created in Chromatic. */
  updatedAt: Scalars['DateTime']['output'];
  /** Link to the account home on Chromatic. */
  webUrl?: Maybe<Scalars['String']['output']>;
};


/** A Chromatic account. */
export type AccountProjectsArgs = {
  filter?: InputMaybe<ProjectFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};

/** The Account is not linked to the requested git provider. */
export type AccountNotLinkedError = MutationError & {
  __typename?: 'AccountNotLinkedError';
  /** A human-readable message describing the error. */
  message: Scalars['String']['output'];
};

/** Input for creating a machine-to-machine account service client. */
export type AccountServiceClientInput = {
  /** The account to attach the machine-to-machine client to. */
  accountId: Scalars['ID']['input'];
  /** Display name for the client and its machine user. Defaults to the account name. */
  name?: InputMaybe<Scalars['String']['input']>;
  /** OAuth scopes the client is authorized to request. */
  scopes: Array<Scalars['String']['input']>;
};

/** Billing subscription details for an Account. */
export type AccountSubscription = {
  __typename?: 'AccountSubscription';
  /** The plan the account is subscribed to. */
  plan: Scalars['String']['output'];
  /** The current subscription status. */
  status: AccountSubscriptionStatus;
};

/** The billing subscription status of an Account. */
export enum AccountSubscriptionStatus {
  /** The account has used its included snapshots for the current billing cycle. */
  ExceededThreshold = 'EXCEEDED_THRESHOLD',
  /** The last payment attempt failed. */
  PaymentFailed = 'PAYMENT_FAILED',
  /** Payment is required to resume usage. */
  PaymentRequired = 'PAYMENT_REQUIRED',
  /** The account has not yet run a build. */
  PreSubscribed = 'PRE_SUBSCRIBED',
  /** The account has an active subscription. */
  Subscribed = 'SUBSCRIBED'
}

/** The reason an Account has been suspended. */
export enum AccountSuspensionReason {
  /** The account has used its included snapshots for the current billing cycle. */
  ExceededThreshold = 'EXCEEDED_THRESHOLD',
  /** Another reason for suspension, contact support for more information. */
  Other = 'OTHER',
  /** Payment is required to resume usage. */
  PaymentRequired = 'PAYMENT_REQUIRED'
}

/** A build that has been created by the CLI but whose Storybook files have not been uploaded yet. */
export type AnnouncedBuild = Build & Node & Temporal & {
  __typename?: 'AnnouncedBuild';
  /** Git branch name, possibly prefixed with the owner name (in case of a forked repository). */
  branch: Scalars['String']['output'];
  /** Set of browsers against which the build was executed. */
  browsers: Array<BrowserInfo>;
  /** Git commit hash (unshortened). */
  commit: Scalars['String']['output'];
  /** Link to the commit details at the Git provider linked to the project. */
  commitUrl?: Maybe<Scalars['String']['output']>;
  /** When the commit was created in Git. */
  committedAt: Scalars['DateTime']['output'];
  /** When the entity was first created in Chromatic. */
  createdAt: Scalars['DateTime']['output'];
  /** The error that caused this build to fail. */
  error?: Maybe<BuildError>;
  /** The globally unique GraphQL node identifier. */
  id: Scalars['ID']['output'];
  /** Whether the build is limited to representative stories because the account has exceeded its included snapshot quota. When limited, only one story per component is captured. */
  isLimited: Scalars['Boolean']['output'];
  /** Whether there is a newer build on the same branch, and therefore this build can no longer be reviewed. */
  isSuperseded: Scalars['Boolean']['output'];
  /** Incremental build number. Infrastructure upgrade builds have the same number as the original build. */
  number: Scalars['Int']['output'];
  /** Git parent commit hashes used to find the ancestor build(s) for comparison. */
  parentCommits: Array<Scalars['String']['output']>;
  /** URL-safe Git repository identifier, consisting of the owner (organization or user) name and the repository name, separated by a slash (/). This is typically part of the Git repository URL. The value originates from the CLI runtime environment, not the linked Git provider / linked repository. */
  slug?: Maybe<Scalars['String']['output']>;
  /** The current status of the build. Changes as the build progresses and as tests are reviewed. */
  status: BuildStatus;
  /** Hash of uncommitted changes, or empty string for no changes. */
  uncommittedHash?: Maybe<Scalars['String']['output']>;
  /** When the entity was last updated or created in Chromatic. */
  updatedAt: Scalars['DateTime']['output'];
};

/** A platform against which Chromatic captures stories. */
export enum Browser {
  /** Android emulator. */
  Android = 'ANDROID',
  /** Google Chrome browser. */
  Chrome = 'CHROME',
  /** Microsoft Edge browser. */
  Edge = 'EDGE',
  /** Mozilla Firefox browser. */
  Firefox = 'FIREFOX',
  /** iOS simulator. */
  Ios = 'IOS',
  /** Apple Safari browser. */
  Safari = 'SAFARI'
}

/** Metadata about the browser used for a capture. */
export type BrowserInfo = {
  __typename?: 'BrowserInfo';
  /** Identifier for this browser. */
  id: Scalars['ID']['output'];
  /** Stable key for this browser. */
  key: Browser;
  /** Browser display name. */
  name: Scalars['String']['output'];
  /** Browser version. */
  version: Scalars['String']['output'];
};

/** A Build on Chromatic. */
export type Build = {
  /** Git branch name, possibly prefixed with the owner name (in case of a forked repository). */
  branch: Scalars['String']['output'];
  /** Set of browsers against which the build was executed. */
  browsers: Array<BrowserInfo>;
  /** Git commit hash (unshortened). */
  commit: Scalars['String']['output'];
  /** Link to the commit details at the Git provider linked to the project. */
  commitUrl?: Maybe<Scalars['String']['output']>;
  /** When the commit was created in Git. */
  committedAt: Scalars['DateTime']['output'];
  /** When the entity was first created in Chromatic. */
  createdAt: Scalars['DateTime']['output'];
  /** The error that caused this build to fail. */
  error?: Maybe<BuildError>;
  /** The globally unique GraphQL node identifier. */
  id: Scalars['ID']['output'];
  /** Whether the build is limited to representative stories because the account has exceeded its included snapshot quota. When limited, only one story per component is captured. */
  isLimited: Scalars['Boolean']['output'];
  /** Whether there is a newer build on the same branch, and therefore this build can no longer be reviewed. */
  isSuperseded: Scalars['Boolean']['output'];
  /** Incremental build number. Infrastructure upgrade builds have the same number as the original build. */
  number: Scalars['Int']['output'];
  /** Git parent commit hashes used to find the ancestor build(s) for comparison. */
  parentCommits: Array<Scalars['String']['output']>;
  /** URL-safe Git repository identifier, consisting of the owner (organization or user) name and the repository name, separated by a slash (/). This is typically part of the Git repository URL. The value originates from the CLI runtime environment, not the linked Git provider / linked repository. */
  slug?: Maybe<Scalars['String']['output']>;
  /** The current status of the build. Changes as the build progresses and as tests are reviewed. */
  status: BuildStatus;
  /** Hash of uncommitted changes, or empty string for no changes. */
  uncommittedHash?: Maybe<Scalars['String']['output']>;
  /** When the entity was last updated or created in Chromatic. */
  updatedAt: Scalars['DateTime']['output'];
};

/** An error that caused a build to fail. */
export type BuildError = {
  __typename?: 'BuildError';
  /** The reason this build failed. */
  message: Scalars['String']['output'];
};

/** The final result of a completed Build. */
export enum BuildResult {
  /** At least one test failed to capture due to a problem in the story. */
  CaptureError = 'CAPTURE_ERROR',
  /** The build successfully completed every test. */
  Success = 'SUCCESS',
  /** At least one test on the build had a system error. */
  SystemError = 'SYSTEM_ERROR',
  /** The build timed out. */
  Timeout = 'TIMEOUT'
}

/** The current status of a Build. */
export enum BuildStatus {
  /** All test changes were accepted. */
  Accepted = 'ACCEPTED',
  /** The build has been created by the CLI but the Storybook files have not been uploaded yet. */
  Announced = 'ANNOUNCED',
  /** The build could not complete due to a problem with the Storybook or stories (e.g. a story threw an error while rendering). */
  Broken = 'BROKEN',
  /** The build was cancelled before it could complete. */
  Cancelled = 'CANCELLED',
  /** At least one test change was denied. */
  Denied = 'DENIED',
  /** The build could not complete due to a Chromatic infrastructure error. This is usually transient and the build can be retried. */
  Failed = 'FAILED',
  /** The build is actively testing stories. */
  InProgress = 'IN_PROGRESS',
  /** All tests passed without changes. */
  Passed = 'PASSED',
  /** At least one test has unaccepted changes. */
  Pending = 'PENDING',
  /** The build is ready for testing but has not started yet. */
  Prepared = 'PREPARED',
  /** The Storybook files have been uploaded but the build is not yet ready for testing. */
  Published = 'PUBLISHED',
  /** Skipped because no stories were affected. */
  Skipped = 'SKIPPED'
}

/** An error indicating the Build has been superseded by a newer Build on the same branch. */
export type BuildSupersededError = UserError & {
  __typename?: 'BuildSupersededError';
  /** The build to which the test belongs. */
  build: Build;
  /** A description of why the test could not be reviewed. */
  message: Scalars['String']['output'];
};

/** A capture of a Story in a specific browser, either a visual screenshot or an accessibility scan. */
export type Capture = {
  __typename?: 'Capture';
  /** Metadata about the error if the capture failed. */
  captureError?: Maybe<CaptureError>;
  /** The screenshot capture image. Available if the capture was successful or was taken after an interaction error. */
  captureImage?: Maybe<CaptureImage>;
  /** The deviceScaleFactor (DPR) the browser used when rendering this capture. */
  deviceScaleFactor?: Maybe<Scalars['Float']['output']>;
  /** Link to the full error details, including the stack trace, for a failed Capture. */
  errorsJsonUrl?: Maybe<Scalars['URL']['output']>;
  /** The ID of the capture. */
  id: Scalars['ID']['output'];
  /** Capture regions (bounding boxes) to ignore while diffing. */
  ignoredRegions?: Maybe<Array<CaptureRegion>>;
  /** Whether the screenshot was taken successfully, or failed. */
  result: CaptureResult;
};


/** A capture of a Story in a specific browser, either a visual screenshot or an accessibility scan. */
export type CaptureCaptureImageArgs = {
  signed?: InputMaybe<Scalars['Boolean']['input']>;
};


/** A capture of a Story in a specific browser, either a visual screenshot or an accessibility scan. */
export type CaptureErrorsJsonUrlArgs = {
  signed?: InputMaybe<Scalars['Boolean']['input']>;
};

/** The diff between two captures. */
export type CaptureDiff = {
  __typename?: 'CaptureDiff';
  /** The diff overlay image. Available if there are visual changes. */
  diffImage?: Maybe<CaptureOverlayImage>;
  /** The focus overlay image. Available if there are visual changes. */
  focusImage?: Maybe<CaptureOverlayImage>;
  /** The ID of the diff. */
  id: Scalars['ID']['output'];
  /** The result of comparing the baseCapture and headCapture. */
  result: CaptureDiffResult;
};


/** The diff between two captures. */
export type CaptureDiffDiffImageArgs = {
  signed?: InputMaybe<Scalars['Boolean']['input']>;
};


/** The diff between two captures. */
export type CaptureDiffFocusImageArgs = {
  signed?: InputMaybe<Scalars['Boolean']['input']>;
};

/** The result of a capture diff. */
export enum CaptureDiffResult {
  /** The two captures were found to have differences. */
  Changed = 'CHANGED',
  /** The two captures were found to be equal. */
  Equal = 'EQUAL',
  /** The diff failed due to a system error. */
  SystemError = 'SYSTEM_ERROR'
}

/** An error that occurred while capturing a Story. */
export type CaptureError = {
  /** The ID of the capture error. */
  id: Scalars['ID']['output'];
  /** The kind of capture error. */
  kind: CaptureErrorKind;
};

/** A capture error caused by the captured element exceeding the browser dimension limit. */
export type CaptureErrorBrowserDimensionLimit = CaptureError & {
  __typename?: 'CaptureErrorBrowserDimensionLimit';
  /** The device scale factor used by the browser when capturing. */
  deviceScaleFactor: Scalars['Float']['output'];
  /** The height (in CSS pixels) of the element that was captured. */
  height: Scalars['Int']['output'];
  /** The ID of the capture error. */
  id: Scalars['ID']['output'];
  /** The kind of capture error. */
  kind: CaptureErrorKind;
  /** The maximum dimension, in device pixels, allowed by the browser. */
  maxOffendingDimensionDevicePx: Scalars['Int']['output'];
  /** Which dimension exceeded the browser limit. */
  offendingDimension: CaptureErrorBrowserDimensionLimitOffendingDimension;
  /** The width (in CSS pixels) of the element that was captured. */
  width: Scalars['Int']['output'];
};

/** Which dimension exceeded the browser capture limit. */
export enum CaptureErrorBrowserDimensionLimitOffendingDimension {
  /** Height in CSS pixels. */
  Height = 'HEIGHT',
  /** Width in CSS pixels. */
  Width = 'WIDTH'
}

/** A capture error caused by the component being rendered off screen. */
export type CaptureErrorComponentOffPage = CaptureError & {
  __typename?: 'CaptureErrorComponentOffPage';
  /** The ID of the capture error. */
  id: Scalars['ID']['output'];
  /** The kind of capture error. */
  kind: CaptureErrorKind;
};

/** A capture error caused by a JavaScript failure. */
export type CaptureErrorFailedJs = CaptureError & {
  __typename?: 'CaptureErrorFailedJS';
  /** The original error that caused the capture to fail. Typically contains a name and message. */
  error: Scalars['JSONObject']['output'];
  /** The ID of the capture error. */
  id: Scalars['ID']['output'];
  /** The kind of capture error. */
  kind: CaptureErrorKind;
};

/** A capture error caused by the image exceeding the maximum allowed size. */
export type CaptureErrorImageTooLarge = CaptureError & {
  __typename?: 'CaptureErrorImageTooLarge';
  /** The height of the image that was too large. */
  height: Scalars['Int']['output'];
  /** The ID of the capture error. */
  id: Scalars['ID']['output'];
  /** The kind of capture error. */
  kind: CaptureErrorKind;
  /** The maximum number of pixels allowed for an image. */
  maxImagePixels: Scalars['Int']['output'];
  /** The width of the image that was too large. */
  width: Scalars['Int']['output'];
};

/** A capture error caused by an interaction test failure. */
export type CaptureErrorInteractionFailure = CaptureError & {
  __typename?: 'CaptureErrorInteractionFailure';
  /** The original error that caused the capture to fail. Typically contains a name and message. */
  error: Scalars['JSONObject']['output'];
  /** The ID of the capture error. */
  id: Scalars['ID']['output'];
  /** The kind of capture error. */
  kind: CaptureErrorKind;
};

/** A capture error caused by an interaction test timeout. */
export type CaptureErrorInteractionTestTimeout = CaptureError & {
  __typename?: 'CaptureErrorInteractionTestTimeout';
  /** The ID of the capture error. */
  id: Scalars['ID']['output'];
  /** The kind of capture error. */
  kind: CaptureErrorKind;
  /** The maximum number of milliseconds allowed for interaction tests to run. */
  timeoutMs: Scalars['Int']['output'];
};

/** A capture error caused by a JavaScript error. */
export type CaptureErrorJsError = CaptureError & {
  __typename?: 'CaptureErrorJSError';
  /** The original error that caused the capture to fail. Typically contains a name and message. */
  error: Scalars['JSONObject']['output'];
  /** The ID of the capture error. */
  id: Scalars['ID']['output'];
  /** The kind of capture error. */
  kind: CaptureErrorKind;
};

/** The kind of error that occurred during capture. */
export enum CaptureErrorKind {
  /** The captured element exceeded the browser dimension limit in the width or height dimension. */
  BrowserDimensionLimit = 'BROWSER_DIMENSION_LIMIT',
  /** The component was rendered off screen. */
  ComponentOffPage = 'COMPONENT_OFF_PAGE',
  /** A JavaScript error occurred in the story being rendered. */
  FailedJs = 'FAILED_JS',
  /** The image was too large to capture. */
  ImageTooLarge = 'IMAGE_TOO_LARGE',
  /** An interaction failed to complete, or encountered an assertion error. */
  InteractionFailure = 'INTERACTION_FAILURE',
  /** The interaction test took too long to complete. */
  InteractionTestTimeout = 'INTERACTION_TEST_TIMEOUT',
  /** An internal JavaScript error occurred in the Capture Cloud infrastructure. */
  JsError = 'JS_ERROR',
  /** The page took too long to load. */
  NavigationTimeout = 'NAVIGATION_TIMEOUT',
  /** The page does not contain (valid) JavaScript. */
  NoJs = 'NO_JS',
  /** Evaluation of capture-related JavaScript took too long to complete, likely due to browser locking up. */
  PageEvaluateTimeout = 'PAGE_EVALUATE_TIMEOUT',
  /** The Storybook render took too long to complete. */
  RenderTimeout = 'RENDER_TIMEOUT',
  /** The screenshot took too long to capture. */
  ScreenshotTimeout = 'SCREENSHOT_TIMEOUT',
  /** The story was not found. */
  StoryMissing = 'STORY_MISSING'
}

/** A capture error caused by a page navigation timeout. */
export type CaptureErrorNavigationTimeout = CaptureError & {
  __typename?: 'CaptureErrorNavigationTimeout';
  /** The ID of the capture error. */
  id: Scalars['ID']['output'];
  /** The kind of capture error. */
  kind: CaptureErrorKind;
  /** The maximum number of milliseconds allowed for a page to load. */
  navigationTimeoutMs: Scalars['Int']['output'];
};

/** A capture error caused by the page containing no valid JavaScript. */
export type CaptureErrorNoJs = CaptureError & {
  __typename?: 'CaptureErrorNoJS';
  /** The ID of the capture error. */
  id: Scalars['ID']['output'];
  /** The kind of capture error. */
  kind: CaptureErrorKind;
};

/** A capture error caused by a page evaluation timeout. */
export type CaptureErrorPageEvaluateTimeout = CaptureError & {
  __typename?: 'CaptureErrorPageEvaluateTimeout';
  /** The source code of the function that timed out. */
  functionSource: Scalars['String']['output'];
  /** The ID of the capture error. */
  id: Scalars['ID']['output'];
  /** The kind of capture error. */
  kind: CaptureErrorKind;
  /** The maximum number of milliseconds allowed for page.evaluate evaluation. */
  timeoutMs: Scalars['Int']['output'];
};

/** A capture error caused by a Story render timeout. */
export type CaptureErrorRenderTimeout = CaptureError & {
  __typename?: 'CaptureErrorRenderTimeout';
  /** The ID of the capture error. */
  id: Scalars['ID']['output'];
  /** The kind of capture error. */
  kind: CaptureErrorKind;
  /** The maximum number of milliseconds allowed for a story to render. */
  timeoutMs: Scalars['Int']['output'];
};

/** A capture error caused by a screenshot timeout. */
export type CaptureErrorScreenshotTimeout = CaptureError & {
  __typename?: 'CaptureErrorScreenshotTimeout';
  /** The ID of the capture error. */
  id: Scalars['ID']['output'];
  /** The kind of capture error. */
  kind: CaptureErrorKind;
  /** The maximum number of milliseconds allowed for a screenshot to be taken. */
  screenshotTimeoutMs: Scalars['Int']['output'];
};

/** A capture error caused by the Story not being found. */
export type CaptureErrorStoryMissing = CaptureError & {
  __typename?: 'CaptureErrorStoryMissing';
  /** The ID of the capture error. */
  id: Scalars['ID']['output'];
  /** The kind of capture error. */
  kind: CaptureErrorKind;
};

/** A capture error caused by a general timeout. */
export type CaptureErrorTimeoutType = CaptureError & {
  __typename?: 'CaptureErrorTimeoutType';
  /** The ID of the capture error. */
  id: Scalars['ID']['output'];
  /** The kind of capture error. */
  kind: CaptureErrorKind;
};

/** A screenshot image and its display metadata. */
export type CaptureImage = Image & {
  __typename?: 'CaptureImage';
  /** Computed CSS background color of the captured HTML body. */
  backgroundColor?: Maybe<Scalars['String']['output']>;
  /** Pixel height of the image. */
  imageHeight: Scalars['Int']['output'];
  /** URL of the image. */
  imageUrl: Scalars['URL']['output'];
  /** Pixel width of the image. */
  imageWidth: Scalars['Int']['output'];
  /** Computed CSS text direction of the captured root element. */
  textDirection?: Maybe<Scalars['String']['output']>;
  /** URL of the thumbnail image. */
  thumbnailUrl: Scalars['URL']['output'];
};

/** An overlay image highlighting visual differences. */
export type CaptureOverlayImage = Image & {
  __typename?: 'CaptureOverlayImage';
  /** Pixel height of the image. */
  imageHeight: Scalars['Int']['output'];
  /** URL of the image. */
  imageUrl: Scalars['URL']['output'];
  /** Pixel width of the image. */
  imageWidth: Scalars['Int']['output'];
};

/** A bounding box region to ignore while diffing. */
export type CaptureRegion = {
  __typename?: 'CaptureRegion';
  /** The height of the bounding box. */
  height: Scalars['Int']['output'];
  /** The ID of the capture region. */
  id: Scalars['String']['output'];
  /** The left offset of the bounding box. */
  left: Scalars['Int']['output'];
  /** The CSS selector used to find the element. */
  selector?: Maybe<Scalars['String']['output']>;
  /** The top offset of the bounding box. */
  top: Scalars['Int']['output'];
  /** The width of the bounding box. */
  width: Scalars['Int']['output'];
};

/** The result of a Story capture. */
export enum CaptureResult {
  /** The capture failed due to a problem with the story. */
  CaptureError = 'CAPTURE_ERROR',
  /** The capture succeeded and took a screenshot. */
  Success = 'SUCCESS',
  /** The capture failed due to a system error. */
  SystemError = 'SYSTEM_ERROR'
}

/** The `color-scheme` used when capturing the story. */
export enum ColorScheme {
  /** Capture the story with a dark `color-scheme`. */
  Dark = 'DARK',
  /** Capture the story with a light `color-scheme`. */
  Light = 'LIGHT'
}

/** A single message posted within a discussion thread on a build. */
export type Comment = Node & Temporal & {
  __typename?: 'Comment';
  /** The user who posted this comment. */
  author: User;
  /** When the entity was first created in Chromatic. */
  createdAt: Scalars['DateTime']['output'];
  /** The globally unique GraphQL node identifier. */
  id: Scalars['ID']['output'];
  /** The plain-text content of the comment. */
  message: Scalars['String']['output'];
  /** When the entity was last updated or created in Chromatic. */
  updatedAt: Scalars['DateTime']['output'];
};

/** A discussion thread attached to a build, scoped to a test or a specific visual comparison (snapshot). Threads are created by reviewers in the Chromatic UI and may be resolved once feedback is addressed. */
export type CommentThread = Node & Temporal & {
  __typename?: 'CommentThread';
  /** The individual messages posted in this thread, oldest first. */
  comments?: Maybe<CommentThreadCommentConnection>;
  /** When the entity was first created in Chromatic. */
  createdAt: Scalars['DateTime']['output'];
  /** The globally unique GraphQL node identifier. */
  id: Scalars['ID']['output'];
  /** What this thread is attached to: a test, a set of tests, or a single visual comparison. */
  kind: CommentThreadKind;
  /** Whether this thread is still open for follow-up or has been resolved. */
  status: CommentThreadStatus;
  /** The test this thread is scoped to, if any. */
  test?: Maybe<Test>;
  /** When the entity was last updated or created in Chromatic. */
  updatedAt: Scalars['DateTime']['output'];
  /** Link to this thread in the Chromatic web app. */
  webUrl: Scalars['URL']['output'];
};


/** A discussion thread attached to a build, scoped to a test or a specific visual comparison (snapshot). Threads are created by reviewers in the Chromatic UI and may be resolved once feedback is addressed. */
export type CommentThreadCommentsArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  before?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/** Connection to a list of CommentThreadComment. */
export type CommentThreadCommentConnection = {
  __typename?: 'CommentThreadCommentConnection';
  /** List of edges for CommentThreadCommentConnection. */
  edges: Array<CommentThreadCommentEdge>;
  /** List of nodes for CommentThreadCommentConnection. */
  nodes: Array<Comment>;
  /** Pagination details for CommentThreadCommentConnection. */
  pageInfo: PageInfo;
  /** Total number of items for CommentThreadCommentConnection. */
  totalCount: Scalars['Int']['output'];
};

/** The edge type for CommentThreadComment. */
export type CommentThreadCommentEdge = {
  __typename?: 'CommentThreadCommentEdge';
  /** Cursor to this item. */
  cursor: Scalars['String']['output'];
  /** The item at the edge. */
  node: Comment;
};

/** What a discussion thread is attached to. */
export enum CommentThreadKind {
  /** The thread is attached to a single test. */
  Test = 'TEST'
}

/** The status of a CommentThread. */
export enum CommentThreadStatus {
  /** The thread is open and awaiting follow-up. */
  Active = 'ACTIVE',
  /** The thread has been marked resolved. */
  Resolved = 'RESOLVED'
}

/** The result of comparing a test capture against its baseline. */
export enum ComparisonResult {
  /** headCapture succeeded and no baseCapture exists. */
  Added = 'ADDED',
  /** The headCapture failed because the story is broken. */
  CaptureError = 'CAPTURE_ERROR',
  /** headCapture succeeded and differs from baseCapture. */
  Changed = 'CHANGED',
  /** headCapture succeeded and matches the baseCapture. */
  Equal = 'EQUAL',
  /** baseCapture had an error and headCapture succeeded. */
  Fixed = 'FIXED',
  /** baseCapture exists but there is no headCapture. */
  Removed = 'REMOVED',
  /** The story was skipped and not captured. */
  Skipped = 'SKIPPED',
  /** Either the headCapture or the diff failed due to a system error. */
  SystemError = 'SYSTEM_ERROR'
}

/** A build that has completed testing. */
export type CompletedBuild = Build & Node & Temporal & {
  __typename?: 'CompletedBuild';
  /** Git branch name, possibly prefixed with the owner name (in case of a forked repository). */
  branch: Scalars['String']['output'];
  /** Set of browsers against which the build was executed. */
  browsers: Array<BrowserInfo>;
  /** Git commit hash (unshortened). */
  commit: Scalars['String']['output'];
  /** Link to the commit details at the Git provider linked to the project. */
  commitUrl?: Maybe<Scalars['String']['output']>;
  /** When the commit was created in Git. */
  committedAt: Scalars['DateTime']['output'];
  /** When the build was completed in Chromatic. */
  completedAt: Scalars['DateTime']['output'];
  /** The number of components in the published Storybook, excluding docsOnly components. */
  componentCount: Scalars['Int']['output'];
  /** Paginated list of each component and its representative test. */
  componentRepresentations?: Maybe<CompletedBuildComponentRepresentationConnection>;
  /** When the entity was first created in Chromatic. */
  createdAt: Scalars['DateTime']['output'];
  /** The discussion threads left on this build, oldest first. */
  discussions?: Maybe<CompletedBuildCommentThreadConnection>;
  /** The number of docsOnly stories in the published Storybook. */
  docsCount: Scalars['Int']['output'];
  /** The error that caused this build to fail. */
  error?: Maybe<BuildError>;
  /** The globally unique GraphQL node identifier. */
  id: Scalars['ID']['output'];
  /** Whether the build is limited to representative stories because the account has exceeded its included snapshot quota. When limited, only one story per component is captured. */
  isLimited: Scalars['Boolean']['output'];
  /** Whether there is a newer build on the same branch, and therefore this build can no longer be reviewed. */
  isSuperseded: Scalars['Boolean']['output'];
  /** Link to the published Storybook's canvas (iframe.html). */
  isolatorUrl: Scalars['URL']['output'];
  /** Incremental build number. Infrastructure upgrade builds have the same number as the original build. */
  number: Scalars['Int']['output'];
  /** Git parent commit hashes used to find the ancestor build(s) for comparison. */
  parentCommits: Array<Scalars['String']['output']>;
  /** When the build was prepared for testing on Chromatic. */
  preparedAt: Scalars['DateTime']['output'];
  /** When the Storybook was published on Chromatic. */
  publishedAt: Scalars['DateTime']['output'];
  /** The final outcome of the build's capture process. Only available once the build has completed. */
  result: BuildResult;
  /** URL-safe Git repository identifier, consisting of the owner (organization or user) name and the repository name, separated by a slash (/). This is typically part of the Git repository URL. The value originates from the CLI runtime environment, not the linked Git provider / linked repository. */
  slug?: Maybe<Scalars['String']['output']>;
  /** The number of stories in the published Storybook, excluding docsOnly stories. */
  specCount: Scalars['Int']['output'];
  /** When the build was started in Chromatic. */
  startedAt: Scalars['DateTime']['output'];
  /** The current status of the build. Changes as the build progresses and as tests are reviewed. */
  status: BuildStatus;
  /** Link to the published Storybook. */
  storybookUrl: Scalars['URL']['output'];
  /** Count the number of tests in the build. All provided filter arguments must match (AND). */
  testCount: Scalars['Int']['output'];
  /** The tests in this build, optionally filtered by status or CSF story ID. */
  tests?: Maybe<CompletedBuildTestConnection>;
  /** Hash of uncommitted changes, or empty string for no changes. */
  uncommittedHash?: Maybe<Scalars['String']['output']>;
  /** When the entity was last updated or created in Chromatic. */
  updatedAt: Scalars['DateTime']['output'];
  /** Link to the build details on Chromatic. */
  webUrl: Scalars['URL']['output'];
};


/** A build that has completed testing. */
export type CompletedBuildComponentRepresentationsArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  before?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<CompletedBuildComponentRepresentationsOrder>;
};


/** A build that has completed testing. */
export type CompletedBuildDiscussionsArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  before?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A build that has completed testing. */
export type CompletedBuildTestCountArgs = {
  results?: InputMaybe<Array<TestResult>>;
  reviewable?: InputMaybe<Scalars['Boolean']['input']>;
  statuses?: InputMaybe<Array<TestStatus>>;
};


/** A build that has completed testing. */
export type CompletedBuildTestsArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  before?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<CompletedBuildTestsOrder>;
  statuses?: InputMaybe<Array<TestStatus>>;
  storyId?: InputMaybe<Scalars['String']['input']>;
};

/** Connection to a list of CompletedBuildCommentThread. */
export type CompletedBuildCommentThreadConnection = {
  __typename?: 'CompletedBuildCommentThreadConnection';
  /** List of edges for CompletedBuildCommentThreadConnection. */
  edges: Array<CompletedBuildCommentThreadEdge>;
  /** List of nodes for CompletedBuildCommentThreadConnection. */
  nodes: Array<CommentThread>;
  /** Pagination details for CompletedBuildCommentThreadConnection. */
  pageInfo: PageInfo;
  /** Total number of items for CompletedBuildCommentThreadConnection. */
  totalCount: Scalars['Int']['output'];
};

/** The edge type for CompletedBuildCommentThread. */
export type CompletedBuildCommentThreadEdge = {
  __typename?: 'CompletedBuildCommentThreadEdge';
  /** Cursor to this item. */
  cursor: Scalars['String']['output'];
  /** The item at the edge. */
  node: CommentThread;
};

/** Connection to a list of CompletedBuildComponentRepresentation. */
export type CompletedBuildComponentRepresentationConnection = {
  __typename?: 'CompletedBuildComponentRepresentationConnection';
  /** List of edges for CompletedBuildComponentRepresentationConnection. */
  edges: Array<CompletedBuildComponentRepresentationEdge>;
  /** List of nodes for CompletedBuildComponentRepresentationConnection. */
  nodes: Array<ComponentRepresentation>;
  /** Pagination details for CompletedBuildComponentRepresentationConnection. */
  pageInfo: PageInfo;
  /** Total number of items for CompletedBuildComponentRepresentationConnection. */
  totalCount: Scalars['Int']['output'];
};

/** The edge type for CompletedBuildComponentRepresentation. */
export type CompletedBuildComponentRepresentationEdge = {
  __typename?: 'CompletedBuildComponentRepresentationEdge';
  /** Cursor to this item. */
  cursor: Scalars['String']['output'];
  /** The item at the edge. */
  node: ComponentRepresentation;
};

/** Ordering options for the connection. */
export type CompletedBuildComponentRepresentationsOrder = {
  /** The sort direction. */
  direction: OrderDirection;
  /** The field to sort by. */
  field: CompletedBuildComponentRepresentationsOrderField;
};

/** The field to sort by. */
export enum CompletedBuildComponentRepresentationsOrderField {
  /** Sort by creation date. */
  CreatedAt = 'createdAt',
  /** Sort by result priority, with stories needing attention first (errors, then new, then changed, then removed). */
  ResultOrder = 'resultOrder',
  /** Sort by story order in the Storybook. */
  StoryOrder = 'storyOrder',
  /** Sort by last update date. */
  UpdatedAt = 'updatedAt'
}

/** Connection to a list of CompletedBuildTest. */
export type CompletedBuildTestConnection = {
  __typename?: 'CompletedBuildTestConnection';
  /** List of edges for CompletedBuildTestConnection. */
  edges: Array<CompletedBuildTestEdge>;
  /** List of nodes for CompletedBuildTestConnection. */
  nodes: Array<Test>;
  /** Pagination details for CompletedBuildTestConnection. */
  pageInfo: PageInfo;
  /** Total number of items for CompletedBuildTestConnection. */
  totalCount: Scalars['Int']['output'];
};

/** The edge type for CompletedBuildTest. */
export type CompletedBuildTestEdge = {
  __typename?: 'CompletedBuildTestEdge';
  /** Cursor to this item. */
  cursor: Scalars['String']['output'];
  /** The item at the edge. */
  node: Test;
};

/** Ordering options for the connection. */
export type CompletedBuildTestsOrder = {
  /** The sort direction. */
  direction: OrderDirection;
  /** The field to sort by. */
  field: CompletedBuildTestsOrderField;
};

/** The field to sort by. */
export enum CompletedBuildTestsOrderField {
  /** Sort by creation date. */
  CreatedAt = 'createdAt',
  /** Sort by result priority, with stories needing attention first (errors, then new, then changed, then removed). */
  ResultOrder = 'resultOrder',
  /** Sort by story order in the Storybook. */
  StoryOrder = 'storyOrder',
  /** Sort by last update date. */
  UpdatedAt = 'updatedAt'
}

/** A Component in a Chromatic build. */
export type Component = Node & Temporal & {
  __typename?: 'Component';
  /** The component ID derived from the story file's `id` export, or a slugified version of its `title` (e.g. `button`). */
  componentId: Scalars['String']['output'];
  /** When the entity was first created in Chromatic. */
  createdAt: Scalars['DateTime']['output'];
  /** A project-unique component identifier. Differs from `componentId` when two components in different files share the same ID. */
  csfId?: Maybe<Scalars['String']['output']>;
  /** The globally unique GraphQL node identifier. */
  id: Scalars['ID']['output'];
  /** Display name of the component (last section of the title). */
  name: Scalars['String']['output'];
  /** Normalized hierarchy path, including component name as last item. */
  path: Array<Scalars['String']['output']>;
  /** The story most representative of this component. */
  representativeStory?: Maybe<Story>;
  /** The Stories in this component. */
  stories?: Maybe<StoryConnection>;
  /** Title (hierarchy path) as specified on story metadata (default export) or autogenerated based on file path. */
  title: Scalars['String']['output'];
  /** When the entity was last updated or created in Chromatic. */
  updatedAt: Scalars['DateTime']['output'];
};


/** A Component in a Chromatic build. */
export type ComponentStoriesArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  before?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<StoriesOrder>;
};

/** Connection to a list of Component. */
export type ComponentConnection = {
  __typename?: 'ComponentConnection';
  /** List of edges for ComponentConnection. */
  edges: Array<ComponentEdge>;
  /** List of nodes for ComponentConnection. */
  nodes: Array<Component>;
  /** Pagination details for ComponentConnection. */
  pageInfo: PageInfo;
  /** Total number of items for ComponentConnection. */
  totalCount: Scalars['Int']['output'];
};

/** The edge type for Component. */
export type ComponentEdge = {
  __typename?: 'ComponentEdge';
  /** Cursor to this item. */
  cursor: Scalars['String']['output'];
  /** The item at the edge. */
  node: Component;
};

/** Represents a component in a build. */
export type ComponentRepresentation = {
  __typename?: 'ComponentRepresentation';
  /** The component represented here. */
  component: Component;
  /** This test is the best representation of the first spec of the component on this build. */
  representativeTest: Test;
};

/** Ordering options for the connection. */
export type ComponentsOrder = {
  /** The sort direction. */
  direction: OrderDirection;
  /** The field to sort by. */
  field: ComponentsOrderField;
};

/** The field to sort by. */
export enum ComponentsOrderField {
  /** Sort by creation date. */
  CreatedAt = 'createdAt',
  /** Sort by last update date. */
  UpdatedAt = 'updatedAt'
}

/** The response returned after confirming a Storybook share upload. */
export type ConfirmShareResponse = {
  __typename?: 'ConfirmShareResponse';
  /** The number of days until the shared Storybook expires. */
  daysToExpire: Scalars['Int']['output'];
  /** The ID of the confirmed share. */
  shareId: Scalars['ID']['output'];
  /** The current status of the share. */
  status: ShareStatus;
};

export type CreateFigmaMetadataInput = {
  key: Scalars['String']['input'];
  metadata: Scalars['JSONObject']['input'];
  url: Scalars['String']['input'];
};

/** Provide exactly one client type to create. */
export type CreateOAuthClientInput = {
  /** Input for creating a machine-to-machine account service client. */
  accountServiceClient?: InputMaybe<AccountServiceClientInput>;
};

/** The payload returned when creating an OAuth client. */
export type CreateOAuthClientPayload = {
  __typename?: 'CreateOAuthClientPayload';
  /** The OAuth client ID. */
  clientId: Scalars['String']['output'];
  /** The OAuth client secret. Only returned once at creation time — store it securely. */
  clientSecret: Scalars['String']['output'];
  /** The display name of the client. */
  name: Scalars['String']['output'];
  /** The OAuth scopes the client is authorized to request. */
  scopes: Array<Scalars['String']['output']>;
};

export type FigmaMetadata = Node & Temporal & {
  __typename?: 'FigmaMetadata';
  /** When the entity was first created in Chromatic. */
  createdAt: Scalars['DateTime']['output'];
  /** The globally unique GraphQL node identifier. */
  id: Scalars['ID']['output'];
  key: Scalars['String']['output'];
  metadata: Scalars['JSONObject']['output'];
  owner?: Maybe<User>;
  project?: Maybe<Project>;
  story?: Maybe<Story>;
  /** When the entity was last updated or created in Chromatic. */
  updatedAt: Scalars['DateTime']['output'];
  url?: Maybe<Scalars['String']['output']>;
};

/** A git provider that can host a linked repository. */
export enum GitProvider {
  /** Bitbucket */
  Bitbucket = 'BITBUCKET',
  /** GitHub */
  Github = 'GITHUB',
  /** GitLab */
  Gitlab = 'GITLAB'
}

/** An image with dimensions and a URL. */
export type Image = {
  /** Pixel height of the image. */
  imageHeight: Scalars['Int']['output'];
  /** URL of the image. */
  imageUrl: Scalars['URL']['output'];
  /** Pixel width of the image. */
  imageWidth: Scalars['Int']['output'];
};

/** The git repository a Project is linked to. */
export type LinkedRepository = {
  __typename?: 'LinkedRepository';
  /** The git provider hosting the repository. */
  gitProvider: GitProvider;
  /** Name of the repository. */
  name: Scalars['String']['output'];
  /** Login name of the repository owner. */
  owner: Scalars['String']['output'];
};

/** Options for filtering builds based on whether they were run locally in the Visual Test Addon. */
export type LocalBuildsSpecifierInput = {
  /** If set, only return builds that match this flag. */
  isLocalBuild?: InputMaybe<Scalars['Boolean']['input']>;
  /** If set, include all CI builds plus local builds whose author email hash matches this value. */
  localBuildEmailHash?: InputMaybe<Scalars['String']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  bulkCreateFigmaMetadata: Array<FigmaMetadata>;
  bulkRemoveFigmaMetadata: Array<FigmaMetadata>;
  /** Confirm a Storybook share upload and set its status. */
  confirmStorybookShare: ConfirmShareResponse;
  /** Create a CLI token for the given Project. */
  createCLIToken: Scalars['String']['output'];
  createFigmaMetadata?: Maybe<FigmaMetadata>;
  /** Create a machine-to-machine OAuth client for an Account. */
  createOAuthClient: CreateOAuthClientPayload;
  /**
   * Create a Project, linked to a git repository or standalone.
   *
   * - **Linked** — pass `repository` with the git provider and the `owner/repo` path.
   * - **Standalone** — omit `repository` and pass a `name`.
   *
   * On success, read `project.projectToken` for the token used to run builds, and store it securely.
   */
  projectCreate: ProjectCreateResponse;
  removeFigmaMetadata?: Maybe<FigmaMetadata>;
  /** Review a test by accepting, denying, or ignoring its changes. */
  reviewTest?: Maybe<ReviewTestPayload>;
  /** Quarantine the Story/mode of the given Test. Quarantining also auto-ignores the Test for this build; it stays ignored across reruns until unquarantined via `testUnquarantine`. */
  testQuarantine: TestQuarantineResponse;
  /** Remove a Test's Story/mode from quarantine. */
  testUnquarantine: TestUnquarantineResponse;
  /** Update the current user's preferences. */
  updateUserPreferences?: Maybe<UpdateUserPreferencesPayload>;
  /** Initiate a Storybook share upload and return an upload target. */
  uploadStorybookShare: ShareUploadPayload;
};


export type MutationBulkCreateFigmaMetadataArgs = {
  input: Array<CreateFigmaMetadataInput>;
};


export type MutationBulkRemoveFigmaMetadataArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationConfirmStorybookShareArgs = {
  shareId: Scalars['ID']['input'];
  status: ShareStatus;
};


export type MutationCreateCliTokenArgs = {
  projectId: Scalars['String']['input'];
};


export type MutationCreateFigmaMetadataArgs = {
  key: Scalars['String']['input'];
  metadata: Scalars['JSONObject']['input'];
  url: Scalars['String']['input'];
};


export type MutationCreateOAuthClientArgs = {
  input: CreateOAuthClientInput;
};


export type MutationProjectCreateArgs = {
  input: ProjectCreateInput;
};


export type MutationRemoveFigmaMetadataArgs = {
  id: Scalars['ID']['input'];
};


export type MutationReviewTestArgs = {
  input: ReviewTestInput;
};


export type MutationTestQuarantineArgs = {
  input: TestQuarantineInput;
};


export type MutationTestUnquarantineArgs = {
  input: TestUnquarantineInput;
};


export type MutationUpdateUserPreferencesArgs = {
  input: UserPreferencesInput;
};

/** An error that prevented a mutation from succeeding. */
export type MutationError = {
  /** A human-readable message describing the error. */
  message: Scalars['String']['output'];
};

/** A node with a globally unique ID. */
export type Node = {
  /** The globally unique GraphQL node identifier. */
  id: Scalars['ID']['output'];
};

/** The sort direction. */
export enum OrderDirection {
  /** Ascending. */
  Asc = 'ASC',
  /** Descending. */
  Desc = 'DESC'
}

/** Information about pagination in a connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** Whether there are more items when paginating forwards. */
  hasNextPage: Scalars['Boolean']['output'];
  /** Whether there are more items when paginating backwards. */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']['output']>;
};

/** A build that is ready to be tested. */
export type PreparedBuild = Build & Node & Temporal & {
  __typename?: 'PreparedBuild';
  /** Git branch name, possibly prefixed with the owner name (in case of a forked repository). */
  branch: Scalars['String']['output'];
  /** Set of browsers against which the build was executed. */
  browsers: Array<BrowserInfo>;
  /** Git commit hash (unshortened). */
  commit: Scalars['String']['output'];
  /** Link to the commit details at the Git provider linked to the project. */
  commitUrl?: Maybe<Scalars['String']['output']>;
  /** When the commit was created in Git. */
  committedAt: Scalars['DateTime']['output'];
  /** The number of components in the published Storybook, excluding docsOnly components. */
  componentCount: Scalars['Int']['output'];
  /** When the entity was first created in Chromatic. */
  createdAt: Scalars['DateTime']['output'];
  /** The discussion threads left on this build, oldest first. */
  discussions?: Maybe<PreparedBuildCommentThreadConnection>;
  /** The number of docsOnly stories in the published Storybook. */
  docsCount: Scalars['Int']['output'];
  /** The error that caused this build to fail. */
  error?: Maybe<BuildError>;
  /** The globally unique GraphQL node identifier. */
  id: Scalars['ID']['output'];
  /** Whether the build is limited to representative stories because the account has exceeded its included snapshot quota. When limited, only one story per component is captured. */
  isLimited: Scalars['Boolean']['output'];
  /** Whether there is a newer build on the same branch, and therefore this build can no longer be reviewed. */
  isSuperseded: Scalars['Boolean']['output'];
  /** Link to the published Storybook's canvas (iframe.html). */
  isolatorUrl: Scalars['URL']['output'];
  /** Incremental build number. Infrastructure upgrade builds have the same number as the original build. */
  number: Scalars['Int']['output'];
  /** Git parent commit hashes used to find the ancestor build(s) for comparison. */
  parentCommits: Array<Scalars['String']['output']>;
  /** When the build was prepared for testing on Chromatic. */
  preparedAt: Scalars['DateTime']['output'];
  /** When the Storybook was published on Chromatic. */
  publishedAt: Scalars['DateTime']['output'];
  /** URL-safe Git repository identifier, consisting of the owner (organization or user) name and the repository name, separated by a slash (/). This is typically part of the Git repository URL. The value originates from the CLI runtime environment, not the linked Git provider / linked repository. */
  slug?: Maybe<Scalars['String']['output']>;
  /** The number of stories in the published Storybook, excluding docsOnly stories. */
  specCount: Scalars['Int']['output'];
  /** The current status of the build. Changes as the build progresses and as tests are reviewed. */
  status: BuildStatus;
  /** Link to the published Storybook. */
  storybookUrl: Scalars['URL']['output'];
  /** Count the number of tests in the build. All provided filter arguments must match (AND). */
  testCount: Scalars['Int']['output'];
  /** The tests in this build, optionally filtered by status or CSF story ID. */
  tests?: Maybe<PreparedBuildTestConnection>;
  /** Hash of uncommitted changes, or empty string for no changes. */
  uncommittedHash?: Maybe<Scalars['String']['output']>;
  /** When the entity was last updated or created in Chromatic. */
  updatedAt: Scalars['DateTime']['output'];
};


/** A build that is ready to be tested. */
export type PreparedBuildDiscussionsArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  before?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A build that is ready to be tested. */
export type PreparedBuildTestCountArgs = {
  results?: InputMaybe<Array<TestResult>>;
  reviewable?: InputMaybe<Scalars['Boolean']['input']>;
  statuses?: InputMaybe<Array<TestStatus>>;
};


/** A build that is ready to be tested. */
export type PreparedBuildTestsArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  before?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<PreparedBuildTestsOrder>;
  statuses?: InputMaybe<Array<TestStatus>>;
  storyId?: InputMaybe<Scalars['String']['input']>;
};

/** Connection to a list of PreparedBuildCommentThread. */
export type PreparedBuildCommentThreadConnection = {
  __typename?: 'PreparedBuildCommentThreadConnection';
  /** List of edges for PreparedBuildCommentThreadConnection. */
  edges: Array<PreparedBuildCommentThreadEdge>;
  /** List of nodes for PreparedBuildCommentThreadConnection. */
  nodes: Array<CommentThread>;
  /** Pagination details for PreparedBuildCommentThreadConnection. */
  pageInfo: PageInfo;
  /** Total number of items for PreparedBuildCommentThreadConnection. */
  totalCount: Scalars['Int']['output'];
};

/** The edge type for PreparedBuildCommentThread. */
export type PreparedBuildCommentThreadEdge = {
  __typename?: 'PreparedBuildCommentThreadEdge';
  /** Cursor to this item. */
  cursor: Scalars['String']['output'];
  /** The item at the edge. */
  node: CommentThread;
};

/** Connection to a list of PreparedBuildTest. */
export type PreparedBuildTestConnection = {
  __typename?: 'PreparedBuildTestConnection';
  /** List of edges for PreparedBuildTestConnection. */
  edges: Array<PreparedBuildTestEdge>;
  /** List of nodes for PreparedBuildTestConnection. */
  nodes: Array<Test>;
  /** Pagination details for PreparedBuildTestConnection. */
  pageInfo: PageInfo;
  /** Total number of items for PreparedBuildTestConnection. */
  totalCount: Scalars['Int']['output'];
};

/** The edge type for PreparedBuildTest. */
export type PreparedBuildTestEdge = {
  __typename?: 'PreparedBuildTestEdge';
  /** Cursor to this item. */
  cursor: Scalars['String']['output'];
  /** The item at the edge. */
  node: Test;
};

/** Ordering options for the connection. */
export type PreparedBuildTestsOrder = {
  /** The sort direction. */
  direction: OrderDirection;
  /** The field to sort by. */
  field: PreparedBuildTestsOrderField;
};

/** The field to sort by. */
export enum PreparedBuildTestsOrderField {
  /** Sort by creation date. */
  CreatedAt = 'createdAt',
  /** Sort by result priority, with stories needing attention first (errors, then new, then changed, then removed). */
  ResultOrder = 'resultOrder',
  /** Sort by story order in the Storybook. */
  StoryOrder = 'storyOrder',
  /** Sort by last update date. */
  UpdatedAt = 'updatedAt'
}

/** A Chromatic project. */
export type Project = Node & Temporal & {
  __typename?: 'Project';
  /** Account to which this Project belongs. */
  account: Account;
  /** List of branches for which builds exist in the project. */
  branchNames: Array<Scalars['String']['output']>;
  /** Look up a Build in this Project by its number. */
  build?: Maybe<Build>;
  /** When the entity was first created in Chromatic. */
  createdAt: Scalars['DateTime']['output'];
  /** The Chromatic features enabled for this project. */
  features: ProjectFeatures;
  /** This token is the Figma OAuth2 accessToken of whichever user assigned their Figma credentials to the project. */
  figmaToken?: Maybe<Scalars['String']['output']>;
  /** The globally unique GraphQL node identifier. */
  id: Scalars['ID']['output'];
  /** Retrieve the last build for the project which matches the (optionally) provided filters. All filter arguments must match (AND). */
  lastBuild?: Maybe<Build>;
  /** The git repository this Project is linked to, or null for a standalone Project. */
  linkedRepository?: Maybe<LinkedRepository>;
  /** Link to the project's manage screen on Chromatic. */
  manageUrl: Scalars['URL']['output'];
  /** Project name, typically the repository name. */
  name: Scalars['String']['output'];
  /** Project token to start builds with Chromatic CLI. */
  projectToken: Scalars['String']['output'];
  /** Basic Account information about the Account that owns the Project. */
  publicAccountInfo: PublicAccountInfo;
  /** Stories currently quarantined in this Project, most recently quarantined first. */
  quarantinedStories?: Maybe<QuarantinedStoryConnection>;
  /** The test framework this Project runs, or null if this API version does not name it. */
  type?: Maybe<ProjectKind>;
  /** When the entity was last updated or created in Chromatic. */
  updatedAt: Scalars['DateTime']['output'];
  /** Link to the project home on Chromatic. */
  webUrl: Scalars['URL']['output'];
};


/** A Chromatic project. */
export type ProjectBranchNamesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


/** A Chromatic project. */
export type ProjectBuildArgs = {
  number: Scalars['Int']['input'];
};


/** A Chromatic project. */
export type ProjectLastBuildArgs = {
  branches?: InputMaybe<Array<Scalars['String']['input']>>;
  defaultBranch?: InputMaybe<Scalars['Boolean']['input']>;
  localBuilds?: InputMaybe<LocalBuildsSpecifierInput>;
  repositoryOwnerName?: InputMaybe<Scalars['String']['input']>;
  results?: InputMaybe<Array<BuildResult>>;
  slug?: InputMaybe<Scalars['String']['input']>;
  statuses?: InputMaybe<Array<BuildStatus>>;
};


/** A Chromatic project. */
export type ProjectQuarantinedStoriesArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  before?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/** An error that prevented the Project from being created. */
export type ProjectCreateError = AccountNotLinkedError | ProjectNameRequiredError | ProjectNameTakenError | RepositoryNotAccessibleError | RepositoryOwnerMismatchError | RepositoryRequiredError | UnknownMutationError;

/** The Project was not created. */
export type ProjectCreateFailure = {
  __typename?: 'ProjectCreateFailure';
  /** The errors that prevented the Project from being created. Always non-empty. */
  errors: Array<ProjectCreateError>;
};

/** A git provider a new Project may be linked to. */
export enum ProjectCreateGitProvider {
  /** GitHub */
  Github = 'GITHUB'
}

/** Input for creating a Project. */
export type ProjectCreateInput = {
  /** The ID of the Account to create the Project in. */
  accountId: Scalars['ID']['input'];
  /** The name for the Project. Required when `repository` is omitted; otherwise it defaults to the repository name. Creating another Project for the same repository requires a distinct name. */
  name?: InputMaybe<Scalars['String']['input']>;
  /** The git repository to link the new Project to. Omit to create a standalone Project. */
  repository?: InputMaybe<ProjectRepositoryInput>;
  /** The test framework the new Project runs. */
  type?: InputMaybe<ProjectKindInput>;
};

/** The result of creating a Project. */
export type ProjectCreateResponse = ProjectCreateFailure | ProjectCreateSuccess;

/** The Project was created. */
export type ProjectCreateSuccess = {
  __typename?: 'ProjectCreateSuccess';
  /** The newly created Project. */
  project: Project;
};

/** The Chromatic features enabled for this project. */
export type ProjectFeatures = {
  __typename?: 'ProjectFeatures';
  /** Whether UI Review is enabled for this project. */
  uiReview: Scalars['Boolean']['output'];
  /** Whether UI Tests is enabled for this project. */
  uiTests: Scalars['Boolean']['output'];
};

/** Criteria for filtering a list of projects. */
export type ProjectFilter = {
  /** Only return projects whose name contains this string (case-insensitive). */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Only return projects whose linked repository name matches this string exactly. */
  repositoryName?: InputMaybe<Scalars['String']['input']>;
  /** Only return projects whose linked repository owner matches this string exactly. */
  repositoryOwner?: InputMaybe<Scalars['String']['input']>;
};

/** The test framework a Project runs. */
export enum ProjectKind {
  /** Visual tests for Cypress end-to-end tests. */
  Cypress = 'CYPRESS',
  /** Visual tests for Playwright end-to-end tests. */
  Playwright = 'PLAYWRIGHT',
  /** Visual tests for Storybook stories. */
  Storybook = 'STORYBOOK',
  /** Visual tests for Vitest browser mode tests. */
  Vitest = 'VITEST'
}

/** The test framework a new Project runs. */
export enum ProjectKindInput {
  /** Visual tests for Cypress end-to-end tests. */
  Cypress = 'CYPRESS',
  /** Visual tests for Playwright end-to-end tests. */
  Playwright = 'PLAYWRIGHT',
  /** Visual tests for Storybook stories. */
  Storybook = 'STORYBOOK'
}

/** A user's membership and access level on a specific project. */
export type ProjectMembership = {
  __typename?: 'ProjectMembership';
  /** The user's access level on this project. */
  accessLevel: AccessLevel;
  /** When the entity was first created in Chromatic. */
  createdAt: Scalars['DateTime']['output'];
  /** The globally unique GraphQL node identifier. */
  id: Scalars['ID']['output'];
  /** Whether the user's access level meets or exceeds the given minimum. */
  meetsAccessLevel: Scalars['Boolean']['output'];
  /** The project in this membership. */
  project: Project;
  /** When the entity was last updated or created in Chromatic. */
  updatedAt: Scalars['DateTime']['output'];
  /** The user in this membership. */
  user?: Maybe<User>;
};


/** A user's membership and access level on a specific project. */
export type ProjectMembershipMeetsAccessLevelArgs = {
  minimumAccessLevel: AccessLevel;
};

/** A Project name is required when no repository is given. */
export type ProjectNameRequiredError = MutationError & {
  __typename?: 'ProjectNameRequiredError';
  /** A human-readable message describing the error. */
  message: Scalars['String']['output'];
};

/** A Project with the given name already exists in the Account. */
export type ProjectNameTakenError = MutationError & {
  __typename?: 'ProjectNameTakenError';
  /** A human-readable message describing the error. */
  message: Scalars['String']['output'];
};

/** A git repository to link a Project to. */
export type ProjectRepositoryInput = {
  /** The repository path, such as `owner/repo`. */
  fullName: Scalars['String']['input'];
  /** The git provider hosting the repository. */
  provider: ProjectCreateGitProvider;
};

/** Basic account information available to all Project viewers. */
export type PublicAccountInfo = {
  __typename?: 'PublicAccountInfo';
  /** Avatar URL of the repository owner or token holder. */
  avatarUrl?: Maybe<Scalars['URL']['output']>;
  /** Login name of the repository owner or token holder. */
  name: Scalars['String']['output'];
};

/** A build whose Storybook files have been uploaded but is not yet ready for testing. */
export type PublishedBuild = Build & Node & Temporal & {
  __typename?: 'PublishedBuild';
  /** Git branch name, possibly prefixed with the owner name (in case of a forked repository). */
  branch: Scalars['String']['output'];
  /** Set of browsers against which the build was executed. */
  browsers: Array<BrowserInfo>;
  /** Git commit hash (unshortened). */
  commit: Scalars['String']['output'];
  /** Link to the commit details at the Git provider linked to the project. */
  commitUrl?: Maybe<Scalars['String']['output']>;
  /** When the commit was created in Git. */
  committedAt: Scalars['DateTime']['output'];
  /** When the entity was first created in Chromatic. */
  createdAt: Scalars['DateTime']['output'];
  /** The error that caused this build to fail. */
  error?: Maybe<BuildError>;
  /** The globally unique GraphQL node identifier. */
  id: Scalars['ID']['output'];
  /** Whether the build is limited to representative stories because the account has exceeded its included snapshot quota. When limited, only one story per component is captured. */
  isLimited: Scalars['Boolean']['output'];
  /** Whether there is a newer build on the same branch, and therefore this build can no longer be reviewed. */
  isSuperseded: Scalars['Boolean']['output'];
  /** Link to the published Storybook's canvas (iframe.html). */
  isolatorUrl: Scalars['URL']['output'];
  /** Incremental build number. Infrastructure upgrade builds have the same number as the original build. */
  number: Scalars['Int']['output'];
  /** Git parent commit hashes used to find the ancestor build(s) for comparison. */
  parentCommits: Array<Scalars['String']['output']>;
  /** When the Storybook was published on Chromatic. */
  publishedAt: Scalars['DateTime']['output'];
  /** URL-safe Git repository identifier, consisting of the owner (organization or user) name and the repository name, separated by a slash (/). This is typically part of the Git repository URL. The value originates from the CLI runtime environment, not the linked Git provider / linked repository. */
  slug?: Maybe<Scalars['String']['output']>;
  /** The current status of the build. Changes as the build progresses and as tests are reviewed. */
  status: BuildStatus;
  /** Link to the published Storybook. */
  storybookUrl: Scalars['URL']['output'];
  /** Hash of uncommitted changes, or empty string for no changes. */
  uncommittedHash?: Maybe<Scalars['String']['output']>;
  /** When the entity was last updated or created in Chromatic. */
  updatedAt: Scalars['DateTime']['output'];
};

/** An error indicating quarantine is not enabled for the this Account. */
export type QuarantineFeatureUnavailableError = MutationError & {
  __typename?: 'QuarantineFeatureUnavailableError';
  /** A human-readable message describing the error. */
  message: Scalars['String']['output'];
};

/** A quarantine applied to a Story's mode. */
export type QuarantinedStory = Node & {
  __typename?: 'QuarantinedStory';
  /** The globally unique GraphQL node identifier. */
  id: Scalars['ID']['output'];
  /** The most recent Test to which this quarantine was applied. */
  latestTest: Test;
  /** The mode this quarantine applies to. */
  modeName: Scalars['String']['output'];
  /** When this Story/mode was quarantined. */
  quarantinedAt: Scalars['DateTime']['output'];
  /** The User who quarantined this Story/mode. */
  quarantinedBy?: Maybe<User>;
  /** The quarantined Story. `storybookUrl` and `captureImage` resolve to null here, since there's no Build in scope. */
  story: Story;
};

/** Connection to a list of QuarantinedStory. */
export type QuarantinedStoryConnection = {
  __typename?: 'QuarantinedStoryConnection';
  /** List of edges for QuarantinedStoryConnection. */
  edges: Array<QuarantinedStoryEdge>;
  /** List of nodes for QuarantinedStoryConnection. */
  nodes: Array<QuarantinedStory>;
  /** Pagination details for QuarantinedStoryConnection. */
  pageInfo: PageInfo;
  /** Total number of items for QuarantinedStoryConnection. */
  totalCount: Scalars['Int']['output'];
};

/** The edge type for QuarantinedStory. */
export type QuarantinedStoryEdge = {
  __typename?: 'QuarantinedStoryEdge';
  /** Cursor to this item. */
  cursor: Scalars['String']['output'];
  /** The item at the edge. */
  node: QuarantinedStory;
};

export type Query = {
  __typename?: 'Query';
  /** Look up an Account by ID. */
  account?: Maybe<Account>;
  /** Look up a Build by ID. */
  build?: Maybe<Build>;
  bulkFigmaMetadata?: Maybe<Array<Maybe<FigmaMetadata>>>;
  figmaMetadata?: Maybe<FigmaMetadata>;
  figmaMetadataById?: Maybe<FigmaMetadata>;
  /** Look up a Project by ID. */
  project?: Maybe<Project>;
  /** Look up a published Storybook by URL. */
  storybook?: Maybe<Storybook>;
  /** The currently authenticated user. */
  viewer?: Maybe<User>;
};


export type QueryAccountArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBuildArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBulkFigmaMetadataArgs = {
  keys: Array<Scalars['String']['input']>;
};


export type QueryFigmaMetadataArgs = {
  key?: InputMaybe<Scalars['String']['input']>;
};


export type QueryFigmaMetadataByIdArgs = {
  id: Scalars['ObjID']['input'];
};


export type QueryProjectArgs = {
  id: Scalars['ID']['input'];
};


export type QueryStorybookArgs = {
  url: Scalars['URL']['input'];
};

/** The repository could not be found or is not accessible to the Account. */
export type RepositoryNotAccessibleError = MutationError & {
  __typename?: 'RepositoryNotAccessibleError';
  /** A human-readable message describing the error. */
  message: Scalars['String']['output'];
};

/** The repository belongs to a different Account than the one given. Create the Project in the Account that owns the repository. */
export type RepositoryOwnerMismatchError = MutationError & {
  __typename?: 'RepositoryOwnerMismatchError';
  /** A human-readable message describing the error. */
  message: Scalars['String']['output'];
};

/** The Account is a git organization, whose Projects must be linked to a repository. Provide a repository. */
export type RepositoryRequiredError = MutationError & {
  __typename?: 'RepositoryRequiredError';
  /** A human-readable message describing the error. */
  message: Scalars['String']['output'];
};

/** The scope of tests to update when reviewing a test. */
export enum ReviewTestBatch {
  /** Apply the review to all tests in the build. */
  Build = 'BUILD',
  /** Apply the review to all tests for the same component in the build. */
  Component = 'COMPONENT',
  /** Apply the review only to the specific story being reviewed. */
  Spec = 'SPEC'
}

/** A user error that prevented the test from being reviewed. */
export type ReviewTestError = BuildSupersededError | TestNotFoundError | TestUnreviewableError;

/** Input for reviewing a Test. */
export type ReviewTestInput = {
  /** Apply review to all tests for the same story, component, or the whole build. Tests that are already IGNORED are excluded from batch review. */
  batch?: InputMaybe<ReviewTestBatch>;
  /** The new status of the test. */
  status: ReviewTestInputStatus;
  /** The ID of the test to review. */
  testId: Scalars['ID']['input'];
};

/** The new status to apply when reviewing a Test. */
export enum ReviewTestInputStatus {
  /** Accept the changes on the test. */
  Accepted = 'ACCEPTED',
  /** Deny the changes on the test. */
  Denied = 'DENIED',
  /** Ignore the test, so it does not block build acceptance. */
  Ignored = 'IGNORED',
  /** Reset the test back to unreviewed. */
  Pending = 'PENDING'
}

/** The payload returned when reviewing a Test. */
export type ReviewTestPayload = {
  __typename?: 'ReviewTestPayload';
  /** The test(s) that were updated, if successful. */
  updatedTests?: Maybe<Array<Test>>;
  /** User errors preventing the test from being reviewed. Empty if successful. */
  userErrors: Array<ReviewTestError>;
};

/** The status of a shared Storybook upload. */
export enum ShareStatus {
  /** The upload was cancelled. */
  Cancelled = 'cancelled',
  /** The upload completed successfully. */
  Complete = 'complete',
  /** The upload encountered an error. */
  Error = 'error'
}

/** The payload returned when initiating a Storybook share upload. */
export type ShareUploadPayload = {
  __typename?: 'ShareUploadPayload';
  /** The ID of the share being created. */
  shareId: Scalars['ID']['output'];
  /** The URL where the shared Storybook will be accessible. */
  shareUrl: Scalars['String']['output'];
  /** The upload target for sending the Storybook files. */
  target: ShareUploadTarget;
};

/** The S3 presigned upload target for a Storybook share. */
export type ShareUploadTarget = {
  __typename?: 'ShareUploadTarget';
  /** The URL to POST the Storybook files to. */
  formAction: Scalars['String']['output'];
  /** The form fields to include in the upload POST request. */
  formFields: Scalars['JSONObject']['output'];
  /** The S3 key prefix for the uploaded files. */
  keyPrefix: Scalars['String']['output'];
};

/** A build that has started but not completed testing. */
export type StartedBuild = Build & Node & Temporal & {
  __typename?: 'StartedBuild';
  /** Git branch name, possibly prefixed with the owner name (in case of a forked repository). */
  branch: Scalars['String']['output'];
  /** Set of browsers against which the build was executed. */
  browsers: Array<BrowserInfo>;
  /** Git commit hash (unshortened). */
  commit: Scalars['String']['output'];
  /** Link to the commit details at the Git provider linked to the project. */
  commitUrl?: Maybe<Scalars['String']['output']>;
  /** When the commit was created in Git. */
  committedAt: Scalars['DateTime']['output'];
  /** The number of components in the published Storybook, excluding docsOnly components. */
  componentCount: Scalars['Int']['output'];
  /** When the entity was first created in Chromatic. */
  createdAt: Scalars['DateTime']['output'];
  /** The discussion threads left on this build, oldest first. */
  discussions?: Maybe<StartedBuildCommentThreadConnection>;
  /** The number of docsOnly stories in the published Storybook. */
  docsCount: Scalars['Int']['output'];
  /** The error that caused this build to fail. */
  error?: Maybe<BuildError>;
  /** The globally unique GraphQL node identifier. */
  id: Scalars['ID']['output'];
  /** Whether the build is limited to representative stories because the account has exceeded its included snapshot quota. When limited, only one story per component is captured. */
  isLimited: Scalars['Boolean']['output'];
  /** Whether there is a newer build on the same branch, and therefore this build can no longer be reviewed. */
  isSuperseded: Scalars['Boolean']['output'];
  /** Link to the published Storybook's canvas (iframe.html). */
  isolatorUrl: Scalars['URL']['output'];
  /** Incremental build number. Infrastructure upgrade builds have the same number as the original build. */
  number: Scalars['Int']['output'];
  /** Git parent commit hashes used to find the ancestor build(s) for comparison. */
  parentCommits: Array<Scalars['String']['output']>;
  /** When the build was prepared for testing on Chromatic. */
  preparedAt: Scalars['DateTime']['output'];
  /** When the Storybook was published on Chromatic. */
  publishedAt: Scalars['DateTime']['output'];
  /** URL-safe Git repository identifier, consisting of the owner (organization or user) name and the repository name, separated by a slash (/). This is typically part of the Git repository URL. The value originates from the CLI runtime environment, not the linked Git provider / linked repository. */
  slug?: Maybe<Scalars['String']['output']>;
  /** The number of stories in the published Storybook, excluding docsOnly stories. */
  specCount: Scalars['Int']['output'];
  /** When the build was started in Chromatic. */
  startedAt: Scalars['DateTime']['output'];
  /** The current status of the build. Changes as the build progresses and as tests are reviewed. */
  status: BuildStatus;
  /** Link to the published Storybook. */
  storybookUrl: Scalars['URL']['output'];
  /** Count the number of tests in the build. All provided filter arguments must match (AND). */
  testCount: Scalars['Int']['output'];
  /** The tests in this build, optionally filtered by status or CSF story ID. */
  tests?: Maybe<StartedBuildTestConnection>;
  /** Hash of uncommitted changes, or empty string for no changes. */
  uncommittedHash?: Maybe<Scalars['String']['output']>;
  /** When the entity was last updated or created in Chromatic. */
  updatedAt: Scalars['DateTime']['output'];
  /** Link to the build details on Chromatic. */
  webUrl: Scalars['URL']['output'];
};


/** A build that has started but not completed testing. */
export type StartedBuildDiscussionsArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  before?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A build that has started but not completed testing. */
export type StartedBuildTestCountArgs = {
  results?: InputMaybe<Array<TestResult>>;
  reviewable?: InputMaybe<Scalars['Boolean']['input']>;
  statuses?: InputMaybe<Array<TestStatus>>;
};


/** A build that has started but not completed testing. */
export type StartedBuildTestsArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  before?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<StartedBuildTestsOrder>;
  statuses?: InputMaybe<Array<TestStatus>>;
  storyId?: InputMaybe<Scalars['String']['input']>;
};

/** Connection to a list of StartedBuildCommentThread. */
export type StartedBuildCommentThreadConnection = {
  __typename?: 'StartedBuildCommentThreadConnection';
  /** List of edges for StartedBuildCommentThreadConnection. */
  edges: Array<StartedBuildCommentThreadEdge>;
  /** List of nodes for StartedBuildCommentThreadConnection. */
  nodes: Array<CommentThread>;
  /** Pagination details for StartedBuildCommentThreadConnection. */
  pageInfo: PageInfo;
  /** Total number of items for StartedBuildCommentThreadConnection. */
  totalCount: Scalars['Int']['output'];
};

/** The edge type for StartedBuildCommentThread. */
export type StartedBuildCommentThreadEdge = {
  __typename?: 'StartedBuildCommentThreadEdge';
  /** Cursor to this item. */
  cursor: Scalars['String']['output'];
  /** The item at the edge. */
  node: CommentThread;
};

/** Connection to a list of StartedBuildTest. */
export type StartedBuildTestConnection = {
  __typename?: 'StartedBuildTestConnection';
  /** List of edges for StartedBuildTestConnection. */
  edges: Array<StartedBuildTestEdge>;
  /** List of nodes for StartedBuildTestConnection. */
  nodes: Array<Test>;
  /** Pagination details for StartedBuildTestConnection. */
  pageInfo: PageInfo;
  /** Total number of items for StartedBuildTestConnection. */
  totalCount: Scalars['Int']['output'];
};

/** The edge type for StartedBuildTest. */
export type StartedBuildTestEdge = {
  __typename?: 'StartedBuildTestEdge';
  /** Cursor to this item. */
  cursor: Scalars['String']['output'];
  /** The item at the edge. */
  node: Test;
};

/** Ordering options for the connection. */
export type StartedBuildTestsOrder = {
  /** The sort direction. */
  direction: OrderDirection;
  /** The field to sort by. */
  field: StartedBuildTestsOrderField;
};

/** The field to sort by. */
export enum StartedBuildTestsOrderField {
  /** Sort by creation date. */
  CreatedAt = 'createdAt',
  /** Sort by result priority, with stories needing attention first (errors, then new, then changed, then removed). */
  ResultOrder = 'resultOrder',
  /** Sort by story order in the Storybook. */
  StoryOrder = 'storyOrder',
  /** Sort by last update date. */
  UpdatedAt = 'updatedAt'
}

/** Ordering options for the connection. */
export type StoriesOrder = {
  /** The sort direction. */
  direction: OrderDirection;
  /** The field to sort by. */
  field: StoriesOrderField;
};

/** The field to sort by. */
export enum StoriesOrderField {
  /** Sort by creation date. */
  CreatedAt = 'createdAt',
  /** Sort by last update date. */
  UpdatedAt = 'updatedAt'
}

/** A Story in a Chromatic build. */
export type Story = Node & Temporal & {
  __typename?: 'Story';
  /** Image and snapshot display metadata for this story, if captured. */
  captureImage?: Maybe<CaptureImage>;
  /** Component that contains the story. */
  component?: Maybe<Component>;
  /** When the entity was first created in Chromatic. */
  createdAt: Scalars['DateTime']['output'];
  /** A project-unique story identifier. Differs from `storyId` when two stories in different files share the same ID. */
  csfId?: Maybe<Scalars['String']['output']>;
  /** The globally unique GraphQL node identifier. */
  id: Scalars['ID']['output'];
  /** Story name as displayed in Storybook. */
  name: Scalars['String']['output'];
  /** The story ID as generated by Storybook (e.g. `button--primary`). */
  storyId: Scalars['String']['output'];
  /** Permalink to the story in the published Storybook. */
  storybookUrl?: Maybe<Scalars['URL']['output']>;
  /** When the entity was last updated or created in Chromatic. */
  updatedAt: Scalars['DateTime']['output'];
};


/** A Story in a Chromatic build. */
export type StoryCaptureImageArgs = {
  signed?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Connection to a list of Story. */
export type StoryConnection = {
  __typename?: 'StoryConnection';
  /** List of edges for StoryConnection. */
  edges: Array<StoryEdge>;
  /** List of nodes for StoryConnection. */
  nodes: Array<Story>;
  /** Pagination details for StoryConnection. */
  pageInfo: PageInfo;
  /** Total number of items for StoryConnection. */
  totalCount: Scalars['Int']['output'];
};

/** The edge type for Story. */
export type StoryEdge = {
  __typename?: 'StoryEdge';
  /** Cursor to this item. */
  cursor: Scalars['String']['output'];
  /** The item at the edge. */
  node: Story;
};

/** A published Storybook hosted on Chromatic. */
export type Storybook = {
  __typename?: 'Storybook';
  /** Link to the build on Chromatic. */
  buildUrl: Scalars['URL']['output'];
  /** List of components in the published Storybook. */
  components: ComponentConnection;
  /** Permalink to the published Storybook. */
  storybookUrl: Scalars['URL']['output'];
};


/** A published Storybook hosted on Chromatic. */
export type StorybookComponentsArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  before?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ComponentsOrder>;
};

/** Entity which tracks creation and update date/time. */
export type Temporal = {
  /** When the entity was first created in Chromatic. */
  createdAt: Scalars['DateTime']['output'];
  /** When the entity was last updated or created in Chromatic. */
  updatedAt: Scalars['DateTime']['output'];
};

/** A set of captures for a story at a specific viewport, compared against the baseline. */
export type Test = Node & Temporal & {
  __typename?: 'Test';
  /** The accessibility comparisons for this Test, one for each tested platform. */
  accessibilityComparisons: Array<AccessibilityComparison>;
  /** The previously accepted Test used as the reference for comparison. */
  baseline?: Maybe<Test>;
  /**
   * List of snapshot comparisons for this test, one for each tested browser.
   * @deprecated Use `visualComparisons` and `accessibilityComparisons` instead, which expose comparison-specific data.
   */
  comparisons: Array<TestComparison>;
  /** When the entity was first created in Chromatic. */
  createdAt: Scalars['DateTime']['output'];
  /** The globally unique GraphQL node identifier. */
  id: Scalars['ID']['output'];
  /** The reason the Test was ignored, if the status is or was ever IGNORED */
  ignoreReason?: Maybe<TestIgnoreReason>;
  /** Whether this story rendered inconsistently across multiple capture attempts, indicating a flaky or non-deterministic story. */
  isUnstable: Scalars['Boolean']['output'];
  /** What test kinds is this test associated with. */
  kinds: Array<TestKind>;
  /** The mode applied to this test. If this test was not using Modes, the viewport is set as the mode name (e.g. "[viewport]px"). */
  mode: TestMode;
  /** Capture configuration for this test, either set via `parameters.chromatic` on the story or inferred from context (e.g. viewport from the story's mode). */
  parameters: TestParameters;
  /** Final (immutable) summary of the results of the comparisons on this test. Only available once the test has completed. */
  result?: Maybe<TestResult>;
  /** The current review state of the test. */
  status: TestStatus;
  /** Reference to the story for this test in the published Storybook for this build. */
  story?: Maybe<Story>;
  /** When the entity was last updated or created in Chromatic. */
  updatedAt: Scalars['DateTime']['output'];
  /** The visual comparisons for this Test, one for each tested platform. */
  visualComparisons: Array<VisualComparison>;
  /** Link to the test details on Chromatic. */
  webUrl: Scalars['URL']['output'];
};

/** A comparison between a story capture and its baseline, for a specific platform and viewport. */
export type TestComparison = Node & {
  __typename?: 'TestComparison';
  /** The capture from the baseline test used for comparison. */
  baseCapture?: Maybe<Capture>;
  /** The browser used for this comparison. */
  browser: BrowserInfo;
  /** The diff between the baseCapture and headCapture. Available once the diff has completed. */
  captureDiff?: Maybe<CaptureDiff>;
  /** The capture of the test this comparison belongs to. Available once the capture is complete. */
  headCapture?: Maybe<Capture>;
  /** The globally unique GraphQL node identifier. */
  id: Scalars['ID']['output'];
  /** The result of comparing this test's capture against the baseline. Only available once the test has completed. */
  result?: Maybe<ComparisonResult>;
  /** The viewport used for this comparison. */
  viewport: ViewportInfo;
};

/** The reason a Test was ignored. */
export enum TestIgnoreReason {
  /** The test was manually ignored. */
  Manual = 'MANUAL',
  /** The test was ignored because its story is quarantined. */
  Quarantine = 'QUARANTINE',
  /** The test was auto-ignored because it was flagged as unstable. */
  Unstable = 'UNSTABLE'
}

/** The kind of tests in a Build. */
export enum TestKind {
  /** At least one comparison contains an accessibility test. */
  Accessibility = 'ACCESSIBILITY',
  /** At least one comparison contains an interaction test. */
  Interaction = 'INTERACTION',
  /** At least one comparison contains a visual test. */
  Visual = 'VISUAL'
}

/** A rendering mode for a Story, defined by a combination of Storybook globals. */
export type TestMode = {
  __typename?: 'TestMode';
  /** A map of Storybook globals with chosen values that defines how to render a story (e.g. `{ "lang": "es", "theme": "dark", "viewport": 320 }`) */
  globals: Scalars['JSONObject']['output'];
  /** The name of the mode (e.g. "Spanish Dark Mobile") */
  name: Scalars['String']['output'];
};

/** An error indicating the Test was not found. */
export type TestNotFoundError = MutationError & UserError & {
  __typename?: 'TestNotFoundError';
  /** A description of why the Test was not found. */
  message: Scalars['String']['output'];
};

/** Capture parameters applied to a Test. */
export type TestParameters = {
  __typename?: 'TestParameters';
  /** Set the `color-scheme` used when capturing the story. */
  colorScheme?: Maybe<ColorScheme>;
  /** Crop snapshots to the viewport. */
  cropToViewport?: Maybe<Scalars['Boolean']['output']>;
  /** Delay in milliseconds before taking the snapshot. */
  delay?: Maybe<Scalars['Int']['output']>;
  /** If true, disables detecting and ignoring anti-aliased pixels. */
  diffIncludeAntiAliasing?: Maybe<Scalars['Boolean']['output']>;
  /** Threshold before a snapshot is considered visually different (0-1). */
  diffThreshold?: Maybe<Scalars['Float']['output']>;
  /** This test applies to a docs page. */
  docsOnly?: Maybe<Scalars['Boolean']['output']>;
  /** Set the `forced-colors` media feature when capturing the story. */
  forcedColors?: Maybe<Scalars['String']['output']>;
  /** CSS selectors to ignore while diffing. */
  ignoreSelectors?: Maybe<Array<Scalars['String']['output']>>;
  /** Set the media used when capturing the story. */
  media?: Maybe<Scalars['String']['output']>;
  /** Reverse CSS animations so snapshots show the end state. */
  pauseAnimationAtEnd?: Maybe<Scalars['Boolean']['output']>;
  /** Set the `prefers-reduced-motion` media feature when capturing the story. */
  prefersReducedMotion?: Maybe<Scalars['String']['output']>;
  /** Whether this test is used as the representative thumbnail for its component on a publish only build. */
  representativeOnly?: Maybe<Scalars['Boolean']['output']>;
  /** Viewport information. */
  viewport: ViewportInfo;
};

/** An error that prevented the Test from being quarantined. */
export type TestQuarantineError = QuarantineFeatureUnavailableError | TestNotFoundError | TestUnsupportedStatusError | UnknownMutationError;

/** The Test was not quarantined. */
export type TestQuarantineFailure = {
  __typename?: 'TestQuarantineFailure';
  /** The errors that prevented the Test's Story/mode from being quarantined. Always non-empty. */
  errors: Array<TestQuarantineError>;
};

/** Input for quarantining a Test. */
export type TestQuarantineInput = {
  /** The ID of the Test whose Story/mode should be quarantined. */
  testId: Scalars['ID']['input'];
};

/** The result of quarantining a Test. */
export type TestQuarantineResponse = TestQuarantineFailure | TestQuarantineSuccess;

/** The Test was quarantined. */
export type TestQuarantineSuccess = {
  __typename?: 'TestQuarantineSuccess';
  /** The now-quarantined Story/mode. */
  quarantinedStory: QuarantinedStory;
  /** The Test that was quarantined. Its status is now `IGNORED`. */
  test: Test;
};

/** The result of a Test comparison. */
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
  SystemError = 'SYSTEM_ERROR',
  /** The test was flagged as unstable (flaky) and auto-ignored; it does not block build acceptance. */
  Unstable = 'UNSTABLE'
}

/** The review status of a Test. */
export enum TestStatus {
  /** The comparison succeeded and the changes have been accepted. */
  Accepted = 'ACCEPTED',
  /** Encountered a Storybook runtime error while testing. */
  Broken = 'BROKEN',
  /** The comparison succeeded and the changes have been denied. */
  Denied = 'DENIED',
  /** The test could not complete due to a Chromatic infrastructure error. */
  Failed = 'FAILED',
  /** The test was ignored and has not been accepted or denied, but does not block build pass. */
  Ignored = 'IGNORED',
  /** The test is still running and results are not yet available. */
  InProgress = 'IN_PROGRESS',
  /** All comparisons were visually equal. */
  Passed = 'PASSED',
  /** The comparison succeeded with unconfirmed changes. */
  Pending = 'PENDING',
  /**
   * The test was flagged as unstable (flaky) and auto-ignored; it does not block build acceptance.
   * @deprecated Use IGNORED instead
   */
  Unstable = 'UNSTABLE'
}

/** An error that prevented the Test's Story/mode from being removed from quarantine. */
export type TestUnquarantineError = QuarantineFeatureUnavailableError | TestNotFoundError | UnknownMutationError;

/** The Test's Story/mode was not removed from quarantine. */
export type TestUnquarantineFailure = {
  __typename?: 'TestUnquarantineFailure';
  /** The errors that prevented the Test's Story/mode from being removed from quarantine. Always non-empty. */
  errors: Array<TestUnquarantineError>;
};

/** Input for removing a Test's Story/mode from quarantine. */
export type TestUnquarantineInput = {
  /** The ID of the Test whose Story/mode should be removed from quarantine. */
  testId: Scalars['ID']['input'];
};

/** The result of removing a Test's Story/mode from quarantine. */
export type TestUnquarantineResponse = TestUnquarantineFailure | TestUnquarantineSuccess;

/** The Test's Story/mode was removed from quarantine. */
export type TestUnquarantineSuccess = {
  __typename?: 'TestUnquarantineSuccess';
  /** The Test identified by the input `testId`, with its status reset to `PENDING` if it was `IGNORED` as a result of quarantine (unless it was already `IGNORED` for another reason, such as being auto-ignored as unstable). */
  test: Test;
};

/** An error indicating the Test is not in a reviewable state. */
export type TestUnreviewableError = UserError & {
  __typename?: 'TestUnreviewableError';
  /** A description of why the test could not be reviewed. */
  message: Scalars['String']['output'];
  /** The test being reviewed. */
  test: Test;
};

/** An error indicating the Test is not in a status that supports quarantining. */
export type TestUnsupportedStatusError = MutationError & {
  __typename?: 'TestUnsupportedStatusError';
  /** A human-readable message describing the error. */
  message: Scalars['String']['output'];
  /** The Test whose status prevents it from being quarantined (e.g. BROKEN or FAILED). */
  test: Test;
};

/** An error that does not match any of the mutation's known error types. Read `message` for details. */
export type UnknownMutationError = MutationError & {
  __typename?: 'UnknownMutationError';
  /** A human-readable message describing the error. */
  message: Scalars['String']['output'];
};

/** The payload returned when updating user preferences. */
export type UpdateUserPreferencesPayload = {
  __typename?: 'UpdateUserPreferencesPayload';
  /** The updated preferences, if successful. */
  updatedPreferences?: Maybe<UserPreferences>;
};

/** A Chromatic user. */
export type User = Node & {
  __typename?: 'User';
  /** Accounts the user has access to. */
  accounts: Array<Account>;
  /** URL of the user's avatar image. */
  avatarUrl?: Maybe<Scalars['URL']['output']>;
  /** When the entity was first created in Chromatic. */
  createdAt: Scalars['DateTime']['output'];
  /** The globally unique GraphQL node identifier. */
  id: Scalars['ID']['output'];
  /** The display name of the user. */
  name: Scalars['String']['output'];
  /** User-specific preferences and settings. */
  preferences: UserPreferences;
  /** The number of projects this user is a member of. */
  projectCount: Scalars['Int']['output'];
  /** The membership details for this user on a specific project, if they are a member. */
  projectMembership?: Maybe<ProjectMembership>;
  /** When the entity was last updated or created in Chromatic. */
  updatedAt: Scalars['DateTime']['output'];
  /** The login username of the user. */
  username: Scalars['String']['output'];
};


/** A Chromatic user. */
export type UserProjectMembershipArgs = {
  projectId: Scalars['ID']['input'];
};

/** An error caused by user input or invalid state. */
export type UserError = {
  /** A message describing the error. */
  message: Scalars['String']['output'];
};

/** User-specific preferences and settings. */
export type UserPreferences = {
  __typename?: 'UserPreferences';
  /** The user's progress through the Visual Test Addon onboarding flow. */
  vtaOnboarding: VtaOnboardingPreference;
};

/** Input for updating user preferences. */
export type UserPreferencesInput = {
  /** The user's progress through the Visual Test Addon onboarding flow. */
  vtaOnboarding?: InputMaybe<VtaOnboardingPreference>;
};

/** A user's progress through the Visual Test Addon onboarding flow. */
export enum VtaOnboardingPreference {
  /** The user has completed the onboarding. */
  Completed = 'COMPLETED',
  /** The user has dismissed the onboarding. */
  Dismissed = 'DISMISSED',
  /** The user has not yet interacted with the onboarding. */
  Unset = 'UNSET'
}

/** Metadata about the viewport used for a capture. */
export type ViewportInfo = {
  __typename?: 'ViewportInfo';
  /** Identifier for this viewport. */
  id: Scalars['ID']['output'];
  /** Whether this is the default viewport. */
  isDefault: Scalars['Boolean']['output'];
  /** Viewport display name. */
  name: Scalars['String']['output'];
  /** Viewport width in pixels. */
  width: Scalars['Int']['output'];
};

/** A visual comparison between a story capture and its baseline, for a specific platform and viewport. */
export type VisualComparison = Node & {
  __typename?: 'VisualComparison';
  /** The capture from the baseline test used for comparison. */
  baseCapture?: Maybe<Capture>;
  /** The diff between the baseCapture and headCapture. Available once the diff has completed. */
  diff?: Maybe<VisualDiff>;
  /** The capture of the test this comparison belongs to. Available once the capture is complete. */
  headCapture?: Maybe<Capture>;
  /** The globally unique GraphQL node identifier. */
  id: Scalars['ID']['output'];
  /** The platform used for this comparison. */
  platform: BrowserInfo;
  /** The result of comparing this test's capture against the baseline. Only available once the test has completed. */
  result?: Maybe<ComparisonResult>;
  /** The viewport used for this comparison. */
  viewport: ViewportInfo;
};

/** A visual diff between two captures. */
export type VisualDiff = {
  __typename?: 'VisualDiff';
  /** The diff overlay image. Available if there are visual changes. */
  diffImage?: Maybe<CaptureOverlayImage>;
  /** The focus overlay image. Available if there are visual changes. */
  focusImage?: Maybe<CaptureOverlayImage>;
  /** The ID of the diff. */
  id: Scalars['ID']['output'];
  /** The result of comparing the baseCapture and headCapture. */
  result: CaptureDiffResult;
};


/** A visual diff between two captures. */
export type VisualDiffDiffImageArgs = {
  signed?: InputMaybe<Scalars['Boolean']['input']>;
};


/** A visual diff between two captures. */
export type VisualDiffFocusImageArgs = {
  signed?: InputMaybe<Scalars['Boolean']['input']>;
};

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

export type StoryTestFieldsFragment = { __typename?: 'Test', id: string, status: TestStatus, result?: TestResult | null, ignoreReason?: TestIgnoreReason | null, isUnstable: boolean, webUrl: any, comparisons: Array<{ __typename?: 'TestComparison', id: string, result?: ComparisonResult | null, browser: { __typename?: 'BrowserInfo', id: string, key: Browser, name: string, version: string }, captureDiff?: { __typename?: 'CaptureDiff', diffImage?: { __typename?: 'CaptureOverlayImage', imageUrl: any, imageWidth: number } | null, focusImage?: { __typename?: 'CaptureOverlayImage', imageUrl: any, imageWidth: number } | null } | null, headCapture?: { __typename?: 'Capture', deviceScaleFactor?: number | null, captureImage?: { __typename?: 'CaptureImage', backgroundColor?: string | null, imageUrl: any, imageWidth: number, imageHeight: number, thumbnailUrl: any } | null, captureError?: { __typename?: 'CaptureErrorBrowserDimensionLimit', kind: CaptureErrorKind } | { __typename?: 'CaptureErrorComponentOffPage', kind: CaptureErrorKind } | { __typename?: 'CaptureErrorFailedJS', error: any, kind: CaptureErrorKind } | { __typename?: 'CaptureErrorImageTooLarge', kind: CaptureErrorKind } | { __typename?: 'CaptureErrorInteractionFailure', error: any, kind: CaptureErrorKind } | { __typename?: 'CaptureErrorInteractionTestTimeout', kind: CaptureErrorKind } | { __typename?: 'CaptureErrorJSError', error: any, kind: CaptureErrorKind } | { __typename?: 'CaptureErrorNavigationTimeout', kind: CaptureErrorKind } | { __typename?: 'CaptureErrorNoJS', kind: CaptureErrorKind } | { __typename?: 'CaptureErrorPageEvaluateTimeout', kind: CaptureErrorKind } | { __typename?: 'CaptureErrorRenderTimeout', kind: CaptureErrorKind } | { __typename?: 'CaptureErrorScreenshotTimeout', kind: CaptureErrorKind } | { __typename?: 'CaptureErrorStoryMissing', kind: CaptureErrorKind } | { __typename?: 'CaptureErrorTimeoutType', kind: CaptureErrorKind } | null } | null, baseCapture?: { __typename?: 'Capture', deviceScaleFactor?: number | null, captureImage?: { __typename?: 'CaptureImage', imageUrl: any, imageWidth: number, imageHeight: number } | null } | null }>, mode: { __typename?: 'TestMode', name: string, globals: any }, story?: { __typename?: 'Story', storyId: string, name: string, component?: { __typename?: 'Component', name: string } | null } | null } & { ' $fragmentName'?: 'StoryTestFieldsFragment' };

export type UnquarantineTestMutationVariables = Exact<{
  input: TestUnquarantineInput;
}>;


export type UnquarantineTestMutation = { __typename?: 'Mutation', testUnquarantine: { __typename: 'TestUnquarantineFailure', errors: Array<{ __typename: 'QuarantineFeatureUnavailableError', message: string } | { __typename: 'TestNotFoundError', message: string } | { __typename: 'UnknownMutationError', message: string }> } | { __typename: 'TestUnquarantineSuccess', test: { __typename?: 'Test', id: string, status: TestStatus, ignoreReason?: TestIgnoreReason | null } } };

export type ReviewTestMutationVariables = Exact<{
  input: ReviewTestInput;
}>;


export type ReviewTestMutation = { __typename?: 'Mutation', reviewTest?: { __typename?: 'ReviewTestPayload', updatedTests?: Array<{ __typename?: 'Test', id: string, status: TestStatus }> | null, userErrors: Array<{ __typename: 'BuildSupersededError', message: string, build: { __typename?: 'AnnouncedBuild', id: string } | { __typename?: 'CompletedBuild', id: string } | { __typename?: 'PreparedBuild', id: string } | { __typename?: 'PublishedBuild', id: string } | { __typename?: 'StartedBuild', id: string } } | { __typename: 'TestNotFoundError', message: string } | { __typename: 'TestUnreviewableError', message: string, test: { __typename?: 'Test', id: string } }> } | null };

export const StatusTestFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StatusTestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Test"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"result"}},{"kind":"Field","name":{"kind":"Name","value":"story"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storyId"}}]}}]}}]} as unknown as DocumentNode<StatusTestFieldsFragment, unknown>;
export const LastBuildOnBranchTestFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LastBuildOnBranchTestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Test"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"result"}}]}}]} as unknown as DocumentNode<LastBuildOnBranchTestFieldsFragment, unknown>;
export const LastBuildOnBranchBuildFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LastBuildOnBranchBuildFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Build"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"committedAt"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StartedBuild"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"testsForStatus"},"name":{"kind":"Name","value":"tests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1000"}},{"kind":"Argument","name":{"kind":"Name","value":"statuses"},"value":{"kind":"Variable","name":{"kind":"Name","value":"testStatuses"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StatusTestFields"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"testsForStory"},"name":{"kind":"Name","value":"tests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storyId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storyId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LastBuildOnBranchTestFields"}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CompletedBuild"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"result"}},{"kind":"Field","alias":{"kind":"Name","value":"testsForStatus"},"name":{"kind":"Name","value":"tests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1000"}},{"kind":"Argument","name":{"kind":"Name","value":"statuses"},"value":{"kind":"Variable","name":{"kind":"Name","value":"testStatuses"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StatusTestFields"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"testsForStory"},"name":{"kind":"Name","value":"tests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storyId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storyId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LastBuildOnBranchTestFields"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StatusTestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Test"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"result"}},{"kind":"Field","name":{"kind":"Name","value":"story"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storyId"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LastBuildOnBranchTestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Test"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"result"}}]}}]} as unknown as DocumentNode<LastBuildOnBranchBuildFieldsFragment, unknown>;
export const StoryTestFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StoryTestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Test"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"result"}},{"kind":"Field","name":{"kind":"Name","value":"ignoreReason"}},{"kind":"Field","name":{"kind":"Name","value":"isUnstable"}},{"kind":"Field","name":{"kind":"Name","value":"webUrl"}},{"kind":"Field","name":{"kind":"Name","value":"comparisons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"result"}},{"kind":"Field","name":{"kind":"Name","value":"browser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}},{"kind":"Field","name":{"kind":"Name","value":"captureDiff"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"diffImage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"signed"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"imageWidth"}}]}},{"kind":"Field","name":{"kind":"Name","value":"focusImage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"signed"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"imageWidth"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"headCapture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deviceScaleFactor"}},{"kind":"Field","name":{"kind":"Name","value":"captureImage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"signed"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"backgroundColor"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"imageWidth"}},{"kind":"Field","name":{"kind":"Name","value":"imageHeight"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"captureError"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CaptureErrorInteractionFailure"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"error"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CaptureErrorJSError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"error"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CaptureErrorFailedJS"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"baseCapture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deviceScaleFactor"}},{"kind":"Field","name":{"kind":"Name","value":"captureImage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"signed"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"imageWidth"}},{"kind":"Field","name":{"kind":"Name","value":"imageHeight"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"mode"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"globals"}}]}},{"kind":"Field","name":{"kind":"Name","value":"story"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storyId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"component"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<StoryTestFieldsFragment, unknown>;
export const SelectedBuildFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SelectedBuildFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Build"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"branch"}},{"kind":"Field","name":{"kind":"Name","value":"commit"}},{"kind":"Field","name":{"kind":"Name","value":"committedAt"}},{"kind":"Field","name":{"kind":"Name","value":"uncommittedHash"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StartedBuild"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","alias":{"kind":"Name","value":"testsForStory"},"name":{"kind":"Name","value":"tests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storyId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storyId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StoryTestFields"}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CompletedBuild"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","alias":{"kind":"Name","value":"testsForStory"},"name":{"kind":"Name","value":"tests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storyId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storyId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StoryTestFields"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StoryTestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Test"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"result"}},{"kind":"Field","name":{"kind":"Name","value":"ignoreReason"}},{"kind":"Field","name":{"kind":"Name","value":"isUnstable"}},{"kind":"Field","name":{"kind":"Name","value":"webUrl"}},{"kind":"Field","name":{"kind":"Name","value":"comparisons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"result"}},{"kind":"Field","name":{"kind":"Name","value":"browser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}},{"kind":"Field","name":{"kind":"Name","value":"captureDiff"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"diffImage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"signed"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"imageWidth"}}]}},{"kind":"Field","name":{"kind":"Name","value":"focusImage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"signed"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"imageWidth"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"headCapture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deviceScaleFactor"}},{"kind":"Field","name":{"kind":"Name","value":"captureImage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"signed"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"backgroundColor"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"imageWidth"}},{"kind":"Field","name":{"kind":"Name","value":"imageHeight"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"captureError"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CaptureErrorInteractionFailure"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"error"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CaptureErrorJSError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"error"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CaptureErrorFailedJS"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"baseCapture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deviceScaleFactor"}},{"kind":"Field","name":{"kind":"Name","value":"captureImage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"signed"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"imageWidth"}},{"kind":"Field","name":{"kind":"Name","value":"imageHeight"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"mode"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"globals"}}]}},{"kind":"Field","name":{"kind":"Name","value":"story"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storyId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"component"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<SelectedBuildFieldsFragment, unknown>;
export const VisualTestsProjectCountQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"VisualTestsProjectCountQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"viewer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectCount"}},{"kind":"Field","name":{"kind":"Name","value":"accounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"newProjectUrl"}}]}}]}}]}}]} as unknown as DocumentNode<VisualTestsProjectCountQueryQuery, VisualTestsProjectCountQueryQueryVariables>;
export const SelectProjectsQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SelectProjectsQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"viewer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"newProjectUrl"}},{"kind":"Field","name":{"kind":"Name","value":"projects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"webUrl"}},{"kind":"Field","name":{"kind":"Name","value":"lastBuild"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"branch"}},{"kind":"Field","name":{"kind":"Name","value":"number"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<SelectProjectsQueryQuery, SelectProjectsQueryQueryVariables>;
export const ProjectQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProjectQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"project"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"webUrl"}},{"kind":"Field","name":{"kind":"Name","value":"lastBuild"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"branch"}},{"kind":"Field","name":{"kind":"Name","value":"number"}}]}}]}}]}}]} as unknown as DocumentNode<ProjectQueryQuery, ProjectQueryQueryVariables>;
export const UpdateUserPreferencesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUserPreferences"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UserPreferencesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUserPreferences"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatedPreferences"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"vtaOnboarding"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateUserPreferencesMutation, UpdateUserPreferencesMutationVariables>;
export const AddonVisualTestsBuildDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AddonVisualTestsBuild"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"branch"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"gitUserEmailHash"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"repositoryOwnerName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storyId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"testStatuses"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TestStatus"}}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"selectedBuildId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"hasSelectedBuildId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"project"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"manageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"account"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"billingUrl"}},{"kind":"Field","name":{"kind":"Name","value":"suspensionReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"features"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uiTests"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"lastBuildOnBranch"},"name":{"kind":"Name","value":"lastBuild"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"branches"},"value":{"kind":"ListValue","values":[{"kind":"Variable","name":{"kind":"Name","value":"branch"}}]}},{"kind":"Argument","name":{"kind":"Name","value":"repositoryOwnerName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"repositoryOwnerName"}}},{"kind":"Argument","name":{"kind":"Name","value":"localBuilds"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"localBuildEmailHash"},"value":{"kind":"Variable","name":{"kind":"Name","value":"gitUserEmailHash"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LastBuildOnBranchBuildFields"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SelectedBuildFields"},"directives":[{"kind":"Directive","name":{"kind":"Name","value":"skip"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hasSelectedBuildId"}}}]}]}]}},{"kind":"Field","name":{"kind":"Name","value":"lastBuild"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"branch"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"selectedBuild"},"name":{"kind":"Name","value":"build"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"selectedBuildId"}}}],"directives":[{"kind":"Directive","name":{"kind":"Name","value":"include"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"if"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hasSelectedBuildId"}}}]}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SelectedBuildFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"viewer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"preferences"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"vtaOnboarding"}}]}},{"kind":"Field","name":{"kind":"Name","value":"projectMembership"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"userCanReview"},"name":{"kind":"Name","value":"meetsAccessLevel"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"minimumAccessLevel"},"value":{"kind":"EnumValue","value":"REVIEWER"}}]}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StatusTestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Test"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"result"}},{"kind":"Field","name":{"kind":"Name","value":"story"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storyId"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LastBuildOnBranchTestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Test"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"result"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StoryTestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Test"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"result"}},{"kind":"Field","name":{"kind":"Name","value":"ignoreReason"}},{"kind":"Field","name":{"kind":"Name","value":"isUnstable"}},{"kind":"Field","name":{"kind":"Name","value":"webUrl"}},{"kind":"Field","name":{"kind":"Name","value":"comparisons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"result"}},{"kind":"Field","name":{"kind":"Name","value":"browser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}},{"kind":"Field","name":{"kind":"Name","value":"captureDiff"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"diffImage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"signed"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"imageWidth"}}]}},{"kind":"Field","name":{"kind":"Name","value":"focusImage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"signed"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"imageWidth"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"headCapture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deviceScaleFactor"}},{"kind":"Field","name":{"kind":"Name","value":"captureImage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"signed"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"backgroundColor"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"imageWidth"}},{"kind":"Field","name":{"kind":"Name","value":"imageHeight"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"captureError"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CaptureErrorInteractionFailure"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"error"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CaptureErrorJSError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"error"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CaptureErrorFailedJS"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"baseCapture"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deviceScaleFactor"}},{"kind":"Field","name":{"kind":"Name","value":"captureImage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"signed"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"imageWidth"}},{"kind":"Field","name":{"kind":"Name","value":"imageHeight"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"mode"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"globals"}}]}},{"kind":"Field","name":{"kind":"Name","value":"story"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storyId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"component"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LastBuildOnBranchBuildFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Build"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"committedAt"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StartedBuild"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"testsForStatus"},"name":{"kind":"Name","value":"tests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1000"}},{"kind":"Argument","name":{"kind":"Name","value":"statuses"},"value":{"kind":"Variable","name":{"kind":"Name","value":"testStatuses"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StatusTestFields"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"testsForStory"},"name":{"kind":"Name","value":"tests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storyId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storyId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LastBuildOnBranchTestFields"}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CompletedBuild"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"result"}},{"kind":"Field","alias":{"kind":"Name","value":"testsForStatus"},"name":{"kind":"Name","value":"tests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1000"}},{"kind":"Argument","name":{"kind":"Name","value":"statuses"},"value":{"kind":"Variable","name":{"kind":"Name","value":"testStatuses"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StatusTestFields"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"testsForStory"},"name":{"kind":"Name","value":"tests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storyId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storyId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LastBuildOnBranchTestFields"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SelectedBuildFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Build"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"branch"}},{"kind":"Field","name":{"kind":"Name","value":"commit"}},{"kind":"Field","name":{"kind":"Name","value":"committedAt"}},{"kind":"Field","name":{"kind":"Name","value":"uncommittedHash"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StartedBuild"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","alias":{"kind":"Name","value":"testsForStory"},"name":{"kind":"Name","value":"tests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storyId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storyId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StoryTestFields"}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CompletedBuild"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","alias":{"kind":"Name","value":"testsForStory"},"name":{"kind":"Name","value":"tests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storyId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storyId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StoryTestFields"}}]}}]}}]}}]}}]} as unknown as DocumentNode<AddonVisualTestsBuildQuery, AddonVisualTestsBuildQueryVariables>;
export const UnquarantineTestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UnquarantineTest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TestUnquarantineInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"testUnquarantine"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TestUnquarantineSuccess"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"test"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"ignoreReason"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TestUnquarantineFailure"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MutationError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<UnquarantineTestMutation, UnquarantineTestMutationVariables>;
export const ReviewTestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ReviewTest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ReviewTestInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reviewTest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatedTests"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"Field","name":{"kind":"Name","value":"userErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"UserError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BuildSupersededError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"build"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TestUnreviewableError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"test"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<ReviewTestMutation, ReviewTestMutationVariables>;