// DNS-style label: 1-63 chars, lowercase alphanumeric and hyphens, but
// neither the first nor the last character may be a hyphen.
export const SUBDOMAIN_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export const normalizeSubdomain = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+/, '')
    .replace(/-{2,}/g, '-');

export const finalizeSubdomain = (value: string) => normalizeSubdomain(value).replace(/-+$/, '');

export const isValidSubdomain = (value: string) => SUBDOMAIN_REGEX.test(value);
