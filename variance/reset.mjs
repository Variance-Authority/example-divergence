import { resetCaptures } from '@variance-authority/unit-test';

/**
 * Clear last run's captures, once, before any test file opens.
 *
 * A capture directory is meant to hold one run, so that two tests claiming the
 * same subject id is an error rather than a silent overwrite.
 */
export async function setup() {
  await resetCaptures('.variance/captures');
}
