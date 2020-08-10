// @ts-check
import _ from 'lodash';
import i18next from 'i18next';
import axios from 'axios';
import parse from './parser';
import en from './locale';
import validate from './validate';
import watcher from './watcher';

const proxy = {
  path: 'https://cors-anywhere.herokuapp.com',
};

const getURL = (data) => `${proxy.path}/${data}`;

const getData = (watchedState, form) => {
  const formData = new FormData(form);
  const url = getURL(formData.get('url'));
  const id = _.uniqueId();
  /* eslint-disable no-param-reassign */
  watchedState.form.process = 'downloading';
  axios.get(url)
    .then((response) => {
      const { feed, posts } = parse(response.data);
      watchedState.data.feeds.push({ id, ...feed, link: url });
      posts.forEach((post) => watchedState.data.posts.push({ id, ...post }));
      watchedState.form.process = 'completed';
    })
    .catch((err) => {
      const errStatus = err.response.status;
      if (errStatus === 404) {
        watchedState.form.processError = [i18next.t('errors.undefined')];
      } else {
        throw new Error(`Unknown error status: '${errStatus}'!`);
      }
      watchedState.form.valid = false;
      watchedState.form.process = 'failed';
      /* eslint-enable no-param-reassign */
    });
};

const updatePosts = (state) => {
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
        return _.differenceWith(newPosts, oldPosts, _.isEqual);
      }));
      if (newPostsAll.length !== 0) {
        newPostsAll.forEach((item) => state.data.posts.unshift(item));
      }
    })
    .catch((err) => {
      throw new Error(`Unknown error status: '${err.message}'!`);
    })
    .finally(() => setTimeout(updatePosts, 5000, state));
};

export default () => {
  const state = {
    form: {
      process: 'processing',
      valid: true,
      processError: null,
    },
    data: {
      feeds: [],
      posts: [],
      errors: [],
    },
  };

  const form = document.querySelector('form');
  const input = document.querySelector('input.form-control');

  const elements = {
    invalid: document.querySelector('div.invalid-feedback'),
    submitButton: document.querySelector('button.btn'),
    feedsDiv: document.querySelector('.feeds'),
    postsDiv: document.querySelector('.posts'),
  };

  const watchedState = watcher(state, input, elements);

  i18next.init({
    lng: 'en',
    debug: true,
    resources: {
      en,
    },
  }).then(() => {
    watchedState.form.process = 'completed';
    updatePosts(watchedState);

    input.addEventListener('input', (e) => {
      watchedState.form.process = 'processing';
      const errors = validate(e.target.value, state.data.feeds);
      if (errors !== null) {
        watchedState.data.errors = errors;
        watchedState.form.valid = false;
      } else {
        watchedState.data.errors = [];
        watchedState.form.valid = true;
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      getData(watchedState, form);
    });
  });
};
