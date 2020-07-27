import i18next from 'i18next';

const invalid = document.querySelector('div.invalid-feedback');

export default (error, input) => {
  invalid.innerHTML = '';
  switch (error) {
    case null:
      input.classList.remove('is-invalid');
      break;
    case 'validationError':
      invalid.textContent = i18next.t('errors.invalid');
      break;
    case 'undefined':
      invalid.textContent = i18next.t('errors.undefined');
      break;
    case 'network':
      input.classList.add('is-invalid');
      invalid.textContent = i18next.t('errors.network');
      break;
    default:
      throw new Error(`Unknown errorStatus state: '${error}'!`);
  }
};
