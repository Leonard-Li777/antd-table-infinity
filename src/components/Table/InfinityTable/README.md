# InfinityTable 

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
