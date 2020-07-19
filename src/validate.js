import * as yup from 'yup';

export default (feeds, form) => {
  const links = feeds.map(({ link }) => link);
  const schema = yup.object().shape({
    inputValue: yup.string().url().matches(/.\brss\b/)
      .notOneOf(links),
  });
  try {
    schema.validateSync(form, { abortEarly: false });
    return null;
  } catch (err) {
    return 'validation';
  }
};
