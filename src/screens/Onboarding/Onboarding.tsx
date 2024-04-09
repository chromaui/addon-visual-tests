import React, { useEffect } from "react";

import { Button } from "../../components/Button";
import { ButtonStack } from "../../components/ButtonStack";
import { AccountSuspensionReason } from "../../gql/graphql";
import { GitInfoPayload, LocalBuildProgress } from "../../types";
import { useSessionState } from "../../utils/useSessionState";
import { AccountSuspended } from "../Errors/AccountSuspended";
import { BuildError } from "../Errors/BuildError";
import { useRunBuildState } from "../VisualTests/RunBuildContext";
import { CatchAChange } from "./CatchAChange";
import { CatchAChangeComplete } from "./CatchAChangeComplete";
import { InitialBuild } from "./InitialBuild";
import { InitialBuildComplete } from "./InitialBuildComplete";

interface OnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
  dismissBuildError: () => void;
  localBuildProgress?: LocalBuildProgress;
  showInitialBuildScreen?: boolean;
  lastBuildHasChangesForStory: boolean;
  gitInfo: Pick<GitInfoPayload, "uncommittedHash" | "branch">;
}

export const Onboarding = ({
  dismissBuildError,
  localBuildProgress,
  showInitialBuildScreen,
  gitInfo,
  lastBuildHasChangesForStory,
  onComplete,
  onSkip,
}: OnboardingProps) => {
  const { isRunning, startBuild } = useRunBuildState();

  // The initial build screen is only necessary if this is a brand new project with no builds at all. Instead, !selectedBuild would appear on any new branch, even if there are other builds on the project.
  // TODO: Removed this entirely to solve for the most common case of an existing user with some builds to use as a baseline.
  // Removing instead of fixing to avoid additional work as this project is past due. We need to revisit this later.
  const [showInitialBuild, setShowInitialBuild] = useSessionState(
    "showInitialBuild",
    showInitialBuildScreen
  );
  useEffect(() => {
    // Watch the value of showInitialBuildScreen, and if it becomes true, set the state to true. This is necessary because Onboarding may render before there is data to determine if there are any builds.
    if (showInitialBuildScreen) setShowInitialBuild(true);
  }, [showInitialBuildScreen, setShowInitialBuild]);

  const [showCatchAChange, setShowCatchAChange] = useSessionState(
    "showCatchAChange",
    !showInitialBuild
  );
  const [initialGitHash, setInitialGitHash] = useSessionState(
    "initialGitHash",
    gitInfo.uncommittedHash
  );

  const onCatchAChange = () => {
    setInitialGitHash(gitInfo.uncommittedHash);
    setShowCatchAChange(true);
  };

  const [runningSecondBuild, setRunningSecondBuild] = useSessionState("runningSecondBuild", false);

  if (localBuildProgress?.currentStep === "error") {
    return (
      <BuildError localBuildProgress={localBuildProgress}>
        <ButtonStack>
          <Button variant="solid" size="medium" onClick={startBuild}>
            Try again
          </Button>
          <Button link onClick={onSkip}>
            Skip walkthrough
          </Button>
        </ButtonStack>
      </BuildError>
    );
  }

  if (localBuildProgress?.currentStep === "limited") {
    return (
      <AccountSuspended
        billingUrl={localBuildProgress.errorDetailsUrl}
        suspensionReason={AccountSuspensionReason.ExceededThreshold}
      >
        <Button link onClick={dismissBuildError}>
          Continue
        </Button>
      </AccountSuspended>
    );
  }

  // Only show the initial build screen if no build has finished yet.
  if (showInitialBuild && (!localBuildProgress || (localBuildProgress && isRunning))) {
    return <InitialBuild {...{ isRunning, localBuildProgress, startBuild, onSkip }} />;
  }

  if (localBuildProgress?.currentStep === "complete" && !showCatchAChange && !runningSecondBuild) {
    // It's possible the "first" build we just ran actually found a baseline,
    // in this case we skip the "catch a change" part and short-circuit to the "Done" screen.
    return lastBuildHasChangesForStory ? (
      <CatchAChangeComplete {...{ onComplete, onSkip }} />
    ) : (
      <InitialBuildComplete {...{ onCatchAChange, onSkip }} />
    );
  }

  if (showCatchAChange && !lastBuildHasChangesForStory) {
    return (
      <CatchAChange
        {...{
          isRunning,
          isUnchanged: initialGitHash === gitInfo.uncommittedHash,
          localBuildProgress,
          onSkip,
          runningSecondBuild,
          setInitialGitHash,
          setRunningSecondBuild,
          startBuild,
          uncommittedHash: gitInfo.uncommittedHash,
        }}
      />
    );
  }

  // If the last build has changes, show the "Done" screen
  if (lastBuildHasChangesForStory) {
    return <CatchAChangeComplete {...{ onComplete, onSkip }} ranSecondBuild />;
  }

  // This should never happen
  return null;
};
