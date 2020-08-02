export default (valid, input, submitButton) => {
  if (valid) {
    input.classList.remove('is-invalid');
    /* eslint-disable no-param-reassign */
    submitButton.disabled = false;
  } else {
    input.classList.add('is-invalid');
    submitButton.disabled = true;
  }
};
