module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      ["module:react-native-dotenv", {
        "envName": "APP_ENV",
        "moduleName": "@env",
        "path": ".env",
        "safe": true,
        "allowUndefined": false,
        "verbose": false
      }],
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './',
            '@/components': './components',
            '@/constants': './constants',
            '@/utils': './utils',
            '@/assets': './assets'
          }
        }
      ]
    ]
  };
};
