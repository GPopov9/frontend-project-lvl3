import i18next from 'i18next';

const submitButton = document.querySelector('button.btn');
const invalid = document.querySelector('div.invalid-feedback');

export default (input, error) => {
  invalid.innerHTML = '';
  switch (error) {
    /* eslint-disable no-param-reassign */
    case 'noErrors':
      input.classList.remove('is-invalid');
      submitButton.disabled = false;
      break;
    case 'validationError':
      input.classList.add('is-invalid');
      invalid.textContent = i18next.t('errors.invalid');
      submitButton.disabled = true;
      break;
    /* eslint-enable no-param-reassign */
    case 'Request failed with status code 404':
      input.classList.add('is-invalid');
      invalid.textContent = i18next.t('errors.undefined');
      break;
    case 'Network Error':
      input.classList.add('is-invalid');
      invalid.textContent = i18next.t('errors.network');
      break;
    default:
      throw new Error(`Unknown errorStatus state: '${error}'!`);
  }
};
