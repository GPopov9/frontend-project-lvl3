import * as yup from 'yup';

export default (url, feeds) => {
  const links = feeds.map(({ link }) => link);
  const schema = yup.string().url().matches(/rss\b/).notOneOf(links);
  return schema.isValid(url);
};
