import React, { Component } from 'react';
import { PageTable as Table } from '../../components/Table';
import { columns } from './mockData';

import { random } from 'lodash';


const total = 5000;

const fetchData = (startIndex, pageSize) =>
  new Promise(resolve => {
    setTimeout(() => {
      if (startIndex >= total) {
        resolve([]);
      } else {
        let size = pageSize;
        if (startIndex + pageSize >= total) {
          size = total - startIndex;
        }
        resolve(
          Array.from({ length: size }).map((_, i) => {
            // 每次返回100条
            const index = startIndex + i;
            return {
              key: getGuid(),
              index: `${index}`,
              name: 'John Brown',
              age: 32,
              address: 'New York No. 1 Lake Park',
            };
          }),
        );
      }
    }, random(0, 1.0) * 1000);
  });

const getGuid = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    /* eslint-disable */
    let r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

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
        key="key"
        className="custom-classname"
        pagination={{
          position: 'bottom',
          defaultCurrent: 21,
          size: 'small',
          className: 'custom-classname-pagination',
        }}
        loading={loading}
        onFetch={this.handleFetch}
        pageSize={100}
        bidirectionalCachePages={1}
        total={total}
        size="small"
        dataSource={[page, data]}
        columns={columns}
        scroll={{ x: 2500, y: 600 }}
        bordered
        debug
      />
    );
  }
}

export default App;
