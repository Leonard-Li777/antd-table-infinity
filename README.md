中文 | [English](./README_en.md)

# antd-table-infinity

一个基于 Antd Table 的无限滚动加载表格组件，不同普通无限滚动方案，它使用了虚拟滚动技术，拥有无可比拟的高性能！

>*--by 客如云（keruyun.com）前端团队*

### **为什么会有这个库?**
众所周知，Antd Table 组件只有翻页模式，我们需要将其改为滚动无限加载，但是 Antd Table 其本身是基于React.Component继承的，而非PureComponent，所以在大数据下存在严重的性能问题。

基于虚拟滚动技术，我们实现了无论表格有多少数据，始终只render指定行数的表格，拥有了高性能滚动，理论上支持无限量数据，拥有最佳用户体验。

本库稍加改动理论上也支任意第三方表格组件！

### **运行演示**
- `git clone https://github.com/Leonard-Li777/antd-table-infinity.git`
- `yarn install`
- `yarn run storybook`
- check `localhost:9001`

![antd-table-infinity gif demo](./antd-table-infinity-page-table.gif)

### **兼容说明**

**自从 antd-table-infinity@1.1.0 添加了 [IntersectionObserver Polyfill](https://github.com/w3c/IntersectionObserver/tree/master/polyfill), 现在兼容所有主流浏览器！！！**

~~由于使用了 IntersectionObserver 提高滚动监听性能，支持浏览器如下~~

- ~~Chrome 51+~~
- ~~Firefox 61+~~
- ~~Edge 17+~~
- ~~iOS Safari 不兼容~~

使用了 React 新的 API getDerivedStateFromProps 等

- React 16.4.0+



### API 说明
---

# PageTable 

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
`pagination`        |  { defaultCurrent: 1 } |  antd 组件 Pagination, 但仅接受如下Props: <br/>position: oneOf(['both', 'top', 'bottom']),<br/>className: string,<br/>defaultCurrent: number,<br/>hideOnSinglePage: bool,<br/>itemRender: func,<br/>showQuickJumper: bool,<br/>showTotal: func,<br/>simple: bool,<br/>size: string,<br/>onChange: func, 
`bidirectionalCachePages`             |  Infinity        |  1 ~ maxPage ，当前页附近双向缓存的页数，最小为1，最大为maxPage，Infinity相当于maxPage
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
## InfinityTable （无限滚动组件）
### 快速开始
- `npm install antd-table-infinity`
- `import { InfinityTable } from 'antd-table-infinity'`;

### 使用方法
antd-table-infinity 导出一个模块 `InfinityTable`, 它接收如下props:

Option               | default       | Description              
---------------------|---------------|-----------------------------------------------
`loading`            |  false        | 表示加载状态，展示loading效果
`loadingIndicator`   |  null         | 自定义一个react组件去展示loading动画，否则使用内置动画
`onFetch`            |  noop         | 滚动到底部事件回调，Fetch数据: `function() => void`
`pageSize`           |  30           | 表格实际render行数
`onScroll`           |  null         | 滚动事件监听 `function(e) => void`
`debug`              |  false        | 是否显示Debug console.log信息
...                  |  ...          | 其它 Antd Table Props

### 示例代码 
``` javascript
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Spin } from 'antd';
import { InfinityTable as Table } from 'antd-table-infinity';
import { columns, fetchData } from './stories/Table/mockData';

class App extends Component {
  state = {
    data: [],
    loading: false,
  };
  handleFetch = () => {
    console.log('loading');
    this.setState({ loading: true });
    fetchData(this.state.data.length).then(newData =>
      this.setState(({ data }) => ({
        loading: false,
        data: data.concat(newData),
      })),
    );
  };

  loadMoreContent = () => (
    <div
      style={{
        textAlign: 'center',
        paddingTop: 40,
        paddingBottom: 40,
        border: '1px solid #e8e8e8',
      }}
    >
      <Spin tip="Loading..." />
    </div>
  );

  render() {
    return (
      <Table
        key="key"
        loading={this.state.loading}
        onFetch={this.handleFetch}
        pageSize={100}
        loadingIndicator={this.loadMoreContent()}
        columns={columns}
        scroll={{ y: 450 }}
        dataSource={this.state.data}
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

---
## SumTable （无限滚动组件, 带合计行）

![antd-table-infinity gif demo](./antd-table-infinity.gif)

### 快速开始
- `npm install antd-table-infinity`
- `import { SumTable } from 'antd-table-infinity'`;
- `import 'antd-table-infinity/index.css'`;

### 使用方法
antd-table-infinity 导出一个模块 `SumTable`, 它接收如下props:

Option               | default       | Description              
---------------------|---------------|-----------------------------------------------
`loading`            |  false        | 表示加载状态，展示loading效果
`loadingIndicator`   |  null         | 自定义一个react组件去展示loading动画，否则使用内置动画
`onFetch`            |  noop         | 滚动到底部事件回调，Fetch数据: `function() => void`
`pageSize`           |  30           | 表格实际render行数
`sumData`            |  null         | 合计行数据
`debug`              |  false        | 是否显示Debug console.log信息
...                  |  ...          | 其它 Antd Table Props

### 示例代码 
``` javascript
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Spin } from 'antd';
import { SumTable as Table } from 'antd-table-infinity';
import { columns, fetchData } from './stories/Table/mockData';
import 'antd-table-infinity/index.css';

class App extends Component {
  state = {
    data: [],
    loading: false,
  };
  handleFetch = () => {
    console.log('loading');
    this.setState({ loading: true });
    fetchData(this.state.data.length).then(newData =>
      this.setState(({ data }) => ({
        loading: false,
        data: data.concat(newData),
      })),
    );
  };

  render() {
    return (
      <Table
        key="key"
        loading={this.state.loading}
        onFetch={this.handleFetch}
        pageSize={100}
        sumData={sumData}
        size="small"
        columns={columns}
        scroll={{ x: 2500, y: 350 }}
        dataSource={this.state.data}
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
---

### 注意事项

1. antd-table-infinity是基于Antd Table的上一层封装，因此使用的时候，确保你的项目已安装antd组件库
- `import  { InfinityTable, SumTable, PageTable } 'antd-table-infinity'`; 只包含表格组件的代码
- `import 'antd-table-infinity/index.css'`; 只包含PageTable、SumTable组件的css


2. 如果你的项目没有安装 antd 组件库, 请使用全量打包文件
- `import { InfinityTable, SumTable, PageTable } from 'antd-table-infinity/dist/index.js'`; 包含所有代码及使用到的antd相关组件的所有代码
- `import 'antd-table-infinity/index.css'`; 只包含PageTable、SumTable组件的css
- `import 'antd-table-infinity/dist/index.css'`; 包含使用到的antd相关组件的所有css

3. 不包含IntersectionObserver Polyfill的导入

- `import  PageTable 'antd-table-infinity/PageTable'`
- `import  InfinityTable 'antd-table-infinity/InfinityTable'`
- `import  SumTable 'antd-table-infinity/SumTable'`


### 已发现问题

- 当做单元格编辑功能的时候（如在input中连继输入字符，本质上是 Antd Table 接收新的props的反复渲染）,在开发模式下会存在性能问题，生产环境不会存在！主要是来自 HMR 和 Redux DevTools的性能消耗。