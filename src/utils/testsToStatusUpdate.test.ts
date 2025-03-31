import { expect, it } from 'vitest';

import { TestStatus } from '../gql/graphql';
import { testsToStatusUpdate } from './testsToStatusUpdate';

it('handles single test with no changes', () => {
  expect(
    testsToStatusUpdate([
      {
        id: '1',
        status: TestStatus.Passed,
        story: {
          storyId: 'story--id',
        },
      },
    ])
  ).toMatchInlineSnapshot(`
    [
      {
        "description": "Chromatic Visual Tests",
        "storyId": "story--id",
        "title": "Visual tests",
        "typeId": "chromaui/addon-visual-tests",
        "value": "status-value:success",
      },
    ]
  `);
});

it('handles single test with changes', () => {
  expect(
    testsToStatusUpdate([
      {
        id: '1',
        status: TestStatus.Pending,
        story: {
          storyId: 'story--id',
        },
      },
    ])
  ).toMatchInlineSnapshot(`
    [
      {
        "description": "Chromatic Visual Tests",
        "storyId": "story--id",
        "title": "Visual tests",
        "typeId": "chromaui/addon-visual-tests",
        "value": "status-value:warning",
      },
    ]
  `);
});

it('handles multiple tests', () => {
  expect(
    testsToStatusUpdate([
      {
        id: '1',
        status: TestStatus.Pending,
        story: {
          storyId: 'story--id',
        },
      },
      {
        id: '2',
        status: TestStatus.Denied,
        story: {
          storyId: 'story2--id',
        },
      },
    ])
  ).toMatchInlineSnapshot(`
    [
      {
        "description": "Chromatic Visual Tests",
        "storyId": "story--id",
        "title": "Visual tests",
        "typeId": "chromaui/addon-visual-tests",
        "value": "status-value:warning",
      },
      {
        "description": "Chromatic Visual Tests",
        "storyId": "story2--id",
        "title": "Visual tests",
        "typeId": "chromaui/addon-visual-tests",
        "value": "status-value:error",
      },
    ]
  `);
});

it('handles multiple viewports', () => {
  expect(
    testsToStatusUpdate([
      {
        id: '1',
        status: TestStatus.Broken,
        story: {
          storyId: 'story--id',
        },
      },
      {
        id: '2',
        status: TestStatus.Pending,
        story: {
          storyId: 'story--id',
        },
      },
    ])
  ).toMatchInlineSnapshot(`
    [
      {
        "description": "Chromatic Visual Tests",
        "storyId": "story--id",
        "title": "Visual tests",
        "typeId": "chromaui/addon-visual-tests",
        "value": "status-value:error",
      },
    ]
  `);
});

it('handles multiple viewports, reverse order', () => {
  expect(
    testsToStatusUpdate([
      {
        id: '1',
        status: TestStatus.Pending,
        story: {
          storyId: 'story--id',
        },
      },
      {
        id: '2',
        status: TestStatus.Broken,
        story: {
          storyId: 'story--id',
        },
      },
    ])
  ).toMatchInlineSnapshot(`
    [
      {
        "description": "Chromatic Visual Tests",
        "storyId": "story--id",
        "title": "Visual tests",
        "typeId": "chromaui/addon-visual-tests",
        "value": "status-value:error",
      },
    ]
  `);
});
