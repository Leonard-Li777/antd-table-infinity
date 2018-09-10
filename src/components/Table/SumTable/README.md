# SumTable （infinity with sum row） 


### Quick Start
- `npm install antd-table-infinity`
- `import { SumTable } from 'antd-table-infinity'`;
- `import 'antd-table-infinity/index.css'`;

### Usage

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