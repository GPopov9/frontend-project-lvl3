export default (process, input, submitButton) => {
  switch (process) {
    /* eslint-disable no-param-reassign */
    case 'processing':
      submitButton.disabled = false;
      input.disabled = false;
      break;
    case 'downloading':
      submitButton.disabled = true;
      input.disabled = true;
      break;
    case 'completed':
      input.value = '';
      input.disabled = false;
      submitButton.disabled = true;
      break;
    default:
      throw new Error(`Unknown process ${process}`);
  }
};
