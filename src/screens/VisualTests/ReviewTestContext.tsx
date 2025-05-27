import React, { createContext } from 'react';

import { ReviewTestBatch } from '../../gql/graphql';
import { useRequiredContext } from '../../utils/useRequiredContext';

const initialState = {
  isReviewing: false,
  userCanReview: false,
  buildIsReviewable: false,
  acceptTest: (_testId: string, _batch: ReviewTestBatch = ReviewTestBatch.Spec) =>
    Promise.resolve(),
  unacceptTest: (_testId: string, _batch: ReviewTestBatch = ReviewTestBatch.Spec) =>
    Promise.resolve(),
};

type State = typeof initialState;

export const ReviewTestContext = createContext(initialState);

export const useReviewTestState = () => useRequiredContext(ReviewTestContext, 'ReviewTest');

export const ReviewTestProvider = ({
  children,
  watchState = initialState,
}: {
  children: React.ReactNode;
  watchState?: State;
}) => {
  return <ReviewTestContext.Provider value={watchState}>{children}</ReviewTestContext.Provider>;
};
