import onChange from 'on-change';

const highlightValid = (value, input, submitButton) => {
  /* eslint-disable no-param-reassign */
  if (value) {
    input.classList.remove('is-invalid');
    submitButton.disabled = false;
  } else {
    input.classList.add('is-invalid');
    submitButton.disabled = true;
  }
};

const renderErrors = (errors, invalid) => {
  invalid.innerHTML = errors.map((error) => `${error}`).join();
};

const renderData = (data, div) => {
  div.innerHTML = data.map((element) => `<div><a href=${element.link}><h4>${element.title}</h4></a></div>`).join('');
};

const processStateHandler = (process, input, submitButton) => {
  switch (process) {
    case 'processing':
      submitButton.disabled = false;
      input.disabled = false;
      break;
    case 'downloading':
      submitButton.disabled = true;
      input.disabled = true;
      break;
    case 'failed':
      submitButton.disabled = true;
      input.disabled = false;
      break;
    case 'completed':
      input.value = '';
      input.disabled = false;
      submitButton.disabled = true;
      /* eslint-enable no-param-reassign */
      break;
    default:
      throw new Error(`Unknown process ${process}`);
  }
};

export default (state, input, elements) => onChange(state, (path, value) => {
  switch (path) {
    case 'form.valid':
      highlightValid(value, input, elements.submitButton);
      break;
    case 'form.processError':
      renderErrors(value, elements.invalid);
      break;
    case 'form.process':
      processStateHandler(value, input, elements.submitButton);
      break;
    case 'data.errors':
      renderErrors(value, elements.invalid);
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
