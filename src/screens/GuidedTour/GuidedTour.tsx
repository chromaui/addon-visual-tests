import { type API, useStorybookState } from "@storybook/manager-api";
import { useTheme } from "@storybook/theming";
import React, { useEffect, useRef } from "react";
import Joyride from "react-joyride";

import { PANEL_ID } from "../../constants";
import { ENABLE_FILTER } from "../../SidebarBottom";
import { useSessionState } from "../../utils/useSessionState";
import { useSelectedStoryState } from "../VisualTests/BuildContext";
import { Confetti } from "./Confetti";
import { Tooltip, TooltipProps } from "./Tooltip";

type GuidedTourStep = TooltipProps["step"];

interface TourProps {
  skipWalkthrough: () => void;
  startWalkthrough: () => void;
  completeWalkthrough: () => void;
  managerApi: API;
}

export const GuidedTour = ({
  managerApi,
  skipWalkthrough: onSkipWalkthroughButtonClick,
  startWalkthrough,
  completeWalkthrough: onCompleteWalkthroughButtonClick,
}: TourProps) => {
  const theme = useTheme();

  const selectedStory = useSelectedStoryState();
  const selectedTestHasChanges = selectedStory?.selectedTest?.result === "CHANGED";
  const selectedTestHasNotBeenAcceptedYet = selectedStory?.selectedTest?.status !== "ACCEPTED";

  const layoutState = JSON.stringify(useStorybookState().layout);
  const stateRef = useRef(layoutState);
  if (stateRef.current !== layoutState) {
    // Trigger Joyride to rerender
    window.dispatchEvent(new Event("resize"));
    stateRef.current = layoutState;
  }

  useEffect(() => {
    // Prompt the parent screen that the walkthrough has started, so it doesn't exit on accept if there is only one story changed in the build.
    startWalkthrough();
  });

  // Make sure the addon panel is open
  useEffect(() => {
    // Automatically jump to the first story if the current story is not a story (docs). So that the addon panel is visible.
    if (managerApi.getCurrentStoryData()?.type !== "story") {
      managerApi.jumpToStory(1);
    }

    // Make sure the addon panel is open, and on the visual tests tab.
    managerApi.togglePanel(true);
    managerApi.togglePanelPosition("right");
    managerApi.setSelectedPanel(PANEL_ID);
  }, [managerApi]);

  const [showConfetti, setShowConfetti] = useSessionState("showConfetti", false);
  const [stepIndex, setStepIndex] = useSessionState("stepIndex", 0);
  const nextStep = () => setStepIndex((prev = 0) => prev + 1);

  useEffect(() => {
    // Listen for internal event to indicate a filter was set before moving to next step.
    managerApi.once(ENABLE_FILTER, () => {
      setStepIndex(1);
      // Force a resize to make sure the react-joyride centers on the sidebar properly. Timeout is needed to make sure the filter takes place.
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 100);
    });
  }, [managerApi, setStepIndex]);

  useEffect(() => {
    // Listen for the test status to change to ACCEPTED and move to the completed step.
    if (selectedStory?.selectedTest?.status === "ACCEPTED" && stepIndex === 5) {
      setShowConfetti(true);
      setStepIndex(6);
    }
  }, [selectedStory?.selectedTest?.status, showConfetti, setShowConfetti, stepIndex, setStepIndex]);

  const steps: Partial<GuidedTourStep>[] = [
    {
      target: "#sidebar-bottom-wrapper",
      title: "Changes found",
      content: (
        <>
          The visual tests addon will detect changes in all of your stories and allow you to review
          them before opening a pull request.
          <br />
          <br />
          Click this button to see the changes in the sidebar.
        </>
      ),
      floaterProps: {
        target: "#changes-found-filter",
        options: {
          preventOverflow: {
            boundariesElement: "window",
          },
        },
      },
      placement: "top",
      disableBeacon: true,
      hideNextButton: true,
      spotlightClicks: true,
      onSkipWalkthroughButtonClick,
    },
    selectedTestHasChanges && selectedTestHasNotBeenAcceptedYet
      ? {
          target: "#storybook-explorer-tree > div",
          title: "Stories with changes",
          content: <>Here you have a filtered list of only stories with changes.</>,
          placement: "right",
          disableBeacon: true,
          spotlightClicks: true,
          onNextButtonClick: nextStep,
          onSkipWalkthroughButtonClick,
        }
      : {
          target: "#storybook-explorer-tree > div",
          title: "Stories with changes",
          content: (
            <>
              Here you have a list of all stories in your Storybook.
              <br />
              <br />
              Select a story with changes to see the exact pixels that changed.
            </>
          ),
          placement: "right",
          disableBeacon: true,
          spotlightClicks: true,
          hideNextButton: true,
          onSkipWalkthroughButtonClick,
        },

    {
      target: "#panel-tab-content",
      title: "Inspect changes",
      content: (
        <>
          The results of the changes are shown here. The pixels that changed are highlighted in
          green.
        </>
      ),
      disableBeacon: true,
      placement: "left",
      onNextButtonClick: nextStep,
      onSkipWalkthroughButtonClick,
    },
    {
      target: "#button-diff-visible",
      title: "Toggle the diff",
      content: (
        <>
          This button shows or hides the visual diff. Use it to make the visual changes in your
          stories obvious. Try it out.
        </>
      ),
      onNextButtonClick: nextStep,
      onSkipWalkthroughButtonClick,
      spotlightClicks: true,
      disableBeacon: true,
      placement: "bottom",
      disableOverlay: true,
    },
    {
      target: "#button-toggle-snapshot",
      title: "This is the Switch button",
      content: (
        <>
          Switch between the baseline snapshot (old) and the latest snapshot. The info bar will let
          you know which version you're looking at.
        </>
      ),
      onNextButtonClick: nextStep,
      onSkipWalkthroughButtonClick,
      spotlightClicks: true,
      disableBeacon: true,
      placement: "bottom",
      disableOverlay: true,
    },
    {
      target: "#button-toggle-accept-story",
      title: "Accept changes",
      content: (
        <>
          If the visual changes are intentional, accept them to update the test baselines. The next
          time you run visual tests, future changes will be compared to these new baselines. This
          can be undone.
        </>
      ),
      disableBeacon: true,
      spotlightClicks: true,
      onNextButtonClick: nextStep,
      hideNextButton: true,
      placement: "bottom",
      disableOverlay: true,
      onSkipWalkthroughButtonClick,
    },
    {
      target: "#button-toggle-accept-story",
      title: "Perfection!",
      placement: "bottom",
      disableOverlay: true,
      content: (
        <>
          You&apos;ve got the basics down! You can always unaccept if you&apos;re not happy with the
          changes.
        </>
      ),
      onNextButtonClick: nextStep,
      onSkipWalkthroughButtonClick,
    },
    {
      target: "#button-run-tests",
      title: "You are ready to test",
      placement: "bottom",
      disableOverlay: true,
      content: (
        <>
          Any time you want to run tests, tap this button in the sidebar to see exactly what changed
          across your Storybook.
        </>
      ),
      disableBeacon: true,
      nextButtonText: "Done",
      onNextButtonClick: onCompleteWalkthroughButtonClick,
    },
  ];
  return (
    <>
      {showConfetti && (
        <Confetti
          numberOfPieces={800}
          recycle={false}
          tweenDuration={20000}
          onConfettiComplete={(confetti) => {
            confetti?.reset();
            setShowConfetti(false);
          }}
        />
      )}
      <Joyride
        // For some reason, the working steps above do not pass the type check. So we have to cast it.
        steps={steps as GuidedTourStep[]}
        continuous
        stepIndex={stepIndex}
        spotlightPadding={0}
        hideBackButton
        disableCloseOnEsc
        disableOverlayClose
        disableScrolling
        hideCloseButton
        showSkipButton
        floaterProps={{
          options: {
            offset: {
              offset: "0, 6",
            },
          },
          styles: {
            floater: {
              padding: 0,
              paddingLeft: 8,
              paddingTop: 8,
              filter:
                theme.base === "light"
                  ? "drop-shadow(0px 5px 5px rgba(0,0,0,0.05)) drop-shadow(0 1px 3px rgba(0,0,0,0.1))"
                  : "drop-shadow(#fff5 0px 0px 0.5px) drop-shadow(#fff5 0px 0px 0.5px)",
            },
          },
        }}
        tooltipComponent={Tooltip}
        styles={{
          overlay: {
            mixBlendMode: "unset",
            backgroundColor: "none",
          },
          spotlight: {
            backgroundColor: "none",
            border: `solid 2px ${theme.color.secondary}`,
            boxShadow: "0px 0px 0px 9999px rgba(0,0,0,0.4)",
          },
          options: {
            zIndex: 10000,
            primaryColor: theme.color.secondary,
            arrowColor: theme.base === "light" ? theme.color.lightest : "#292A2C",
          },
        }}
      />
    </>
  );
};
