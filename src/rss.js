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
    case 'form.processError':
      renderErrors(input, submitButton, value);
      break;
    default:
      break;
  }
});

const resetState = () => {
  state.form.processState = 'processing';
  state.form.processError = null;
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
    watchedState.form.processError = error;
    resetState();
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
      })
      .catch((err) => {
        console.log(err.message);
        watchedState.form.processState = 'failed';
        watchedState.form.processError = err.message;
        form.reset();
      });
  });

  const refresher = () => {
    const requests = state.data.feeds.map((feed) => {
      const url = getURL(feed.link);
      return axios.get(url, {
        params: {
          id: feed.id,
        },
      });
    });
    axios.all(requests)
      .then((responses) => {
        const newPostsAll = _.flatten(responses.map((response) => {
          const feedId = response.config.params.id;
          const oldPosts = state.data.posts.filter((post) => post.id === feedId);
          const { posts } = parse(response.data);
          const newPosts = posts.map((post) => ({ id: feedId, ...post }));
          const diff = _.differenceWith(newPosts, oldPosts, _.isEqual);
          return diff;
        }));
        if (newPostsAll !== []) {
          newPostsAll.forEach((item) => state.data.posts.unshift(item));
        }
        watchedState.form.processState = 'completed';
        resetState();
        setTimeout(refresher, 5000);
      })
      .catch((err) => {
        watchedState.form.processState = 'failed';
        watchedState.form.processError = err.message;
        setTimeout(refresher, 5000);
      });
  };
  setTimeout(refresher, 5000);
};
