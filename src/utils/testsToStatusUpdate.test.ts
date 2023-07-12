import { TestStatus } from "../gql/graphql";
import { testsToStatusUpdate } from "./testsToStatusUpdate";

it("handles single test", () => {
  expect(
    testsToStatusUpdate([
      {
        status: TestStatus.Passed,
        story: {
          storyId: "story--id",
        },
      },
    ])
  ).toMatchInlineSnapshot(`
    {
      "story--id": {
        "description": "Chromatic Visual Tests",
        "status": "success",
        "title": "Visual Tests",
      },
    }
  `);
});

it("handles multiple tests", () => {
  expect(
    testsToStatusUpdate([
      {
        status: TestStatus.Pending,
        story: {
          storyId: "story--id",
        },
      },
      {
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
        status: TestStatus.Broken,
        story: {
          storyId: "story--id",
        },
      },
      {
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
        status: TestStatus.Pending,
        story: {
          storyId: "story--id",
        },
      },
      {
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
