module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // Must be listed last. Reanimated 4 moved its Babel plugin into react-native-worklets.
  plugins: ['react-native-worklets/plugin'],
};
