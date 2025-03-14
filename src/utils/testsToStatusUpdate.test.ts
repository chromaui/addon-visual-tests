import type { API } from 'storybook/manager-api';
import { expect, it, vi } from 'vitest';

import { TestStatus } from '../gql/graphql';
import { testsToStatusUpdate } from './testsToStatusUpdate';

const api: API = {
  setSelectedPanel: vi.fn(),
  togglePanel: vi.fn(),
} as any;

it('handles single test with no changes', () => {
  expect(
    testsToStatusUpdate(api, [
      {
        id: '1',
        status: TestStatus.Passed,
        story: {
          storyId: 'story--id',
        },
      },
    ])
  ).toMatchInlineSnapshot(`
    {
      "story--id": null,
    }
  `);
});

it('handles single test with changes', () => {
  expect(
    testsToStatusUpdate(api, [
      {
        id: '1',
        status: TestStatus.Pending,
        story: {
          storyId: 'story--id',
        },
      },
    ])
  ).toMatchInlineSnapshot(`
    {
      "story--id": {
        "description": "Chromatic Visual Tests",
        "onClick": [Function],
        "status": "warn",
        "title": "Visual tests",
      },
    }
  `);
});

it('handles multiple tests', () => {
  expect(
    testsToStatusUpdate(api, [
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
    {
      "story--id": {
        "description": "Chromatic Visual Tests",
        "onClick": [Function],
        "status": "warn",
        "title": "Visual tests",
      },
      "story2--id": {
        "description": "Chromatic Visual Tests",
        "onClick": [Function],
        "status": "error",
        "title": "Visual tests",
      },
    }
  `);
});

it('handles multiple viewports', () => {
  expect(
    testsToStatusUpdate(api, [
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
    {
      "story--id": {
        "description": "Chromatic Visual Tests",
        "onClick": [Function],
        "status": "error",
        "title": "Visual tests",
      },
    }
  `);
});

it('handles multiple viewports, reverse order', () => {
  expect(
    testsToStatusUpdate(api, [
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
    {
      "story--id": {
        "description": "Chromatic Visual Tests",
        "onClick": [Function],
        "status": "error",
        "title": "Visual tests",
      },
    }
  `);
});
