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

/** A build that has been pre-announced but not published yet. */
export type AnnouncedBuild = Build & Node & Temporal & {
  __typename?: 'AnnouncedBuild';
  branch: Scalars['String']['output'];
  browsers: Array<BrowserInfo>;
  /** Git commit hash (unshortened). */
  commit: Scalars['String']['output'];
  /** Link to the commit details at the Git provider linked to the project. */
  commitUrl?: Maybe<Scalars['String']['output']>;
  /** When the commit was created in Git. */
  committedAt: Scalars['DateTime']['output'];
  /** When the entity was first created in Chromatic. */
  createdAt: Scalars['DateTime']['output'];
  /** GraphQL node identifier */
  id: Scalars['ID']['output'];
  number: Scalars['Int']['output'];
  slug?: Maybe<Scalars['String']['output']>;
  status: BuildStatus;
  /** When the entity was last updated or created in Chromatic. */
  updatedAt: Scalars['DateTime']['output'];
};

export enum Browser {
  Chrome = 'CHROME',
  Edge = 'EDGE',
  Firefox = 'FIREFOX',
  Safari = 'SAFARI'
}

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

export type Build = {
  branch: Scalars['String']['output'];
  browsers: Array<BrowserInfo>;
  /** Git commit hash (unshortened). */
  commit: Scalars['String']['output'];
  /** Link to the commit details at the Git provider linked to the project. */
  commitUrl?: Maybe<Scalars['String']['output']>;
  /** When the commit was created in Git. */
  committedAt: Scalars['DateTime']['output'];
  /** When the entity was first created in Chromatic. */
  createdAt: Scalars['DateTime']['output'];
  /** GraphQL node identifier */
  id: Scalars['ID']['output'];
  number: Scalars['Int']['output'];
  slug?: Maybe<Scalars['String']['output']>;
  status: BuildStatus;
  /** When the entity was last updated or created in Chromatic. */
  updatedAt: Scalars['DateTime']['output'];
};

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

export type Capture = {
  __typename?: 'Capture';
  /** The ID of the capture. */
  id: Scalars['ID']['output'];
};

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

export type Component = Node & Temporal & {
  __typename?: 'Component';
  /** Story metadata `id` (default export) or slugified version of `title`. */
  componentId: Scalars['String']['output'];
  /** When the entity was first created in Chromatic. */
  createdAt: Scalars['DateTime']['output'];
  /** Same as componentId, but guaranteed to be unique within the project. */
  csfId?: Maybe<Scalars['String']['output']>;
  /** GraphQL node identifier */
  id: Scalars['ID']['output'];
  /** Display name of the component (last section of the title). */
  name: Scalars['String']['output'];
  /** Normalized hierarchy path, including component name as last item. */
  path: Array<Scalars['String']['output']>;
  representativeStory?: Maybe<Story>;
  stories?: Maybe<StoryConnection>;
  /** Title (hierarchy path) as specified on story metadata (default export) or autogenerated based on file path. */
  title: Scalars['String']['output'];
  /** When the entity was last updated or created in Chromatic. */
  updatedAt: Scalars['DateTime']['output'];
};


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
  component: Component;
  /** This test is the best representation of the first spec of the component on this build. */
  representativeTest: Test;
};

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

export type FigmaMetadata = Node & Temporal & {
  __typename?: 'FigmaMetadata';
  /** When the entity was first created in Chromatic. */
  createdAt: Scalars['DateTime']['output'];
  /** GraphQL node identifier */
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

export type Image = {
  /** Pixel height of the image. */
  imageHeight: Scalars['Int']['output'];
  /** URL of the image. */
  imageUrl: Scalars['URL']['output'];
  /** Pixel width of the image. */
  imageWidth: Scalars['Int']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  bulkCreateFigmaMetadata: Array<FigmaMetadata>;
  bulkRemoveFigmaMetadata: Array<FigmaMetadata>;
  createFigmaMetadata?: Maybe<FigmaMetadata>;
  removeFigmaMetadata?: Maybe<FigmaMetadata>;
};


export type MutationBulkCreateFigmaMetadataArgs = {
  input: Array<CreateFigmaMetadataInput>;
};


export type MutationBulkRemoveFigmaMetadataArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationCreateFigmaMetadataArgs = {
  key: Scalars['String']['input'];
  metadata: Scalars['JSONObject']['input'];
  url: Scalars['String']['input'];
};


export type MutationRemoveFigmaMetadataArgs = {
  id: Scalars['ID']['input'];
};

export type Node = {
  /** GraphQL node identifier */
  id: Scalars['ID']['output'];
};

export enum OrderDirection {
  /** Ascending */
  Asc = 'ASC',
  /** Descending */
  Desc = 'DESC'
}

/** Information about pagination in a connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean']['output'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Project = Node & Temporal & {
  __typename?: 'Project';
  /** List of branches for which builds exist in the project. */
  branchNames: Array<Scalars['String']['output']>;
  /** When the entity was first created in Chromatic. */
  createdAt: Scalars['DateTime']['output'];
  /** This token is the Figma OAuth2 accessToken of whichever user assigned their Figma credentials to the project. */
  figmaToken?: Maybe<Scalars['String']['output']>;
  /** GraphQL node identifier */
  id: Scalars['ID']['output'];
  /** Retrieve the last build for the project which matches the (optionally) provided filters. All filter arguments must match (AND). */
  lastBuild?: Maybe<Build>;
  /** Project name, typically the repository name. */
  name: Scalars['String']['output'];
  /** Account information which does not require the `account` scope. */
  publicAccountInfo: PublicAccountInfo;
  /** When the entity was last updated or created in Chromatic. */
  updatedAt: Scalars['DateTime']['output'];
  /** Link to the project on Chromatic. */
  webUrl: Scalars['URL']['output'];
};


export type ProjectBranchNamesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type ProjectLastBuildArgs = {
  branches?: InputMaybe<Array<Scalars['String']['input']>>;
  defaultBranch?: InputMaybe<Scalars['Boolean']['input']>;
  results?: InputMaybe<Array<BuildResult>>;
  statuses?: InputMaybe<Array<BuildStatus>>;
};

export type PublicAccountInfo = {
  __typename?: 'PublicAccountInfo';
  /** Avatar URL of the repository owner or token holder. */
  avatarUrl?: Maybe<Scalars['URL']['output']>;
  /** Login name of the repository owner or token holder. */
  name: Scalars['String']['output'];
};

/** A build that has been published but not started testing yet. */
export type PublishedBuild = Build & Node & Temporal & {
  __typename?: 'PublishedBuild';
  branch: Scalars['String']['output'];
  browsers: Array<BrowserInfo>;
  /** Git commit hash (unshortened). */
  commit: Scalars['String']['output'];
  /** Link to the commit details at the Git provider linked to the project. */
  commitUrl?: Maybe<Scalars['String']['output']>;
  /** When the commit was created in Git. */
  committedAt: Scalars['DateTime']['output'];
  /** When the entity was first created in Chromatic. */
  createdAt: Scalars['DateTime']['output'];
  /** GraphQL node identifier */
  id: Scalars['ID']['output'];
  /** Link to the published Storybook's canvas (iframe.html). */
  isolatorUrl: Scalars['URL']['output'];
  number: Scalars['Int']['output'];
  /** When the Storybook was published on Chromatic. */
  publishedAt: Scalars['DateTime']['output'];
  slug?: Maybe<Scalars['String']['output']>;
  status: BuildStatus;
  /** Link to the published Storybook. */
  storybookUrl: Scalars['URL']['output'];
  /** When the entity was last updated or created in Chromatic. */
  updatedAt: Scalars['DateTime']['output'];
};

export type Query = {
  __typename?: 'Query';
  bulkFigmaMetadata?: Maybe<Array<Maybe<FigmaMetadata>>>;
  figmaMetadata?: Maybe<FigmaMetadata>;
  figmaMetadataById?: Maybe<FigmaMetadata>;
  project?: Maybe<Project>;
  storybook?: Maybe<Storybook>;
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

/** A build that has started but not completed testing. */
export type StartedBuild = Build & Node & Temporal & {
  __typename?: 'StartedBuild';
  branch: Scalars['String']['output'];
  browsers: Array<BrowserInfo>;
  /** Git commit hash (unshortened). */
  commit: Scalars['String']['output'];
  /** Link to the commit details at the Git provider linked to the project. */
  commitUrl?: Maybe<Scalars['String']['output']>;
  /** When the commit was created in Git. */
  committedAt: Scalars['DateTime']['output'];
  /** The number of components in the published Storybook, excluding docsOnly components */
  componentCount: Scalars['Int']['output'];
  /** When the entity was first created in Chromatic. */
  createdAt: Scalars['DateTime']['output'];
  /** The number of docsOnly stories in the published Storybook */
  docsCount: Scalars['Int']['output'];
  /** GraphQL node identifier */
  id: Scalars['ID']['output'];
  interactionTestFailuresCount?: Maybe<Scalars['Int']['output']>;
  /** Whether the build is reviewable. */
  isReviewable: Scalars['Boolean']['output'];
  /** Link to the published Storybook's canvas (iframe.html). */
  isolatorUrl: Scalars['URL']['output'];
  number: Scalars['Int']['output'];
  /** When the Storybook was published on Chromatic. */
  publishedAt: Scalars['DateTime']['output'];
  slug?: Maybe<Scalars['String']['output']>;
  /** The number of stories in the published Storybook, excluding docsOnly stories */
  specCount: Scalars['Int']['output'];
  /** When the build was started in Chromatic. */
  startedAt: Scalars['DateTime']['output'];
  status: BuildStatus;
  /** Link to the published Storybook. */
  storybookUrl: Scalars['URL']['output'];
  /** Count the number of tests in the build. All provided filter arguments must match (AND). */
  testCount: Scalars['Int']['output'];
  tests?: Maybe<StartedBuildTestConnection>;
  /** When the entity was last updated or created in Chromatic. */
  updatedAt: Scalars['DateTime']['output'];
  /** Whether the build was limited to just representative stories due to insufficient snapshot quota. */
  wasLimited: Scalars['Boolean']['output'];
  /** Link to the build details on Chromatic. */
  webUrl: Scalars['URL']['output'];
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
  storyId?: InputMaybe<Scalars['String']['input']>;
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

export type Story = Node & Temporal & {
  __typename?: 'Story';
  captureImage?: Maybe<CaptureImage>;
  /** Component that contains the story. */
  component?: Maybe<Component>;
  /** When the entity was first created in Chromatic. */
  createdAt: Scalars['DateTime']['output'];
  /** Same as storyId, but guaranteed to be unique within the project. */
  csfId?: Maybe<Scalars['String']['output']>;
  /** GraphQL node identifier */
  id: Scalars['ID']['output'];
  /** Story name as displayed in Storybook. */
  name: Scalars['String']['output'];
  /** Story ID as generated by Storybook, including componentId prefix. */
  storyId: Scalars['String']['output'];
  /** Permalink to the story in the published Storybook. */
  storybookUrl?: Maybe<Scalars['URL']['output']>;
  /** When the entity was last updated or created in Chromatic. */
  updatedAt: Scalars['DateTime']['output'];
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

export type Storybook = {
  __typename?: 'Storybook';
  /** Link to the build on Chromatic. */
  buildUrl: Scalars['URL']['output'];
  /** List of components in the published Storybook. */
  components: ComponentConnection;
  /** Permalink to the published Storybook. */
  storybookUrl: Scalars['URL']['output'];
};


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
  comparisons: Array<TestComparisonType>;
  /** When the entity was first created in Chromatic. */
  createdAt: Scalars['DateTime']['output'];
  /** GraphQL node identifier */
  id: Scalars['ID']['output'];
  parameters: TestParameters;
  /** A summary of the results of the checks and comparisons on this test. */
  result?: Maybe<TestResult>;
  /** This is the user state of the test; has it been reviewed? */
  status: TestStatus;
  story?: Maybe<Story>;
  /** When the entity was last updated or created in Chromatic. */
  updatedAt: Scalars['DateTime']['output'];
};

export type TestComparisonType = Node & {
  __typename?: 'TestComparisonType';
  browser: BrowserInfo;
  headCapture?: Maybe<Capture>;
  /** GraphQL node identifier */
  id: Scalars['ID']['output'];
  result?: Maybe<ComparisonResult>;
  viewport: ViewportInfo;
};

export type TestParameters = {
  __typename?: 'TestParameters';
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
  /** Set the media used when capturing the story. */
  media?: Maybe<Scalars['String']['output']>;
  /** Disallow scrolling in order to take a full page screenshot. */
  noScroll?: Maybe<Scalars['Boolean']['output']>;
  /** Reverse CSS animations so snapshots show the end state. */
  pauseAnimationAtEnd?: Maybe<Scalars['Boolean']['output']>;
  /** Set the `prefers-reduced-motion` media feature when capturing the story. */
  prefersReducedMotion?: Maybe<Scalars['String']['output']>;
  /** This test only contains representative snapshots. */
  representativeOnly?: Maybe<Scalars['Boolean']['output']>;
  /** Viewport information. */
  viewport: ViewportInfo;
};

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

/** A build that has completed testing. */
export type TestedBuild = Build & Node & Temporal & {
  __typename?: 'TestedBuild';
  branch: Scalars['String']['output'];
  browsers: Array<BrowserInfo>;
  /** Git commit hash (unshortened). */
  commit: Scalars['String']['output'];
  /** Link to the commit details at the Git provider linked to the project. */
  commitUrl?: Maybe<Scalars['String']['output']>;
  /** When the commit was created in Git. */
  committedAt: Scalars['DateTime']['output'];
  /** When the build was completed in Chromatic. */
  completedAt: Scalars['DateTime']['output'];
  /** The number of components in the published Storybook, excluding docsOnly components */
  componentCount: Scalars['Int']['output'];
  componentRepresentations?: Maybe<TestedBuildComponentRepresentationConnection>;
  /** When the entity was first created in Chromatic. */
  createdAt: Scalars['DateTime']['output'];
  /** The number of docsOnly stories in the published Storybook */
  docsCount: Scalars['Int']['output'];
  /** GraphQL node identifier */
  id: Scalars['ID']['output'];
  interactionTestFailuresCount?: Maybe<Scalars['Int']['output']>;
  /** Whether the build is reviewable. */
  isReviewable: Scalars['Boolean']['output'];
  /** Link to the published Storybook's canvas (iframe.html). */
  isolatorUrl: Scalars['URL']['output'];
  number: Scalars['Int']['output'];
  /** When the Storybook was published on Chromatic. */
  publishedAt: Scalars['DateTime']['output'];
  result: BuildResult;
  slug?: Maybe<Scalars['String']['output']>;
  /** The number of stories in the published Storybook, excluding docsOnly stories */
  specCount: Scalars['Int']['output'];
  /** When the build was started in Chromatic. */
  startedAt: Scalars['DateTime']['output'];
  status: BuildStatus;
  /** Link to the published Storybook. */
  storybookUrl: Scalars['URL']['output'];
  /** Count the number of tests in the build. All provided filter arguments must match (AND). */
  testCount: Scalars['Int']['output'];
  tests?: Maybe<TestedBuildTestConnection>;
  /** When the entity was last updated or created in Chromatic. */
  updatedAt: Scalars['DateTime']['output'];
  /** Whether the build was limited to just representative stories due to insufficient snapshot quota. */
  wasLimited: Scalars['Boolean']['output'];
  /** Link to the build details on Chromatic. */
  webUrl: Scalars['URL']['output'];
};


/** A build that has completed testing. */
export type TestedBuildComponentRepresentationsArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  before?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<TestedBuildComponentRepresentationsOrder>;
};


/** A build that has completed testing. */
export type TestedBuildTestCountArgs = {
  results?: InputMaybe<Array<TestResult>>;
  reviewable?: InputMaybe<Scalars['Boolean']['input']>;
  statuses?: InputMaybe<Array<TestStatus>>;
};


/** A build that has completed testing. */
export type TestedBuildTestsArgs = {
  after?: InputMaybe<Scalars['ID']['input']>;
  before?: InputMaybe<Scalars['ID']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<TestedBuildTestsOrder>;
  storyId?: InputMaybe<Scalars['String']['input']>;
};

/** Connection to a list of TestedBuildComponentRepresentation. */
export type TestedBuildComponentRepresentationConnection = {
  __typename?: 'TestedBuildComponentRepresentationConnection';
  /** List of edges for TestedBuildComponentRepresentationConnection. */
  edges: Array<TestedBuildComponentRepresentationEdge>;
  /** List of nodes for TestedBuildComponentRepresentationConnection. */
  nodes: Array<ComponentRepresentation>;
  /** Pagination details for TestedBuildComponentRepresentationConnection. */
  pageInfo: PageInfo;
  /** Total number of items for TestedBuildComponentRepresentationConnection. */
  totalCount: Scalars['Int']['output'];
};

/** The edge type for TestedBuildComponentRepresentation. */
export type TestedBuildComponentRepresentationEdge = {
  __typename?: 'TestedBuildComponentRepresentationEdge';
  /** Cursor to this item. */
  cursor: Scalars['String']['output'];
  /** The item at the edge. */
  node: ComponentRepresentation;
};

export type TestedBuildComponentRepresentationsOrder = {
  direction: OrderDirection;
  field: TestedBuildComponentRepresentationsOrderField;
};

export enum TestedBuildComponentRepresentationsOrderField {
  CreatedAt = 'createdAt',
  ResultOrder = 'resultOrder',
  StoryOrder = 'storyOrder',
  UpdatedAt = 'updatedAt'
}

/** Connection to a list of TestedBuildTest. */
export type TestedBuildTestConnection = {
  __typename?: 'TestedBuildTestConnection';
  /** List of edges for TestedBuildTestConnection. */
  edges: Array<TestedBuildTestEdge>;
  /** List of nodes for TestedBuildTestConnection. */
  nodes: Array<Test>;
  /** Pagination details for TestedBuildTestConnection. */
  pageInfo: PageInfo;
  /** Total number of items for TestedBuildTestConnection. */
  totalCount: Scalars['Int']['output'];
};

/** The edge type for TestedBuildTest. */
export type TestedBuildTestEdge = {
  __typename?: 'TestedBuildTestEdge';
  /** Cursor to this item. */
  cursor: Scalars['String']['output'];
  /** The item at the edge. */
  node: Test;
};

export type TestedBuildTestsOrder = {
  direction: OrderDirection;
  field: TestedBuildTestsOrderField;
};

export enum TestedBuildTestsOrderField {
  CreatedAt = 'createdAt',
  ResultOrder = 'resultOrder',
  StoryOrder = 'storyOrder',
  UpdatedAt = 'updatedAt'
}

export type User = Node & Temporal & {
  __typename?: 'User';
  avatarUrl?: Maybe<Scalars['URL']['output']>;
  /** When the entity was first created in Chromatic. */
  createdAt: Scalars['DateTime']['output'];
  /** GraphQL node identifier */
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  /** When the entity was last updated or created in Chromatic. */
  updatedAt: Scalars['DateTime']['output'];
  username: Scalars['String']['output'];
};

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

export type ProjectQueryQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type ProjectQueryQuery = { __typename?: 'Query', project?: { __typename?: 'Project', id: string, name: string, webUrl: any, lastBuild?: { __typename?: 'AnnouncedBuild', branch: string, number: number } | { __typename?: 'PublishedBuild', branch: string, number: number } | { __typename?: 'StartedBuild', branch: string, number: number } | { __typename?: 'TestedBuild', branch: string, number: number } | null } | null };

export type LastBuildQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
  branch: Scalars['String']['input'];
  storyId: Scalars['String']['input'];
}>;


export type LastBuildQuery = { __typename?: 'Query', project?: { __typename?: 'Project', id: string, name: string, webUrl: any, lastBuild?: { __typename?: 'AnnouncedBuild', id: string, number: number, branch: string, commit: string, status: BuildStatus, browsers: Array<{ __typename?: 'BrowserInfo', id: string, key: Browser, name: string }> } | { __typename?: 'PublishedBuild', id: string, number: number, branch: string, commit: string, status: BuildStatus, browsers: Array<{ __typename?: 'BrowserInfo', id: string, key: Browser, name: string }> } | { __typename?: 'StartedBuild', startedAt: any, id: string, number: number, branch: string, commit: string, status: BuildStatus, changeCount: number, tests?: { __typename?: 'StartedBuildTestConnection', nodes: Array<{ __typename?: 'Test', id: string, status: TestStatus, result?: TestResult | null, comparisons: Array<{ __typename?: 'TestComparisonType', id: string, result?: ComparisonResult | null, browser: { __typename?: 'BrowserInfo', id: string, key: Browser, name: string, version: string }, viewport: { __typename?: 'ViewportInfo', id: string, name: string, width: number, isDefault: boolean } }>, parameters: { __typename?: 'TestParameters', viewport: { __typename?: 'ViewportInfo', id: string, name: string, width: number, isDefault: boolean } } }> } | null, browsers: Array<{ __typename?: 'BrowserInfo', id: string, key: Browser, name: string }> } | { __typename?: 'TestedBuild', id: string, number: number, branch: string, commit: string, status: BuildStatus, browsers: Array<{ __typename?: 'BrowserInfo', id: string, key: Browser, name: string }> } | null } | null };


export const ProjectQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProjectQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"project"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"webUrl"}},{"kind":"Field","name":{"kind":"Name","value":"lastBuild"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"branch"}},{"kind":"Field","name":{"kind":"Name","value":"number"}}]}}]}}]}}]} as unknown as DocumentNode<ProjectQueryQuery, ProjectQueryQueryVariables>;
export const LastBuildDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LastBuild"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"branch"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storyId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"project"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"webUrl"}},{"kind":"Field","name":{"kind":"Name","value":"lastBuild"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"branches"},"value":{"kind":"ListValue","values":[{"kind":"Variable","name":{"kind":"Name","value":"branch"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"branch"}},{"kind":"Field","name":{"kind":"Name","value":"commit"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"browsers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StartedBuild"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"changeCount"},"name":{"kind":"Name","value":"testCount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"results"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"ADDED"},{"kind":"EnumValue","value":"CHANGED"},{"kind":"EnumValue","value":"FIXED"}]}}]},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"tests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storyId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storyId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"result"}},{"kind":"Field","name":{"kind":"Name","value":"comparisons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"browser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}},{"kind":"Field","name":{"kind":"Name","value":"viewport"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}},{"kind":"Field","name":{"kind":"Name","value":"result"}}]}},{"kind":"Field","name":{"kind":"Name","value":"parameters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"viewport"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<LastBuildQuery, LastBuildQueryVariables>;