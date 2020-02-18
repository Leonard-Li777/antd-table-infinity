import { random } from 'lodash';

const getGuid = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    /* eslint-disable */
    let r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

const fetchData = (startIndex = 0) =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(
        startIndex >= 500 // 总共只有500条数据
          ? []
          : Array.from({ length: 20 }).map((_, i) => {
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
    }, random(0, 1.0) * 1000);
  });

const columns = [
  {
    title: 'index',
    dataIndex: 'index',
    render: text => text,
    width: 50,
  },
  {
    title: 'Name',
    dataIndex: 'name',
    width: 100,
  },
  {
    title: 'Age',
    width: 50,
    dataIndex: 'age',
  },
  {
    title: 'Address',
    width: 200,
    dataIndex: 'address',
  },
];

const sumData = [
  {
    index: '合计',
    key: ',4',
    name: 'Disabled User',
    age: 99,
    address: 'Sidney No. 1 Lake Park',
  },
];

export { columns, fetchData, sumData };
