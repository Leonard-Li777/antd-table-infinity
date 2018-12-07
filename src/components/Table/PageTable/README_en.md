[中文](./README.md) | English

# PageTable 

![PageTable Demo](../../../../antd-table-infinity-page-table.gif "PageTable Demo")
### Quick Start
---
- `npm install antd-table-infinity`
- `import { PageTable } from 'antd-table-infinity'`;

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
`pagination`        |  { defaultCurrent: 1 } |  antd Pagination component, but only received: <br/>position: oneOf(['both', 'top', 'bottom']),<br/>className: string,<br/>defaultCurrent: number,<br/>hideOnSinglePage: bool,<br/>itemRender: func,<br/>showQuickJumper: bool,<br/>showTotal: func,<br/>simple: bool,<br/>size: string,<br/>onChange: func, 
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
