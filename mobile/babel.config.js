module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@store': './src/store',
            '@api': './src/api',
            '@types': './src/types',
            '@constants': './src/constants',
            '@hooks': './src/hooks',
            '@utils': './src/utils',
          },
        },
      ],
    ],
  };
};
