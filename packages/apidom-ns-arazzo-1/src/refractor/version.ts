/**
 * Fields introduced after Arazzo 1.0, keyed by the specification object that owns them.
 * Anything not listed here is available in every 1.x version.
 * @public
 */
export const fieldsSince: Record<string, Record<string, string>> = {
  ArazzoSpecification: { $self: '1.1.0' },
  Step: {
    channelPath: '1.1.0',
    timeout: '1.1.0',
    correlationId: '1.1.0',
    action: '1.1.0',
    dependsOn: '1.1.0',
  },
  PayloadReplacement: { targetSelectorType: '1.1.0' },
};

const VERSION_RE = /^(\d+)\.(\d+)(?:\.(\d+))?/;

const parse = (version: string): number[] | undefined => {
  const match = VERSION_RE.exec(version);
  return match ? [Number(match[1]), Number(match[2]), Number(match[3] ?? 0)] : undefined;
};

/**
 * Whether a feature introduced in `since` is available in document `version`.
 * A missing or unparsable document version is treated as the latest one, so nothing is gated.
 * @public
 */
export const isAvailable = (version: string | undefined, since: string): boolean => {
  const actual = version === undefined ? undefined : parse(version);
  const required = parse(since);
  if (!actual || !required) return true;
  for (let i = 0; i < 3; i += 1) {
    if (actual[i] !== required[i]) return actual[i] > required[i];
  }
  return true;
};
