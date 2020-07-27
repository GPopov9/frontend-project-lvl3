const submitButton = document.querySelector('button.btn');

export default (state, input) => {
  const { valid } = state.form;
  if (valid) {
    input.classList.remove('is-invalid');
    submitButton.disabled = !valid;
  } else {
    input.classList.add('is-invalid');
    submitButton.disabled = !valid;
  }
};
