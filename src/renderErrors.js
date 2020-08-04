export default (errors, invalid) => {
  /* eslint-disable no-param-reassign */
  invalid.innerHTML = '';
  const inner = errors.map((error) => `${error}`).join(' ');
  invalid.innerHTML = inner;
};
