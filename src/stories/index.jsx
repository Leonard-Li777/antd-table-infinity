import React from 'react';
import { withReadme } from 'storybook-readme';
import { storiesOf } from '@storybook/react';
import SumTable from './Table/SumTable';
import SumTableReadme from '../components/Table/SumTable/README.md';
import InfinityTable from './Table/InfinityTable';
import InfinityTableReadme from '../components/Table/InfinityTable/README.md';
import PageTable from './Table/PageTable';
import PageTableReadme from '../components/Table/PageTable/README.md';
import './index.css';

storiesOf('Table', module)
  .addDecorator(withReadme([SumTableReadme]))
  .add('SumTable', () => <SumTable />)
  .addDecorator(withReadme([InfinityTableReadme]))
  .add('InfinityTable', () => <InfinityTable />)
  .addDecorator(withReadme([PageTableReadme]))
  .add('PageTable', () => <PageTable />);
