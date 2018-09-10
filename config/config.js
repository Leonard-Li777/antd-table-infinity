// https://umijs.org/config/
import webpackplugin from './plugin.config';

export default {
  // add for transfer to umi
  chainWebpack: webpackplugin,
  plugins: [
    [
      'umi-plugin-react',
      {
        antd: true,
      },
    ],
  ],
  disableCSSModules: true,
};
