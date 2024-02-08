import { formatDistanceToNowStrict } from "date-fns";
import locale from "date-fns/locale/en-US";

const formatDistanceLocale: Record<string, string> = {
  lessThanXSeconds: "just now",
  xSeconds: "just now",
  halfAMinute: "just now",
  lessThanXMinutes: "{{count}}m",
  xMinutes: "{{count}}m",
  aboutXHours: "{{count}}h",
  xHours: "{{count}}h",
  xDays: "{{count}}d",
  aboutXWeeks: "{{count}}w",
  xWeeks: "{{count}}w",
  aboutXMonths: "{{count}}mo",
  xMonths: "{{count}}mo",
  aboutXYears: "{{count}}y",
  xYears: "{{count}}y",
  overXYears: "{{count}}y",
  almostXYears: "{{count}}y",
};

function formatDistance(
  token: string,
  count: string,
  options: { addSuffix: boolean; comparison: number } = {
    addSuffix: false,
    comparison: 0,
  }
) {
  const result = formatDistanceLocale[token].replace("{{count}}", count);

  if (["lessThanXSeconds", "xSeconds", "halfAMinute"].includes(token)) {
    return `${result}`;
  }

  if (options.addSuffix) {
    if (options.comparison > 0) {
      return `in ${result}`;
    }
    return `${result} ago`;
  }

  return result;
}

export const formatDate = (date: number) =>
  formatDistanceToNowStrict(date, {
    addSuffix: true,
    locale: {
      ...locale,
      formatDistance,
    },
  });
