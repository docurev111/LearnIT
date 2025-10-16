const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add .obj file extension support
config.resolver.assetExts.push('obj');
// Add .glb and .gltf support for glTF binary/JSON assets used by the app
config.resolver.assetExts.push('glb');
config.resolver.assetExts.push('gltf');

module.exports = config;
