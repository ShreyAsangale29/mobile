const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Register .glb/.gltf/.bin as bundled assets so require("...coach.glb") works.
config.resolver.assetExts.push('glb', 'gltf', 'bin');

config.resolver.alias = {
  '@': path.resolve(__dirname, '.'),
};

config.resolver.blockList = [
  /node_modules\/.*\/android\/.*/,
  /node_modules\/.*\/\.cxx\/.*/,
  /android\/app\/build\/.*/,
  /android\/app\/\.cxx\/.*/,
];

module.exports = config;