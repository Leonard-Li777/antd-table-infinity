import { bool, number, array, object, func } from 'prop-types';
import { Table } from 'antd';
import { noop } from 'lodash-es';
import React from 'react';
import ReactDOM from 'react-dom';

import InfinityTable from '../InfinityTable';


class SumTable extends React.Component {
  componentDidMount() {
    /* eslint-disable */
    this.refFooter = ReactDOM.findDOMNode(this.refTable.current)
      .getElementsByClassName('ant-table-footer')[0]
      .getElementsByClassName('ant-table-body')[0];
    /* eslint-enabled */
  }
  refFooter = null;
  refTable = React.createRef();

  syncScrollFooter = target => {
    this.refFooter.scrollTo(target.scrollLeft, 0);
  };

  footerRender = () => {
    if (this.props.sumData) {
      const { sumData, columns, scroll } = this.props;
      return (
        <Table
          columns={columns}
          dataSource={sumData}
          pagination={false}
          showHeader={false}
          scroll={scroll}
        />
      );
    }
  };
  handleInfinityTableScroll = e => {
    this.props.sumData && this.syncScrollFooter(e.target);
  };
  render() {
    const dataSource = this.props.dataSource.map((data, index) => {
      data.index = index;
      return data;
    });

    return (
      <InfinityTable
        {...this.props}
        ref={this.refTable}
        useFixedHeader
        dataSource={dataSource}
        onScroll={this.handleInfinityTableScroll}
        footer={this.footerRender}
        className="sum-table"
      />
    );
  }
}

SumTable.defaultProps = {
  onScroll: null, // 滚动事件
  onFetch: noop, // 滚动到低部触发Fetch方法
  sumData: null, // 合计行
  debug: false, // display console log for debug
  loading: false, // 是否loading状态
  pageSize: 30, // 真实DOM大小，Reality DOM row count
};

SumTable.propTypes = {
  // loading 效果
  onScroll: func, // 滚动事件
  onFetch: func, // 滚动到低部触发Fetch方法
  sumData: array.isRequired, // 合计行
  dataSource: array.isRequired,
  columns: object.isRequired,
  forwardedRef: func.isRequired,
  debug: bool,
  pageSize: number,
  loading: bool,
};

export default SumTable;
