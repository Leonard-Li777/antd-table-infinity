[中文](./README.md) | English

# antd-table-infinity
An infinite scroll component based on antd table that supports virtual scrolling & high-performance

>*--by keruyun.com Front End Team*

### Why does this library exist
It is well known that the Antd Table component only has page turning mode, so we need to change it to scroll infinite loading. However, the Antd Table itself is based on `React.Component` extend rather than `PureComponent`, so there are serious performance problems in big data.

Based on virtual scroll technology, we have realized that no matter how much data the table has, the table with the specified number of rows is always rendered, and it has high-performance scroll, which theoretically supports unlimited data and best user experience.

The library is slightly modified and theoretically supports any third-party Table component!


### To Run Example
- `git clone https://github.com/Leonard-Li777/antd-table-infinity.git`
- `yarn install`
- `yarn run storybook`
- check `localhost:9001`

![antd-table-infinity gif demo](./antd-table-infinity-page-table.gif)



### **Compatibility**

**Since antd-table-infinity@1.1.0 add [IntersectionObserver Polyfill](https://github.com/w3c/IntersectionObserver/tree/master/polyfill), compatible across all of the major browsers！！！**

~~The IntersectionObserver is used to improve the rolling listening performance so supports the browser as follows~~

- ~~Chrome 51+~~
- ~~Firefox 61+~~
- ~~Edge 17+~~
- ~~iOS Safari incompatible~~

Use the React new API getDerivedStateFromProps, etc

- React 16.4.0+

### API

# PageTable (Infinity Table with Pagination) 

### Quick Start
---
- `npm install antd-table-infinity`
- `import { PageTable } from 'antd-table-infinity'`;
- `import 'antd-table-infinity/index.css'`;

### Usage
---
antd-table-infinity exposes one module called, `PageTable`, which accepts a few props:

Option              | default       |  Description              
--------------------|---------------|------------------------------------------------
`loading`           |  false        |  loading status
`loadingIndicator`  |  null         |  A visual react component for Loading status
`onFetch`           |  noop         |  Handles the load data event: `function() => void`
`pageSize`          |  30           |  size of a page
`onScroll`          |  null         |  Scroll bar scroll event `function(e) => void`
`pagination`        |  { defaultCurrent: 1 } |  antd Pagination component, but only received: <br/>position: oneOf(['both', 'top', 'bottom']),<br/>className: string,<br/>defaultCurrent: number,<br/>hideOnSinglePage: bool,<br/>itemRender: func,<br/>showQuickJumper: bool,<br/>showTotal: func,<br/>simple: bool,<br/>size: string,<br/>onChange: func, 
`bidirectionalCachePages`             |  Infinity        |  1 ~ maxPage , how many pages cache side by current page
`total`             |  0        |  total of data
`dataSource`             | undefined       |   format: [page, data], get the data of page when fetch success,
`debug`             |  false        |  display console log for debug
...                 |  ...          |  Another Antd Table props
### Code Example
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

## InfinityTable  

### Quick Start
- `npm install antd-table-infinity`
- `import { InfinityTable } from 'antd-table-infinity'`;

### Usage
---
antd-table-infinity exposes one module called, `InfinityTable`, which accepts a few props:

Option              | default       |  Description              
--------------------|---------------|------------------------------------------------
`loading`           |  false        |  loading status
`loadingIndicator`  |  null         |  A visual react component for Loading status
`onFetch`           |  noop         |  Handles the scroll to bottom event: `function() => void`
`pageSize`          |  30           |  Reality DOM row count
`onScroll`          |  null         |  Scroll bar scroll event `function(e) => void`
`debug`             |  false        |  display console log for debug
...                 |  ...          |  Another Antd Table props

### Code Example
---
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
## SumTable （infinity with sum row）
![antd-table-infinity gif demo](./antd-table-infinity.gif)

### Quick Start
- `npm install antd-table-infinity`
- `import { SumTable } from 'antd-table-infinity'`;
- `import 'antd-table-infinity/index.css'`;

### Usage

antd-table-infinity exposes one module called, `SumTable`, which accepts a few props:

Option              | default       |  Description              
--------------------|---------------|------------------------------------------------
`loading`           |  false        |  loading status
`loadingIndicator`  |  null         |  A visual react component for Loading status
`onFetch`           |  noop         |  Handles the scroll to bottom event: `function() => void`
`pageSize`          |  30           |  Reality DOM row count
`sumData`           |  null         |  sum data
`debug`             |  false        |  display console log for debug
...                 |  ...          |  Another Antd Table props

### Code Example
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

### Announcements

1. Antd-table-infinity is the top layer of packaging based on antd table, so when you use it, make sure your project has the antd component library installed
- `import  { InfinityTable, SumTable, PageTable } 'antd-table-infinity'`; JS containing only the Table component
- `import 'antd-table-infinity/index.css'`; CSS containing only the PageTable、SumTable component


2. If your project does not have an antd component library installed, use the full package
- `import { InfinityTable, SumTable, PageTable } from 'antd-table-infinity/dist/index.js'`; Contains all the js code and all the antd-related components used
- `import 'antd-table-infinity/index.css'`; CSS containing only the PageTable、SumTable component
- `import 'antd-table-infinity/dist/index.css'`; Contains all CSS for antd-related components used

3. Import without IntersectionObserver Polyfill

- `import  PageTable 'antd-table-infinity/PageTable'`
- `import  InfinityTable 'antd-table-infinity/InfinityTable'`
- `import  SumTable 'antd-table-infinity/SumTable'`

### Detected problem

- When editing a cell (such as input characters in input, essentially the repeated rendering of Antd Table to receive new props), there are low-performance in development mode, and production environments do not exist! Mainly performance cost from HMR and Redux DevTools.