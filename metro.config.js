const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  // Release builds on Windows run from a short mapped drive (see scripts/build-release.mjs),
  // but some files still resolve through the real project path; let Metro watch both.
  watchFolders: process.env.PROJECT_REAL_ROOT
    ? [process.env.PROJECT_REAL_ROOT]
    : [],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
