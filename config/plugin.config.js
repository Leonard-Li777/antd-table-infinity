// Change theme plugin
import paths from './paths';
import path from 'path';

export default config => {
  // 将所有 less 合并为一个供 themePlugin使用
  config
    .entryPoints
    .delete('umi')
    .end()
    .entry('index')
    .add(
      path.join(paths.appNodeModules, 'af-webpack/lib/webpackHotDevClient.js'),
    )
    .add('./src/components/Table/index.jsx');
  console.log(config.toConfig());
};
