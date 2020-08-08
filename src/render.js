/* eslint-disable no-param-reassign */
const renderErrors = (errors, invalid) => {
  invalid.innerHTML = errors.map((error) => `${error}`).join();
};

const renderData = (data, div) => {
  div.innerHTML = data.map((element) => `<div><a href=${element.link}><h4>${element.title}</h4></a></div>`).join('');
};

export { renderErrors, renderData };
