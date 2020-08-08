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

export default () => {
  const state = {
    form: {
      process: 'processing',
      valid: true,
      errors: [],
    },
    data: {
      feeds: [],
      posts: [],
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
          return _.differenceWith(newPosts, oldPosts, _.isEqual);
        }));
        if (newPostsAll.length !== 0) {
          newPostsAll.forEach((item) => watchedState.data.posts.unshift(item));
        }
      })
      .catch((err) => {
        if (err.message === 'Network Error') {
          watchedState.form.errors = [i18next.t('errors.network')];
        } else {
          throw new Error(`Unknown error status: '${err.message}'!`);
        }
        watchedState.form.valid = false;
      })
      .finally(() => setTimeout(updatePosts, 5000));
  };

  i18next.init({
    lng: 'en',
    debug: true,
    resources: {
      en,
    },
  }).then(() => {
    watchedState.form.process = 'completed';
    updatePosts();
  });

  input.addEventListener('input', (e) => {
    watchedState.form.process = 'processing';
    const errors = validate(e.target.value, state.data.feeds);
    if (errors !== null) {
      watchedState.form.errors = errors;
      watchedState.form.valid = false;
    } else {
      watchedState.form.errors = [];
      watchedState.form.valid = true;
    }
  });

  const getData = (url, id) => {
    axios.get(url)
      .then((response) => {
        const { feed, posts } = parse(response.data);
        watchedState.data.feeds.push({ id, ...feed, link: input.value });
        posts.forEach((post) => watchedState.data.posts.push({ id, ...post }));
        watchedState.form.process = 'completed';
      })
      .catch((err) => {
        const errStatus = err.response.status;
        if (errStatus === 404) {
          watchedState.form.errors = [i18next.t('errors.undefined')];
        } else {
          throw new Error(`Unknown error status: '${errStatus}'!`);
        }
        watchedState.form.valid = false;
        watchedState.form.process = 'failed';
      });
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const url = getURL(formData.get('url'));
    const id = _.uniqueId();
    watchedState.form.process = 'downloading';
    getData(url, id);
  });
};
