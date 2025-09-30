const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const {
  wrapWithAudioAPIMetroConfig,
} = require('react-native-audio-api/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const baseConfig = {};

// Merge default Metro config
const mergedConfig = mergeConfig(getDefaultConfig(__dirname), baseConfig);

// Wrap with Audio API config
module.exports = wrapWithAudioAPIMetroConfig(mergedConfig);
