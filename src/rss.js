// @ts-check
/* eslint-disable no-param-reassign, no-console  */
import _ from 'lodash';
import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import parse from './parser';


// State for form 
const state = { 
  form: {
    processState: 'processing',
    processError: null,
    inputValue: '', 
    isValid: true,
    errors: {},
  }, 
  data: {
    feeds: [],
    posts: [],
  }
};

//////////////////////////////////////////

// Proxy Server for download
const proxy = {
  path: 'https://cors-anywhere.herokuapp.com',
};
//////////////////////////////////////////

// getURL for downaloading 
const getURL = (data) => `${proxy.path}/${data}`;
//////////////////////////////////////////

/// Validation 
const schema = yup.object().shape({
  inputValue: yup.string().url().matches(/.\brss\b/)
  .notOneOf(state.data.feeds),
});

const validate = (form) => {
  try {
    schema.validateSync(form, {abortEarly: false});
    return {};
  } catch (err) {
    return _.keyBy(err.inner, 'path');
  }
};
//////////////////////////////////////////

// Update Validation State
const updateValidationState = (state) => {
  const errors = validate(state.form);
  watchedState.form.isValid = _.isEqual(errors, {});
  watchedState.form.errors = errors;
};
/////////////////////////////////////////////

const input = document.querySelector('input.form-control');
const submitButton = document.querySelector('button.btn');
//const invalid = document.querySelector('.invalid-feedback');
const form = document.querySelector('form');

// Render error input 
const renderErrors = (element, error) => {
  if (!_.isEmpty(error)) {
    element.classList.add('is-invalid');
  } else {
    element.classList.remove('is-invalid');    
  } 
};

// Watcher
const watchedState = onChange(state, (path, value) => {
  switch (path) {
    case 'form.processState':
      break;
    case 'form.isValid':
      submitButton.disabled = !value;
      break;
    case 'form.errors':
      renderErrors(input, value);
      break;
    default:
      break;
  }
});
////////////////////////////////////






export default () => {
  input.addEventListener('input', (e) => {
    state.form.inputValue = e.target.value;
    //console.log(state);
    updateValidationState(state);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.processState = 'download';
    axios.get(getURL(state.form.inputValue))
      .then((response) => {
        
        console.log(parse(response.data));
      })

  });
};
