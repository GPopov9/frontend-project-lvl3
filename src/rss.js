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
      errors: null,
    },
    data: {
      feeds: [],
      posts: [],
    },
  };

  const form = document.querySelector('form');
  const input = document.querySelector('input.form-control');
  const submitButton = document.querySelector('button.btn');
  const invalid = document.querySelector('div.invalid-feedback');

  const watchedState = watcher(state, input, submitButton, invalid);

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
        watchedState.form.errors = err.message;
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
    watchedState.form.errors = validate(e.target.value, state.data.feeds);
    if (validate(e.target.value, state.data.feeds) === null) {
      watchedState.form.valid = true;
    } else {
      watchedState.form.valid = false;
    }
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
      .catch((err) => {
        watchedState.form.errors = err.response.statusText;
        watchedState.form.valid = false;
      });
  });
};
