// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Speed up development by reducing expensive minification options.
config.transformer.minifierConfig = {
  compress: false,
  mangle: false,
};

// Keep resolver defaults but allow further customizations later
config.resolver = config.resolver || {};

module.exports = config;
