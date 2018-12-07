中文 | [English](./README_en.md)

# PageTable 

![PageTable Demo](../../../../antd-table-infinity-page-table.gif "PageTable Demo")
### 快速开始
---
- `npm install antd-table-infinity`
- `import { PageTable } from 'antd-table-infinity'`;

### 使用方法
---
antd-table-infinity 导出一个模块 `PageTable`, 它接收如下props:

Option               | default       | Description              
---------------------|---------------|-----------------------------------------------
`loading`            |  false        | 表示加载状态，展示loading效果
`loadingIndicator`   |  null         | 自定义一个react组件去展示loading动画，否则使用内置动画
`onFetch`            |  noop         | 加载数据，Fetch数据: `function({page, pageSize}) => void`
`pageSize`           |  30           | 每页数据行数
`onScroll`           |  null         | 滚动事件监听 `function(e) => void`
`pagination`        |  { defaultCurrent: 1 } |  antd 组件 Pagination, 但仅接受如下Props: <br/>position: oneOf(['both', 'top', 'bottom']),<br/>className: string,<br/>defaultCurrent: number,<br/>hideOnSinglePage: bool,<br/>itemRender: func,<br/>showQuickJumper: bool,<br/>showTotal: func,<br/>simple: bool,<br/>size: string,<br/>onChange: func, 
`bidirectionalCachePages`             |  Infinity        |  1 ~ maxPage ，当前页附近缓存的页数，最小为1，最大为maxPage，Infinity相当于maxPage
`total`             |  0        |  数据总条数
`dataSource`             | undefined       |   格式: [page, data], 当fetch成功，传递给组件的页码和数据
`debug`              |  false        | 是否显示Debug console.log信息
...                  |  ...          | 其它 Antd Table Props

### 示例代码
---

``` javascript
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Spin } from 'antd';
import { PageTable as Table } from 'antd-table-infinity';
import { columns, fetchData } from './stories/Table/mockData';

class App extends Component {
  state = {
    page: 1,
    data: [],
    loading: false,
  };
  handleFetch = ({ page, pageSize }) => {
    console.warn('loading', { page, pageSize });

    const startIndex = (page - 1) * pageSize;

    this.setState({ loading: true });
    fetchData(startIndex, pageSize).then(data =>
      this.setState({
        loading: false,
        data,
        page,
      }),
    );
  };

  render() {
    const { page, data, loading } = this.state;

    return (
      <Table
        className="custom-classname"
        pagination={{
          position: 'both',
          defaultCurrent: 21,
          className: 'custom-classname-pagination',
        }}
        loading={loading}
        onFetch={this.handleFetch}
        pageSize={100}
        bidirectionalCachePages={1}
        total={total}
        dataSource={[page, data]}
        columns={columns}
        scroll={{ x: 2500, y: 650 }}
        bordered
        debug
      />
    );
  }
}

ReactDOM.render(
    <App />,
  document.getElementById('root')
);
```
