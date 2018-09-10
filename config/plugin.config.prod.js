export default config => {
  config.entryPoints
    .delete('umi')
    .end()
    .entry('index')
    .add('./src/components/Table/index.jsx')
    .end()
    .output.libraryTarget('commonjs2');
};
