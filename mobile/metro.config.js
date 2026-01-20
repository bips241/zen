// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Speed up development by reducing expensive minification options.
config.transformer.minifierConfig = {
  compress: false,
  mangle: false,
};

// Enable SVG transformer
config.transformer.babelTransformerPath = require.resolve(
  "react-native-svg-transformer",
);

// Keep resolver defaults but allow further customizations later
config.resolver = config.resolver || {};
config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== "svg",
);
config.resolver.sourceExts = [...config.resolver.sourceExts, "svg"];

module.exports = config;
