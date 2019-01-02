import React, { Component } from 'react';
import { Spin } from 'antd';
import { InfinityTable as Table } from '../../components/Table';
import { columns, fetchData } from './mockData';

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
        className="custom-classname"
        bordered
        debug
      />
    );
  }
}

export default App;
