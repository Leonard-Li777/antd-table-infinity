import { configure } from '@storybook/react';

function loadStories() {
  require('../src/stories/');
  // You can require as many stories as you need.
}

configure(loadStories, module);
