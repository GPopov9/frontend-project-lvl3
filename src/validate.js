import * as yup from 'yup';

export default (url, feeds) => {
  const links = feeds.map(({ link }) => link);
  const schema = yup.string().url().matches(/rss\b/).notOneOf(links);
  try {
    schema.validateSync(url, { abortEarly: false });
    return null;
  } catch (err) {
    return err.name;
  }
};
