import React, { PureComponent, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { element, bool, number, array, object, func } from 'prop-types';
import { Table, Spin } from 'antd';
import throttle from 'lodash.throttle';

const noop = () => {};
const computeState = (
  { pageSize },
  { direction, scrollTop, scrollHeight, tableHeight, visibleHeight, size },
) => {
  if (scrollHeight === 0) {
    return {
      startIndex: 0,
      underHeight: 0,
      upperHeight: 0,
    };
  }
  const rowHeight = tableHeight / pageSize;
  const visibleRowCount = Math.round(visibleHeight / rowHeight);
  let startIndex = Math.round((scrollTop / scrollHeight) * size);

  if (direction === 'up') {
    startIndex -= pageSize - visibleRowCount;
    startIndex = startIndex < 0 ? 0 : startIndex;
  } else {
    startIndex = startIndex + pageSize > size ? size - pageSize : startIndex;
  }

  const underHeight = Math.round((size - (startIndex + pageSize)) * rowHeight);

  startIndex = startIndex > 0 ? startIndex : 0;
  const upperHeight = Math.round(startIndex * rowHeight);

  return {
    visibleRowCount,
    startIndex,
    underHeight,
    upperHeight,
  };
};

class InfinityTable extends PureComponent {
  static PlaceHolder({ height, domNode, loading, loadingIndicator }) {
    return (
      domNode &&
      ReactDOM.createPortal(
        <div style={{ height: `${height}px` }}>
          {loading && loadingIndicator}{' '}
        </div>,
        domNode,
      )
    );
  }
  state = {
    size: 0, // 缓存的数据集大小
    scrollTop: 0, // 滚动条位置
    scrollHeight: 0, // 滚动总高度
    tableHeight: 0, // antd 表格高度（DOM上的数据集高度）
    visibleHeight: 0, // 可视区域高度
    visibleRowCount: 0, // 可视区域行数
    startIndex: 0, // DOM上的数据集起始索引
    underHeight: 0, // 下撑高
    upperHeight: 0, // 上撑高
    isPropsChange: false, // 是否是props改变
  };
  static getDerivedStateFromProps(
    { pageSize, dataSource: { length }, loading },
    prevState,
  ) {
    const {
      tableHeight,
      scrollHeight: prevStateScrollHeight,
      visibleRowCount,
      size,
    } = prevState;

    if (pageSize < visibleRowCount) {
      console.warn(
        `pagesize(${pageSize}) less than visible row count(${visibleRowCount}), maybe you set error!`,
      );
    }

    const rowHeight = tableHeight / pageSize;

    const increase = length - size;

    let scrollHeight = Math.round(prevStateScrollHeight + increase * rowHeight);
    if (!loading) {
      scrollHeight = length * rowHeight;
    }

    if (pageSize < increase) {
      console.warn(
        `increase(${increase}) greater than pageSize(${pageSize}) that will cause the scroll bar shake, maybe you set error! `,
      );
    }
    return {
      ...computeState(
        { pageSize },
        Object.assign(prevState, {
          size: length,
          scrollHeight,
        }),
      ),
      isPropsChange: true,
    };
  }

  componentDidMount() {
    /* eslint-disable */
    this.refScroll = ReactDOM.findDOMNode(this).getElementsByClassName(
      'ant-table-body',
    )[0];
    this.refTable = this.refScroll.getElementsByTagName('tbody')[0];
    /* eslint-enabled */
    this.createUnderPlaceholder();
    this.createUpperPlaceholder();

    this.setStateWithThrottle = throttle(this.updateTable, 200);
    this.props.onScroll &&
      this.refScroll.addEventListener('scroll', this.props.onScroll);

    if (this.refScroll) {
      this.io = new IntersectionObserver(
        changes => {
          this.refScroll.removeEventListener(
            'scroll',
            this.setStateWithThrottle,
          );
          if (
            this.state.scrollTop &&
            Math.abs(this.refScroll.scrollTop - this.state.scrollTop) < 20
          ) {
            // fix bug: 如果滚动步长小于20象素不做处理
            // console.log('scroll step less than 20px', this.refScroll.scrollTop - this.state.scrollTop);
            return;
          }
          this.ioTargetState = changes.reduce((result, change) => {
            const ret = { ...result };
            switch (change.target) {
              case this.refUnderPlaceholder:
                ret.refUnderPlaceholder = change;
                break;
              case this.refUpperPlaceholder:
                ret.refUpperPlaceholder = change;
                break;
              case this.refTable:
                ret.refTable = change;
                break;
              default:
                console.warn('Miss match dom', change);
            }
            return ret;
          }, this.ioTargetState);

          let mutation = 'cache scrolling';
          const {
            refUnderPlaceholder,
            refUpperPlaceholder,
            refTable,
          } = this.ioTargetState;
          const { startIndex, visibleRowCount, size } = this.state;
          const { loading, pageSize } = this.props;

          if (refUnderPlaceholder.intersectionRatio > 0) {
            if (
              refTable.intersectionRatio > 0 &&
              startIndex + pageSize + visibleRowCount >= size &&
              !loading
            ) {
              // 已滚动到最后，加载数据
              mutation = 'end';
              if (this.props.debug) {
                console.log(mutation);
              }
              return this.setState(
                {
                  scrollTop: this.refScroll.scrollTop,
                  scrollHeight: this.refScroll.scrollHeight,
                  tableHeight: this.refTable.clientHeight,
                },
                this.props.onFetch,
              );
              // mutation = 'fastEnd'; // 滚动到最后，但数据已经加载完
            } else if (refTable.intersectionRatio > 0) {
              mutation = 'down'; // 滚动到显示的数据未尾
            } else if (refTable.intersectionRatio === 0) {
              mutation = 'fastDown'; // 滚动到没有任何数据显示的区域
            }
          } else if (refUpperPlaceholder.intersectionRatio > 0) {
            if (refUpperPlaceholder.intersectionRatio === 1) {
              mutation = 'top'; // 滚动到顶了
            } else if (refTable.intersectionRatio > 0) {
              mutation = 'up'; // 滚动到显示的数据头部
            } else if (refTable.intersectionRatio === 0) {
              mutation = 'fastUp'; // 滚动到没有任何数据显示的区域
            }
          } else if (refTable.intersectionRatio === 0) {
            if (this.props.debug) {
              console.log(
                'Bug: IntersectionObserver miss, because which waiting for Idle trigger',
              );
            }
            // fix bug: 重新触发，获取正确值
            this.toggleObserver(false);
            this.toggleObserver();
            return;
          }
          if (this.props.debug) {
            console.log(mutation);
          }
          if (mutation.includes('fast')) {
            this.refScroll.addEventListener(
              'scroll',
              this.setStateWithThrottle,
            );
          }
          this.setStateWithThrottle();
        },
        {
          root: this.refScroll,
        },
      );
      this.toggleObserver();
    }
  }
  componentWillUnmount() {
    this.props.onScroll &&
      this.refScroll.removeEventListener('scroll', this.props.onScroll);
    this.refScroll.removeEventListener('scroll', this.setStateWithThrottle);
    this.io.disconnect();
  }

  refUpperPlaceholder = null;
  refUnderPlaceholder = null;
  refScroll = null;
  refTable = null;
  refFooter = null;

  ioTargetState = {
    refUnderPlaceholder: null,
    refUpperPlaceholder: null,
    refTable: null,
  };
  // 创建底部填充块
  createUnderPlaceholder() {
    const refUnderPlaceholder = document.createElement('div');
    refUnderPlaceholder.setAttribute('id', 'refUnderPlaceholder');
    this.refScroll.appendChild(refUnderPlaceholder);
    this.refUnderPlaceholder = refUnderPlaceholder;
  }

  // 创建顶部填充块
  createUpperPlaceholder() {
    const refUpperPlaceholder = document.createElement('div');
    refUpperPlaceholder.setAttribute('id', 'refUpperPlaceholder');
    this.refScroll.insertBefore(refUpperPlaceholder, this.refScroll.firstChild);
    this.refUpperPlaceholder = refUpperPlaceholder;
  }

  updateTable = () => {
    const { clientHeight: tableHeight } = this.refTable;
    const { scrollHeight, clientHeight: visibleHeight } = this.refScroll;
    const { isPropsChange } = this.state;

    if (!isPropsChange) {
      // fix bug: 当直接传入的dataSource数据量很大，无法滚动的问题。常见于不是按每页大小递增的情况，如1000条已有数据不需loading直接虚拟滚动显示的时候
      // 如果 isPropsChange === true 则下面的情况是合理的，不能退出state计算，要求重新计算
      if (
        // fix bug: 可能存在DOM更新时空白的情况，此种无效状态，需要过虑掉， （tableHeight 是很大的值，而this.state.tableHeight只是一个初始小值）
        (this.state.tableHeight &&
          Math.abs(tableHeight - this.state.tableHeight) > 200) || // 容许正常误差
        (this.state.scrollHeight &&
          Math.abs(scrollHeight - this.state.scrollHeight) > 200) ||
        (this.state.visibleHeight && visibleHeight !== this.state.visibleHeight)
      ) {
        if (this.props.debug) {
          console.log({
            visibleHeight,
            'this.state.visibleHeight': this.state.visibleHeight,
          });
          console.log({
            tableHeight,
            'this.state.tableHeight': this.state.tableHeight,
          });
          console.log({
            scrollHeight,
            'this.state.scrollHeight': this.state.scrollHeight,
          });
        }
        return;
      }
    }

    this.setState(
      {
        ...computeState(
          this.props,
          Object.assign(this.state, {
            direction:
              this.refScroll.scrollTop - this.state.scrollTop < 0
                ? 'up'
                : 'down',
            scrollTop: this.refScroll.scrollTop,
            visibleHeight,
            scrollHeight,
            tableHeight,
          }),
        ),
        isPropsChange: false,
      },
      // () => console.log('computeState done', this.state),
    );
  };

  toggleObserver(condition = true) {
    if (condition) {
      this.io.observe(this.refUpperPlaceholder);
      this.io.observe(this.refUnderPlaceholder);
      this.io.observe(this.refTable);
    } else {
      this.io.unobserve(this.refUpperPlaceholder);
      this.io.unobserve(this.refUnderPlaceholder);
      this.io.unobserve(this.refTable);
    }
  }

  render() {
    const {
      dataSource,
      pageSize,
      loadingIndicator,
      forwardedRef,
      loading,
      columns,
      ...rest
    } = this.props;
    const { startIndex, upperHeight, underHeight } = this.state;

    return (
      <Fragment>
        <InfinityTable.PlaceHolder
          height={upperHeight}
          domNode={this.refUpperPlaceholder}
        />
        <InfinityTable.PlaceHolder
          height={underHeight}
          domNode={this.refUnderPlaceholder}
          loading={loading}
          loadingIndicator={loadingIndicator}
        />
        <Table
          rowKey={record => record.key}
          {...rest}
          ref={forwardedRef}
          columns={columns}
          dataSource={dataSource.slice(startIndex, startIndex + pageSize)}
          pagination={false}
        />
      </Fragment>
    );
  }
}
InfinityTable.defaultProps = {
  // loading 效果， A visual react component for Loading status
  loadingIndicator: (
    <div
      style={{
        textAlign: 'center',
        paddingTop: 20,
        paddingBottom: 20,
        border: '1px solid #e8e8e8',
      }}
    >
      <Spin tip="Loading..." />
    </div>
  ),
  onScroll: null, // 滚动事件
  onFetch: noop, // 滚动到低部触发Fetch方法
  sumData: null, // 合计行
  debug: false, // display console log for debug
  loading: false, // 是否loading状态
  pageSize: 30, // 真实DOM大小，Reality DOM row count
};

InfinityTable.propTypes = {
  // loading 效果
  loadingIndicator: element,
  onScroll: func, // 滚动事件
  onFetch: func, // 滚动到低部触发Fetch方法
  sumData: array, // 合计行
  dataSource: array.isRequired,
  columns: array.isRequired,
  forwardedRef: object,
  debug: bool,
  pageSize: number,
  loading: bool,
};

export default React.forwardRef((props, ref) => (
  <InfinityTable {...props} forwardedRef={ref} />
));

export { InfinityTable }