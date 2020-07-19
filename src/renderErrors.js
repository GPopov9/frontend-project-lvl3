import i18next from 'i18next';

export default (input, error) => {
  const invalid = document.querySelector('div.invalid-feedback');
  invalid.innerHTML = '';
  switch (error) {
    case null:
      input.classList.remove('is-invalid');
      break;
    case 'validation':
      input.classList.add('is-invalid');
      invalid.textContent = i18next.t('errors.invalid');
      break;
    case 404:
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
