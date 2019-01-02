import React, { Component } from 'react';
import { SumTable as Table } from '../../components/Table';
import { columns, fetchData, sumData } from './mockData';

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
        className="custom-classname"
        bordered
        debug
      />
    );
  }
}

export default App;
