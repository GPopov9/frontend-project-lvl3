import onChange from 'on-change';
import renderValid from './renderValid';
import renderErrors from './renderErrors';
import renderProcess from './renderProcess';
import renderFeeds from './renderFeeds';
import renderPosts from './renderPosts';

export default (state, input) => onChange(state, (path, value) => {
  switch (path) {
    case 'form.valid':
      renderValid(state, input);
      break;
    case 'form.errors':
      renderErrors(value, input);
      break;
    case 'form.process':
      renderProcess(value, input);
      break;
    case 'data.feeds':
      renderFeeds(state.data.feeds);
      break;
    case 'data.posts':
      renderPosts(state.data.posts);
      break;
    default:
      break;
  }
});
