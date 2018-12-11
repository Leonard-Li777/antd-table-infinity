import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import {
  element,
  string,
  bool,
  number,
  array,
  object,
  func,
  oneOfType,
  oneOf,
  shape,
} from 'prop-types';
import { Table, Spin, Pagination } from 'antd';
import throttle from 'lodash.throttle';

const noop = () => {};

const fetchDebounce = (() => {
  const loading = [];
  return ({ page, pageSize, onFetch }) => {
    const now = Date.now();
    if (!loading[page] || (loading[page] && now - loading[page] > 1000)) {
      onFetch({ page, pageSize });
    }
    loading[page] = now;
  };
})();

function getCachePage({
  step,
  maxPage,
  pageSize,
  onFetch,
  loading,
  cacheData,
  currentPage,
}) {
  const pageBefore = currentPage - step;
  const pageAfter = currentPage + step;
  const cachePageDataBefore = cacheData[pageBefore];
  const cachePageData = cacheData[currentPage];
  const cachePageDataAfter = cacheData[pageAfter];
  if (!loading) {
    !cachePageData &&
      currentPage > 0 &&
      currentPage <= maxPage &&
      fetchDebounce({ page: currentPage, pageSize, onFetch });
    !cachePageDataBefore &&
      pageBefore > 0 &&
      pageBefore <= maxPage &&
      fetchDebounce({ page: pageBefore, pageSize, onFetch });
    !cachePageDataAfter &&
      pageAfter > 0 &&
      pageAfter <= maxPage &&
      fetchDebounce({ page: pageAfter, pageSize, onFetch });
  }
  let lastOwnDataPage = currentPage;
  if (cachePageDataAfter) {
    lastOwnDataPage = pageAfter;
  } else if (cachePageData) {
    lastOwnDataPage = currentPage;
  } else if (cachePageDataBefore) {
    lastOwnDataPage = pageBefore;
  }

  return [
    cachePageDataBefore || [],
    cachePageData || [],
    cachePageDataAfter || [],
    lastOwnDataPage,
  ];
}

const computeState = (
  {
    pageSize,
    onFetch,
    loading,
    total,
    bidirectionalCachePages: cachePages,
    dataSource: [page, data],
  },
  { maxPage, currentPage, cacheData, rowHeight },
) => {
  let bidirectionalCachePages = cachePages;
  let newCacheData = cacheData;

  if (cachePages < 1) {
    bidirectionalCachePages = 1;
  }
  if (bidirectionalCachePages * 2 + 1 < maxPage) {
    let startPage = currentPage - bidirectionalCachePages;
    startPage = startPage < 1 ? 1 : startPage;

    let endPage = currentPage + bidirectionalCachePages;
    endPage = endPage > maxPage ? maxPage : endPage;

    cacheData[page] = data; // eslint-disable-line
    newCacheData = Array.from({ length: maxPage });

    Array.prototype.splice.apply(
      newCacheData,
      [startPage, endPage - startPage + 1].concat(
        cacheData.slice(startPage, endPage + 1),
      ),
    );
  }
  newCacheData[page] = data;

  const [
    cachePageDataBefore,
    cachePageData,
    cachePageDataAfter,
    lastOwnDataPage,
  ] = getCachePage({
    step: 1,
    maxPage,
    pageSize,
    onFetch,
    loading,
    cacheData: newCacheData,
    currentPage,
  });

  const upperHeight = Math.round(
    (currentPage - 1 - (cachePageDataBefore.length ? 1 : 0)) *
      pageSize *
      rowHeight,
  );

  const underHeight = Math.round(
    // 已经是最后一页，直接返回0，否则如果有零头total % pageSize，需要加上不满一个page的零头lastOwnDataPageLength，但需要少加一个整页pageSize
    maxPage === lastOwnDataPage
      ? 0
      : ((maxPage - lastOwnDataPage) * pageSize + (total % pageSize)) *
          rowHeight,
  );
  const dataSource = cachePageDataBefore
    .concat(cachePageData)
    .concat(cachePageDataAfter);

  return {
    hasCacheBefore: !!cachePageDataBefore.length,
    hasCache: !!cachePageData.length,
    hasCacheAfter: !!cachePageDataAfter.length,
    cacheData: newCacheData,
    dataSource,
    underHeight,
    upperHeight,
  };
};

/* eslint-disable react/no-redundant-should-component-update */
class InfinityTable extends Component {
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
  static LoadingPlaceHolder({ domNode, loading, loadingIndicator }) {
    return (
      domNode &&
      ReactDOM.createPortal(loading ? loadingIndicator : <div />, domNode)
    );
  }
  state = {
    scrollTop: 0, // 滚动条位置
    dataSource: [], // DOM上显示的数据
    rowHeight: 0, // 每行的实际高度
    cacheData: [], // 缓存的数据集大小
    currentPage: 1, // 当前页位置
    underHeight: 0, // 下撑高
    upperHeight: 0, // 上撑高
  };
  static getDerivedStateFromProps(props, prevState) {
    return computeState(props, prevState);
  }

  componentDidMount() {
    /* eslint-disable */
    this.refRoot = ReactDOM.findDOMNode(this);
    this.refScroll = this.refRoot.getElementsByClassName('ant-table-body')[0];
    this.refTable = this.refScroll.getElementsByTagName('tbody')[0];
    /* eslint-enabled */
    this.createUnderPlaceholder();
    this.createUpperPlaceholder();
    this.setStateWithThrottle = throttle(this.updateTable, 0);
    this.props.onScroll &&
      this.refScroll.addEventListener('scroll', this.props.onScroll);

    if (this.refScroll) {
      this.io = new IntersectionObserver(
        changes => {
          const { debug } = this.props;
          let shouldUpdate = true;
          this.ioTargetState = changes.reduce((result, change) => {
            const ret = { ...result };
            switch (change.target) {
              case this.refPageBoundaryBefore:
                ret.refPageBoundaryBefore = change;
                // Bug fix:
                // 向下滚动的时候，如果边界第一行数据触发，不需要更新视图，因为上一页的最后一行已经触发了视图更新,
                // 但是用户通过点击分页切换，而不是滚动的情况例外，因为此时需要更新页码
                if (
                  !this.isPaginationClick &&
                  changes.length === 1 &&
                  this.state.direction === 'down'
                ) {
                  shouldUpdate = false;
                }

                break;
              case this.refPageBoundaryAfter:
                ret.refPageBoundaryAfter = change;
                // Bug fix:
                // 向上滚动的时候，如果边界最后行数据触发，不需要更新视图，因为上一页的第一行已经触发了视图更新
                // 但是用户通过点击分页切换，而不是滚动的情况例外，因为此时需要更新页码
                if (
                  !this.isPaginationClick &&
                  changes.length === 1 &&
                  this.state.direction === 'up'
                ) {
                  shouldUpdate = false;
                }
                break;
              default: // console.log(change)
            }
            return ret;
          }, this.ioTargetState);

          this.isPaginationClick = false;

          debug &&
            console.log('shouldUpdate:IntersectionObserver', {
              shouldUpdate,
              changes,
            });

          shouldUpdate && this.setStateWithThrottle();
        },
        {
          root: this.refScroll,
          threshold: [0, 1],
        },
      );
      this.toggleObserver();
    }

    this.props.onFetch({ page: 1, pageSize: this.props.pageSize });

    new Promise(reslove => {
      this.initialReslove = reslove;
    }).then(() => {
      const {
        pageSize,
        pagination: { defaultCurrent = 1 },
      } = this.props;
      this.createLoadingPlaceholder(); // fullLoading
      this.scrollToPage(defaultCurrent);
      const visibleRowCount = Math.round(
        this.refScroll.clientHeight / this.state.rowHeight,
      );
      this.isReady = true;
      if (pageSize < visibleRowCount) {
        console.warn(
          `pagesize(${pageSize}) less than visible row count(${visibleRowCount}), maybe you set error!`,
        );
      }
    });
  }
  shouldComponentUpdate(nextProps, nextState) {
    const { pageSize, debug } = nextProps;
    const {
      maxPage,
      currentPage,
      dataSource,
      direction,
      rowHeight,
    } = nextState;
    let shouldUpdate = true;

    // 有且仅有当前页上下边界同时触发时，表示更换边界，不需要更新
    if (this.isPageBoundary) {
      shouldUpdate = false;
      this.isPageBoundary = false;
    }
    debug && console.log('shouldUpdate:updateBoundary', { shouldUpdate });

    if (shouldUpdate && !this.isInitial) {
      let currentPageReal = currentPage;

      // 由于state中的currentPage延迟与真实的currentPage不一致，当出现这种情况时，强制updateTable()
      currentPageReal =
        Math.floor(this.refScroll.scrollTop / (pageSize * rowHeight)) + 1 || 1;
      currentPageReal = currentPageReal > maxPage ? maxPage : currentPageReal;
      if (currentPageReal !== currentPage) {
        this.updateTable();
        shouldUpdate = false;
      }

      debug &&
        console.log('shouldUpdate:currentPageReal', {
          currentPageReal,
          currentPage,
          shouldUpdate,
        });
    }

    if (shouldUpdate) {
      const {
        refPageBoundaryBefore,
        refPageBoundaryAfter,
      } = this.ioTargetState;

      switch (direction) {
        case 'up':
          if (
            this.state.hasCacheAfter &&
            currentPage < maxPage - 2 && // Bug fix: 如果是最后三页向后点击切换，需要刷新视图，否则页码表记停留在前一页
            refPageBoundaryBefore &&
            refPageBoundaryBefore.intersectionRatio > 0
          )
            shouldUpdate = false;
          break;

        case 'down':
          if (
            this.state.currentPage === currentPage &&
            this.state.hasCacheAfter && // Bug fix: 可能存在3页数据已经加载到了, 但之前没有刷新的情况，所以需要刷新，判断特征是之前的数据小于3页
            refPageBoundaryAfter &&
            refPageBoundaryAfter.intersectionRatio > 0
          )
            shouldUpdate = false;
      }

      debug &&
        console.log('shouldUpdate:verboseBoundary', {
          shouldUpdate,
          direction,
          dataSource,
          Before:
            refPageBoundaryBefore && refPageBoundaryBefore.intersectionRatio,
          After: refPageBoundaryAfter && refPageBoundaryAfter.intersectionRatio,
        });
    }

    if (shouldUpdate) {
      shouldUpdate = [1, maxPage, maxPage - 1, maxPage - 2].includes(
        currentPage,
      )
        ? dataSource.length > 0
        : [
            // 如果已经加载3页数据，需要更新视图，否则不在 fullLoading 状态，即使数据不满3页也需要更新视图
            ...(this.fullLoading ? [] : [0, pageSize, pageSize * 2]),
            pageSize * 3,
          ].includes(dataSource.length);

      debug &&
        console.log('shouldUpdate:3Page', {
          currentPage,
          dataSource,
          shouldUpdate,
          state: this.state,
          nextState,
        });
    }

    return shouldUpdate;
  }
  componentDidUpdate(preProps, preState) {
    const {
      hasCache,
      hasCacheBefore,
      currentPage,
      dataSource,
      maxPage,
    } = this.state;
    const { pageSize, debug } = this.props;

    if (!this.isInitial) {
      let before, after;

      if (hasCache && hasCacheBefore) {
        if (currentPage === 1 || currentPage === maxPage - 1) {
          before = 0;
          after = pageSize - 1;
        } else if (currentPage === maxPage) {
          before = 0;
          after = dataSource.length - 1;
        } else {
          before = pageSize;
          after = pageSize * 2 - 1;
        }

        if (this.refPageBoundaryBefore !== this.refTable.children[before]) {
          this.refPageBoundaryBefore &&
            this.io.unobserve(this.refPageBoundaryBefore);
          this.refPageBoundaryAfter &&
            this.io.unobserve(this.refPageBoundaryAfter);

          this.refPageBoundaryBefore = this.refTable.children[before];
          this.refPageBoundaryAfter = this.refTable.children[after];

          this.refPageBoundaryAfter &&
            this.io.observe(this.refPageBoundaryAfter);
          this.refPageBoundaryBefore &&
            this.io.observe(this.refPageBoundaryBefore);

          debug &&
            this.refPageBoundaryBefore &&
            console.log(
              'componentDidUpdate',
              this.refPageBoundaryBefore.innerText,
            );
          debug &&
            this.refPageBoundaryAfter &&
            console.log(
              'componentDidUpdate',
              this.refPageBoundaryAfter.innerText,
            );

          this.isPageBoundary = true;
        }
      }
      const emptyPlaceholder = this.refRoot.querySelector(
        '.ant-table-placeholder',
      );
      emptyPlaceholder && (emptyPlaceholder.style.display = 'none');
    }
  }
  componentWillUnmount() {
    this.props.onScroll &&
      this.refScroll.removeEventListener('scroll', this.props.onScroll);
    this.io.disconnect();
  }
  isInitial = true; // 初始状态，未渲染任何数据
  isReady = false; // 已渲染首屏数据，可交互的状态
  isPageBoundary = false; // 当前页，上下边界更新
  isPaginationClick = false;
  refUpperPlaceholder = null;
  refUnderPlaceholder = null;
  refLoadingPlaceholder = null;
  refScroll = null;
  refTable = null;
  refFooter = null;
  refPageBoundaryBefore = null; // 当前页的第一条DOM数据
  refPageBoundaryAfter = null; // 当前页的最后一条DOM数据
  ioTargetState = {
    refUnderPlaceholder: null,
    refUpperPlaceholder: null,
    refTable: null,
    refPageBoundaryBefore: null,
    refPageBoundaryAfter: null,
  };
  createLoadingPlaceholder() {
    const refLoadingPlaceholder = document.createElement('div');
    refLoadingPlaceholder.setAttribute('id', 'refLoadingPlaceholder');
    const clientRect = this.refScroll.getBoundingClientRect();
    refLoadingPlaceholder.setAttribute(
      'style',
      `position:fixed; width:${clientRect.width}px; height:${
        clientRect.height
      }px`,
    );

    this.refScroll.insertBefore(
      refLoadingPlaceholder,
      this.refScroll.firstChild,
    );
    this.refLoadingPlaceholder = refLoadingPlaceholder;
  }

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

  scrollToPage = (...args) => {
    const { pageSize } = this.props;
    const { rowHeight } = this.state;
    const [page] = args;
    this.refScroll.scrollTop = (page - 1) * pageSize * rowHeight + 1; // Bug fix: + 1个像素,点击页码向后翻页时存在少一个像素就变成上一页的bug
    this.isPaginationClick = true;
    this.props.pagination &&
      this.props.pagination.onChange &&
      this.props.pagination.onChange(...args);
  };
  updateTable = () => {
    const { clientHeight: tableHeight } = this.refTable;
    const { scrollTop } = this.refScroll;
    let { rowHeight, maxPage } = this.state;
    const { pageSize, total, debug } = this.props;

    if (this.isInitial) {
      // 还在初始状态
      maxPage = Math.ceil(total / pageSize);
      const {
        dataSource: { length },
      } = this.state;
      rowHeight = tableHeight / length;
      if (rowHeight) {
        // 当行高出现，表示初次呈现数据数时
        this.isInitial = false;
        this.initialReslove();
      }
    }
    let currentPage = Math.floor(scrollTop / (pageSize * rowHeight)) + 1 || 1;
    currentPage = currentPage > maxPage ? maxPage : currentPage;

    debug &&
      console.log('updateTable', {
        currentPage,
      });
    this.setState(
      {
        direction:
          this.refScroll.scrollTop - this.state.scrollTop < 0 ? 'up' : 'down',
        scrollTop: this.refScroll.scrollTop,
        maxPage,
        currentPage,
        rowHeight,
      },
      // () => console.log('computeState done', this.state),
    );
  };
  toggleObserver(condition = true) {
    if (condition) {
      this.io.observe(this.refUpperPlaceholder);
      this.io.observe(this.refUnderPlaceholder);
      this.io.observe(this.refTable);
      this.refPageBoundaryBefore && this.io.observe(this.refPageBoundaryBefore);
      this.refPageBoundaryAfter && this.io.observe(this.refPageBoundaryAfter);
    } else {
      this.io.unobserve(this.refUpperPlaceholder);
      this.io.unobserve(this.refUnderPlaceholder);
      this.io.unobserve(this.refTable);
      this.refPageBoundaryBefore &&
        this.io.unobserve(this.refPageBoundaryBefore);
      this.refPageBoundaryAfter && this.io.unobserve(this.refPageBoundaryAfter);
    }
  }
  render() {
    const {
      pageSize,
      loadingIndicator,
      loading,
      total,
      columns,
      debug,
      forwardedRef,
      pagination,
      ...rest
    } = this.props;

    const {
      dataSource,
      upperHeight,
      underHeight,
      cacheData,
      currentPage,
    } = this.state;

    this.fullLoading = !cacheData[currentPage];
    const { fullLoading } = this;
    debug && console.log('%c Rendering', 'color:#f00;font-weight:bold');

    return (
      <Fragment>
        <InfinityTable.LoadingPlaceHolder
          domNode={this.refLoadingPlaceholder}
          loading={fullLoading}
          loadingIndicator={<Spin tip="Loading..." />}
        />
        <InfinityTable.PlaceHolder
          height={upperHeight}
          domNode={this.refUpperPlaceholder}
          loading={loading && !fullLoading}
          loadingIndicator={loadingIndicator}
        />
        <InfinityTable.PlaceHolder
          height={underHeight}
          domNode={this.refUnderPlaceholder}
          loading={loading && !fullLoading}
          loadingIndicator={loadingIndicator}
        />
        {!this.isInitial &&
          pagination &&
          ['top', 'both'].includes(pagination.position) && (
            <Pagination
              showQuickJumper
              {...pagination}
              onChange={this.scrollToPage}
              current={currentPage}
              pageSize={pageSize}
              showSizeChanger={false}
              total={total}
              className={`infinity-page-table-pagination ${
                pagination && pagination.className ? pagination.className : ''
              }`}
            />
          )}
        <Table
          {...rest}
          ref={forwardedRef}
          columns={columns}
          rowKey={record => record.key}
          dataSource={dataSource}
          pagination={false}
          className={`infinity-page-table ${
            rest.className ? rest.className : ''
          }`}
        />
        {!this.isInitial &&
          pagination &&
          [undefined, 'bottom', 'both'].includes(pagination.position) && (
            <Pagination
              showQuickJumper
              {...pagination}
              onChange={this.scrollToPage}
              current={currentPage}
              pageSize={pageSize}
              showSizeChanger={false}
              total={total}
              className={`infinity-page-table-pagination ${
                pagination && pagination.className ? pagination.className : ''
              }`}
            />
          )}
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
  pagination: { defaultCurrent: 1 }, // 分页器
  onScroll: null, // 滚动事件
  onFetch: noop, // 滚动到低部触发Fetch方法
  bidirectionalCachePages: Infinity, // 当前页前后的缓存页码数量，默认为无限
  total: 0, // 总共数据条数
  debug: false, // display console log for debug
  loading: false, // 是否loading状态
  pageSize: 30, // 每次Loading数据量，pageSize * 3 = 最大真实DOM大小，Reality DOM row count
};

InfinityTable.propTypes = {
  // loading 效果
  className: string,
  loadingIndicator: element,
  onScroll: func, // 滚动事件
  pagination: oneOfType([
    bool,
    shape({
      className: string,
      position: oneOf(['both', 'top', 'bottom']),
      className: string,
      defaultCurrent: number,
      hideOnSinglePage: bool,
      itemRender: func,
      showQuickJumper: bool,
      showTotal: func,
      simple: bool,
      size: string,
      onChange: func,
    }),
  ]),
  onFetch: func.isRequired, // 滚动触发Fetch方法
  pageSize: number.isRequired,
  bidirectionalCachePages: number.isRequired,
  total: number.isRequired,
  dataSource: array.isRequired,
  columns: array.isRequired,
  forwardedRef: object,
  debug: bool,
  loading: bool.isRequired,
};

export default React.forwardRef((props, ref) => (
  <InfinityTable {...props} forwardedRef={ref} />
));
