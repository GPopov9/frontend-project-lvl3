import onChange from 'on-change';
import renderValid from './renderValid';
import renderErrors from './renderErrors';
import renderProcess from './renderProcess';
import renderFeeds from './renderFeeds';
import renderPosts from './renderPosts';

export default (state, input, submitButton, invalid) => onChange(state, (path, value) => {
  switch (path) {
    case 'form.valid':
      renderValid(value, input, submitButton);
      break;
    case 'form.errors':
      renderErrors(value, invalid);
      break;
    case 'form.process':
      renderProcess(value, input, submitButton);
      break;
    case 'data.feeds':
      renderFeeds(state.data.feeds);
      break;
    case 'data.posts':
      renderPosts(state.data.posts);
      break;
    default:
      throw new Error(`Unknown path state: '${path}'!`);
  }
});
