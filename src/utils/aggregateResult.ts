import { ComparisonResult } from '../gql/graphql';

export const resultOrder = [
  undefined,
  ComparisonResult.Skipped,
  ComparisonResult.Equal,
  ComparisonResult.Fixed,
  ComparisonResult.Added,
  ComparisonResult.Changed,
  ComparisonResult.Removed,
  ComparisonResult.CaptureError,
  ComparisonResult.SystemError,
] as const;

export const aggregateResult = ([first, ...rest]: (typeof resultOrder)[number][]) =>
  rest.reduce((acc, v) => (resultOrder.indexOf(v) > resultOrder.indexOf(acc) ? v : acc), first);
