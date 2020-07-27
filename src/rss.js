// @ts-check
/* eslint-disable no-param-reassign, no-console  */
import _ from 'lodash';
import i18next from 'i18next';
import axios from 'axios';
import parse from './parser';
import en from './locale';
import validate from './validate';
import watcher from './watcher';

const state = {
  form: {
    process: 'processing',
    valid: true,
    errors: null,
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
const form = document.querySelector('form');

const watchedState = watcher(state, input);

const updatePosts = () => {
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
      if (newPostsAll.length !== 0) {
        newPostsAll.forEach((item) => watchedState.data.posts.unshift(item));
      }
    })
    .catch(() => {
      watchedState.form.errors = 'network';
    })
    .finally(() => setTimeout(updatePosts, 5000));
};

export default () => {
  i18next.init({
    lng: 'en',
    debug: true,
    resources: {
      en,
    },
  }).then(() => setTimeout(updatePosts, 5000));

  input.addEventListener('input', (e) => {
    watchedState.form.process = 'processing';
    validate(e.target.value, state.data.feeds)
      .then((result) => {
        const error = (result) ? null : 'validationError';
        watchedState.form.valid = result;
        watchedState.form.errors = error;
      });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.process = 'downloading';
    const id = _.uniqueId();
    const url = getURL(input.value);
    axios.get(url)
      .then((response) => {
        const { feed, posts } = parse(response.data);
        watchedState.data.feeds.push({ id, ...feed, link: input.value });
        posts.forEach((post) => watchedState.data.posts.push({ id, ...post }));
        watchedState.form.process = 'completed';
      })
      .catch(() => {
        watchedState.form.errors = 'undefined';
        watchedState.form.valid = false;
      });
  });
};
