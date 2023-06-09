import { Button, Icon } from "@storybook/design-system";
import { background, color, styled } from "@storybook/theming";
import React from "react";
import { gql, useQuery } from "urql";

import { ChromeIcon } from "../../components/ChromeIcon";
import { FirefoxIcon } from "../../components/FirefoxIcon";
import { SafariIcon } from "../../components/SafariIcon";

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

const Sections = styled.div({
  display: "flex",
  flexDirection: "column",
});

const Section = styled.div({
  "& + &": {
    borderTop: `1px solid ${color.border}`,
  },
});

const Row = styled.div({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  padding: "0 15px",
});

const Col = styled.div({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: 40,
  "& + &": {
    marginLeft: 15,
  },
});

const Line = styled.div({
  display: "inline-flex",
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
  color: color.mediumdark,

  b: {
    color: color.darkest,
  },
});

const PassedIcon = styled(Icon)({
  color: color.positive,
  width: 12,
  height: 12,
});

const ArrowIcon = styled(Icon)({
  width: 10,
  height: 10,
});

const BrowserButton = styled(Button)<{ active?: boolean }>((props) => ({
  "&&": {
    padding: 6,
    background: props.active ? background.hoverable : "transparent",
    "&:hover": {
      background: background.hoverable,
      boxShadow: "none",
    },
    "*": {
      opacity: props.active ? 1 : 0.5,
      transition: "opacity 0.2s ease-in-out",
    },
    "&:hover *": {
      opacity: 1,
    },
  },
}));

const SnapshotImage = styled.div({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#fff",
  minHeight: 100,
});

export const VisualTests = () => {
  const [{ data, fetching, error }] = useQuery({
    query: ProjectQuery,
    variables: { projectId: "5fa3f227c1c504002259feba" },
  });

  return (
    <Sections>
      <Section>
        <Row>
          <Col>
            <Line>
              <b>No changes</b>
              <PassedIcon icon="passed" />
            </Line>
          </Col>
          <Line>
            <Icon icon="info" />
          </Line>
        </Row>
        <Row>
          <Col>
            <Col>
              <Line>
                <Icon icon="grow" />
                764px
                <ArrowIcon icon="arrowdown" />
              </Line>
            </Col>
            <Col>
              <BrowserButton containsIcon size="small" active>
                <ChromeIcon />
              </BrowserButton>
              <BrowserButton containsIcon size="small">
                <FirefoxIcon />
              </BrowserButton>
              <BrowserButton containsIcon size="small">
                <SafariIcon />
              </BrowserButton>
            </Col>
          </Col>
        </Row>
      </Section>
      <Section>
        <SnapshotImage>
          <img src="https://snapshots.chromatic.com/snapshots/635781f3500dd2c49e189caf-64832b8bd18ba5e2d1e3d32c/capture-16b798d6.png" />
        </SnapshotImage>
      </Section>
    </Sections>
  );
};
