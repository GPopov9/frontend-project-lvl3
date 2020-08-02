import i18next from 'i18next';
/* eslint-disable no-param-reassign */
export default (error, invalid) => {
  invalid.innerHTML = '';
  switch (error) {
    case null:
      break;
    case 'ValidationError':
      invalid.textContent = i18next.t('errors.invalid');
      break;
    case 'Not Found':
      invalid.textContent = i18next.t('errors.undefined');
      break;
    case 'Network Error':
      invalid.textContent = i18next.t('errors.network');
      break;
    default:
      throw new Error(`Unknown errorStatus state: '${error}'!`);
  }
};
