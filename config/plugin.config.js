// Change theme plugin
import paths from './paths';
import path from 'path';

export default config => {
  // 将所有 less 合并为一个供 themePlugin使用
  config
    .entry('umi')
    .clear()
    .add(
      path.join(paths.appNodeModules, 'af-webpack/lib/webpackHotDevClient.js'),
    )
    .add('./src/index.js');
};
