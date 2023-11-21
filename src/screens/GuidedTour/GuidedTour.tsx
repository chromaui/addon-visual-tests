import { type API } from "@storybook/manager-api";
import { useTheme } from "@storybook/theming";
import React from "react";
import Joyride, { CallBackProps } from "react-joyride";
import { gql } from "urql";

import { PANEL_ID, WALKTHROUGH_SKIP_RESIZE_PANEL } from "../../constants";
import { SelectedBuildFieldsFragment } from "../../gql/graphql";
import { ENABLE_FILTER } from "../../SidebarBottom";
import { useSelectedStoryState } from "../VisualTests/BuildContext";
import { Confetti } from "./Confetti";
import { PulsatingEffect } from "./PulsatingEffect";
import { Tooltip, TooltipProps } from "./Tooltip";

const ProjectQuery = gql`
  query ProjectQuery($projectId: ID!) {
    project(id: $projectId) {
      id
      name
      webUrl
      lastBuild {
        branch
        number
      }
    }
  }
`;
type GuidedTourStep = TooltipProps["step"];

interface TourProps {
  skipWalkthrough: () => void;
  completeWalkthrough: () => void;
  managerApi: API;
}

export const GuidedTour = ({
  managerApi,
  skipWalkthrough: onSkipWalkthroughButtonClick,
  completeWalkthrough: onCompleteWalkthroughButtonClick,
}: TourProps) => {
  const theme = useTheme();

  const selectedStory = useSelectedStoryState();
  const selectedTestHasChanges = selectedStory?.selectedTest.result === "CHANGED";
  const selectedTestHasNotBeenAcceptedYet = selectedStory?.selectedTest.status !== "ACCEPTED";

  React.useEffect(() => {
    // Dismiss storybook notifications that get in the way of the tour.
    managerApi.clearNotification("whats-new");
  }, [managerApi]);

  // Make sure the addon panel is open
  React.useEffect(() => {
    // Automatically jump to the first story if the current story is not a story (docs). So that the addon panel is visible.
    if (managerApi.getCurrentStoryData().type !== "story") {
      managerApi.jumpToStory(1);
    }

    // Make sure the addon panel is open, and on the visual tests tab.
    managerApi.togglePanel(true);
    managerApi.togglePanelPosition("right");
    managerApi.setSelectedPanel(PANEL_ID);

    // Force the panel to resize to 500px.
    const storybookLayout = JSON.parse(localStorage.getItem("storybook-layout") || "");
    // skip resize if it's already been tried, to avoid a reload loop.
    const skipResize = localStorage.getItem(WALKTHROUGH_SKIP_RESIZE_PANEL) === "true";
    if (storybookLayout.resizerPanel?.x !== window.innerWidth - 500 && !skipResize) {
      localStorage.setItem(WALKTHROUGH_SKIP_RESIZE_PANEL, "true");
      localStorage.setItem(
        "storybook-layout",
        JSON.stringify({
          ...storybookLayout,
          resizerPanel: { x: window.innerWidth - 500 },
        })
      );
      document.location.reload();
    }
  }, [managerApi]);

  const [showConfetti, setShowConfetti] = React.useState(false);
  // This will just be shown by default for now. Need to figure out when we should display it.
  const [stepIndex, setStepIndex] = React.useState<number>(0);
  const nextStep = () => {
    setStepIndex((prev) => prev + 1);
  };

  React.useEffect(() => {
    // Listen for internal event to indicate a filter was set before moving to next step.
    managerApi.once(ENABLE_FILTER, () => {
      setStepIndex(1);
    });
  }, [managerApi]);

  React.useEffect(() => {
    // Listen for the test status to change to ACCEPTED and move to the completed step.
    if (selectedStory.selectedTest.status === "ACCEPTED" && stepIndex === 5) {
      setShowConfetti(true);
      setStepIndex(6);
    }
  }, [selectedStory.selectedTest.status, showConfetti, setShowConfetti, stepIndex]);

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
        <>The results of the changes are shown here highlighting changes down to the pixel.</>
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
          This button shows or hides the diff. The diff view highlights the changes in green. Try it
          out.
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
          Toggle between the baseline snapshot (old) and the latest (new). The info bar below lets
          you know which you are looking at.
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
      target: "#button-accept-story",
      title: "Changes found!",
      content: (
        <>
          Accepting changes updates the baseline for the next time you run visual tests. This can be
          undone.
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
      target: "#button-unaccept-story",
      title: "Perfection!",
      placement: "bottom",
      disableOverlay: true,
      content: (
        <>
          You’ve got the basics down! You can always Unaccept if you’re not happy with the changes.
        </>
      ),
      onNextButtonClick: nextStep,
      onSkipWalkthroughButtonClick,
    },
    {
      target: "#button-run-tests",
      title: "You are ready to test",
      placement: "bottom",
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
        steps={steps}
        continuous
        stepIndex={stepIndex}
        spotlightPadding={0}
        hideBackButton
        disableCloseOnEsc
        disableOverlayClose
        disableScrolling
        hideCloseButton
        // Not needed in our tour because we only show individual steps. Storybook tour requires writing a story.
        // callback={(data: CallBackProps) => {
        // if (!isFinalStep && data.status === STATUS.FINISHED) {
        //   onFirstTourDone();
        // }
        // }}
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
            arrowColor: theme.base === "dark" ? "#292A2C" : theme.color.lightest,
          },
        }}
      />
    </>
  );
};
