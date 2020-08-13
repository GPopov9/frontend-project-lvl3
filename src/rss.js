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

const TIMEOUT = 5000;
/* eslint-disable no-param-reassign */
const getData = (url, id, state) => {
  state.form.process = 'downloading';
  axios.get(getURL(url))
    .then((response) => {
      const { feed, posts } = parse(response.data);
      state.data.feeds.push({ id, ...feed, link: url });
      state.data.posts = [...state.data.posts, ...posts];
      state.form.process = 'completed';
    })
    .catch((err) => {
      const errStatus = err.response.status;
      state.form.process = 'failed';
      state.form.valid = false;
      if (errStatus === 404) {
        state.form.processError = [i18next.t('errors.undefined')];
      } else {
        throw new Error(`Unknown error status: '${errStatus}'!`);
      }
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
        state.data.posts = [...newPostsAll, ...state.data.posts];
      }
    })
    .catch((err) => {
      throw new Error(`Unknown error status: '${err.message}'!`);
    })
    .finally(() => setTimeout(updatePosts, TIMEOUT, state));
};
/* eslint-enable no-param-reassign */
export default () => {
  const state = {
    form: {
      process: 'processing',
      processError: null,
      valid: true,
      validationErrors: null,
    },
    data: {
      feeds: [],
      posts: [],
    },
  };

  const form = document.querySelector('form');

  const elements = {
    input: document.querySelector('input.form-control'),
    invalid: document.querySelector('div.invalid-feedback'),
    submitButton: document.querySelector('button.btn'),
    feedsDiv: document.querySelector('.feeds'),
    postsDiv: document.querySelector('.posts'),
  };

  const watchedState = watcher(state, elements);

  i18next.init({
    lng: 'en',
    debug: true,
    resources: {
      en,
    },
  }).then(() => {
    watchedState.form.process = 'completed';
    updatePosts(watchedState);

    elements.input.addEventListener('input', (e) => {
      // @ts-ignore
      if (e.target.value === '') {
        watchedState.form.valid = true;
        watchedState.form.process = 'completed';
      } else {
        watchedState.form.process = 'processing';
        const errors = validate(e.target.value, state.data.feeds);
        if (errors !== null) {
          watchedState.form.validationErrors = errors;
          watchedState.form.valid = false;
        } else {
          watchedState.form.validationErrors = [];
          watchedState.form.valid = true;
        }
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const url = formData.get('url');
      const id = _.uniqueId();
      getData(url, id, watchedState);
    });
  });
};
