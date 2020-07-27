const submitButton = document.querySelector('button.btn');

export default (valid, input) => {
  if (valid) {
    input.classList.remove('is-invalid');
    submitButton.disabled = !valid;
  } else {
    input.classList.add('is-invalid');
    submitButton.disabled = !valid;
  }
};
