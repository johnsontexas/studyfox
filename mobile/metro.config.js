// The app imports the website's code straight from ../js (content, question generators, store),
// so Metro has to watch that folder too. One copy of the content serves both the site and the app.
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.watchFolders = [...(config.watchFolders || []), path.resolve(__dirname, '../js')];
module.exports = config;
