import { expect, it } from "vitest";

import { TestStatus } from "../gql/graphql";
import { testsToStatusUpdate } from "./testsToStatusUpdate";

it("handles single test with no changes", () => {
  expect(
    testsToStatusUpdate([
      {
        id: "1",
        status: TestStatus.Passed,
        story: {
          storyId: "story--id",
        },
      },
    ])
  ).toMatchInlineSnapshot(`
    {
      "story--id": null,
    }
  `);
});

it("handles single test with changes", () => {
  expect(
    testsToStatusUpdate([
      {
        id: "1",
        status: TestStatus.Pending,
        story: {
          storyId: "story--id",
        },
      },
    ])
  ).toMatchInlineSnapshot(`
    {
      "story--id": {
        "description": "Chromatic Visual Tests",
        "status": "warn",
        "title": "Visual Tests",
      },
    }
  `);
});

it("handles multiple tests", () => {
  expect(
    testsToStatusUpdate([
      {
        id: "1",
        status: TestStatus.Pending,
        story: {
          storyId: "story--id",
        },
      },
      {
        id: "2",
        status: TestStatus.Denied,
        story: {
          storyId: "story2--id",
        },
      },
    ])
  ).toMatchInlineSnapshot(`
    {
      "story--id": {
        "description": "Chromatic Visual Tests",
        "status": "warn",
        "title": "Visual Tests",
      },
      "story2--id": {
        "description": "Chromatic Visual Tests",
        "status": "error",
        "title": "Visual Tests",
      },
    }
  `);
});

it("handles multiple viewports", () => {
  expect(
    testsToStatusUpdate([
      {
        id: "1",
        status: TestStatus.Broken,
        story: {
          storyId: "story--id",
        },
      },
      {
        id: "2",
        status: TestStatus.Pending,
        story: {
          storyId: "story--id",
        },
      },
    ])
  ).toMatchInlineSnapshot(`
    {
      "story--id": {
        "description": "Chromatic Visual Tests",
        "status": "error",
        "title": "Visual Tests",
      },
    }
  `);
});

it("handles multiple viewports, reverse order", () => {
  expect(
    testsToStatusUpdate([
      {
        id: "1",
        status: TestStatus.Pending,
        story: {
          storyId: "story--id",
        },
      },
      {
        id: "2",
        status: TestStatus.Broken,
        story: {
          storyId: "story--id",
        },
      },
    ])
  ).toMatchInlineSnapshot(`
    {
      "story--id": {
        "description": "Chromatic Visual Tests",
        "status": "error",
        "title": "Visual Tests",
      },
    }
  `);
});
