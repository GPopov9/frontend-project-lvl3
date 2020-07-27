/* eslint-disable no-param-reassign, no-console  */
const submitButton = document.querySelector('button.btn');

export default (process, input) => {
  switch (process) {
    case 'processing':
      submitButton.disabled = false;
      break;
    case 'downloading':
      submitButton.disabled = true;
      break;
    case 'completed':
      input.value = '';
      submitButton.disabled = true;
      break;
    default:
      throw new Error(`Unknown process ${process}`);
  }
};
