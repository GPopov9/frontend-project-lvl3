import onChange from 'on-change';
import processStateHandler from './processStateHandler';
import { renderErrors, renderData } from './render';

const renderValid = (value, input, submitButton) => {
  /* eslint-disable no-param-reassign */
  if (value) {
    input.classList.remove('is-invalid');
    submitButton.disabled = false;
  } else {
    input.classList.add('is-invalid');
    submitButton.disabled = true;
  }
  /* eslint-enable no-param-reassign */
};

export default (state, input, elements) => onChange(state, (path, value) => {
  switch (path) {
    case 'form.valid':
      renderValid(value, input, elements.submitButton);
      break;
    case 'form.errors':
      renderErrors(value, elements.invalid);
      break;
    case 'form.process':
      processStateHandler(value, input, elements.submitButton);
      break;
    case 'data.feeds':
      renderData(state.data.feeds, elements.feedsDiv);
      break;
    case 'data.posts':
      renderData(state.data.posts, elements.postsDiv);
      break;
    default:
      throw new Error(`Unknown path state: '${path}'!`);
  }
});
