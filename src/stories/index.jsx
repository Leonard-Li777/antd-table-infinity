import React from 'react';
import { withReadme } from 'storybook-readme';
import { storiesOf } from '@storybook/react';
import SumTable from './Table/SumTable';
import SumTableReadme from '../components/Table/SumTable/README.md';
import InfinityTable from './Table/InfinityTable';
import InfinityTableReadme from '../components/Table/InfinityTable/README.md';
import '../components/Table/SumTable/index.css'
import './index.css';

storiesOf('Table', module)
  .addDecorator(withReadme([SumTableReadme]))
  .add('SumTable', () => <SumTable />)
  .addDecorator(withReadme([InfinityTableReadme]))
  .add('InfinityTable', () => <InfinityTable />);
