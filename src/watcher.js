import onChange from 'on-change';
import renderErrors from './renderErrors';
import processStateHandler from './processStateHandler';
import renderFeeds from './renderFeeds';
import renderPosts from './renderPosts';

export default (state, input, submitButton, invalid) => onChange(state, (path, value) => {
  switch (path) {
    case 'form.valid':
      /* eslint-disable no-param-reassign */
      if (value) {
        input.classList.remove('is-invalid');
        submitButton.disabled = false;
      } else {
        input.classList.add('is-invalid');
        submitButton.disabled = true;
      }
      break;
      /* eslint-enable no-param-reassign */
    case 'form.errors':
      renderErrors(value, invalid);
      break;
    case 'form.process':
      processStateHandler(value, input, submitButton);
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
