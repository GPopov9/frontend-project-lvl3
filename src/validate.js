import * as yup from 'yup';
import i18next from 'i18next';

export default (url, feeds) => {
  const links = feeds.map(({ link }) => link);
  const schema = yup.string()
    .url(i18next.t('errors.invalid'))
    .matches(/rss\b/, i18next.t('errors.match'))
    .notOneOf(links, i18next.t('errors.duplicate'));
  try {
    schema.validateSync(url, { abortEarly: false });
    return null;
  } catch (err) {
    return err.errors;
  }
};
