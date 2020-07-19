// @ts-check
/* eslint-disable no-param-reassign, no-console  */
import _ from 'lodash';
import i18next from 'i18next';
import onChange from 'on-change';
import axios from 'axios';
import parse from './parser';
import en from './locale';
import renderErrors from './renderErrors';
import renderFeeds from './renderFeeds';
import renderPosts from './renderPosts';
import validate from './validate';

const state = {
  form: {
    processState: 'processing',
    processError: null,
    inputValue: '',
    isValid: false,
  },
  data: {
    feeds: [],
    posts: [],
  },
};

const proxy = {
  path: 'https://cors-anywhere.herokuapp.com',
};

const getURL = (data) => `${proxy.path}/${data}`;

const input = document.querySelector('input.form-control');
const submitButton = document.querySelector('button.btn');
const form = document.querySelector('form');

const processStateHandler = (processState) => {
  switch (processState) {
    case 'failed':
      submitButton.disabled = false;
      break;
    case 'processing':
      submitButton.disabled = true;
      break;
    case 'downloading':
      submitButton.disabled = true;
      break;
    case 'completed':
      renderFeeds(state.data);
      renderPosts(state.data);
      break;
    default:
      throw new Error(`Unknown state: ${processState}`);
  }
};

const watchedState = onChange(state, (path, value) => {
  switch (path) {
    case 'form.processState':
      processStateHandler(value);
      break;
    case 'form.isValid':
      submitButton.disabled = !value;
      break;
    case 'form.processError':
      renderErrors(input, value);
      break;
    default:
      break;
  }
});

const resetState = () => {
  state.form.processState = 'processing';
  state.form.processError = null;
  state.form.isValid = false;
};

export default () => {
  i18next.init({
    lng: 'en',
    debug: true,
    resources: {
      en,
    },
  });

  input.addEventListener('input', (e) => {
    state.form.inputValue = e.target.value;
    const error = validate(state.data.feeds, state.form);
    watchedState.form.isValid = _.isEqual(error, null);
    watchedState.form.processError = error;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.processState = 'downloading';
    const id = _.uniqueId();
    const url = getURL(state.form.inputValue);
    axios.get(url)
      .then((response) => {
        const { feed, posts } = parse(response.data);
        state.data.feeds.push({ id, ...feed, link: state.form.inputValue });
        posts.forEach((post) => state.data.posts.push({ id, ...post }));
        watchedState.form.processState = 'completed';
        form.reset();
        resetState();
      })
      .catch((err) => {
        console.log(err);
        watchedState.form.processState = 'failed';
        watchedState.form.processError = err.response.status;
      });
  });

  const refresher = () => {
    if (state.data.feeds === []) {
      return;
    }

    state.data.feeds.forEach((feed) => {
      const oldPosts = state.data.posts.filter((post) => post.id === feed.id);
      const url = getURL(feed.link);
      axios.get(url)
        .then((response) => {
          const { posts } = parse(response.data);
          const newPosts = posts;
          return newPosts.map((post) => ({ id: feed.id, ...post }));
        })
        .then((newPosts) => {
          if (_.isEqual(oldPosts, newPosts)) {
            console.log('all the same');
            console.log(state.form.processState);
            return;
          }
          state.data.posts.filter((post) => post !== feed.id);
          newPosts.forEach((post) => state.data.posts.push(post));
          watchedState.form.processState = 'completed';
          console.log(state.form.processState);
        });
    });
    setTimeout(refresher, 5000);
  };
  setTimeout(refresher, 5000);
};
