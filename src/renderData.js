const submitButton = document.querySelector('button.btn');

const render = (data) => {
  const divFeeds = document.querySelector('[name="feeds"]');
  const divPosts = document.querySelector('[name="posts"]');
  const divFeedsInner = data.feeds.map((post) => `<div><a href=${post.link}><h4>${post.title}</h4></a></div>`).join('\n');
  const divPostsInner = data.posts.map((post) => `<div><a href=${post.link}><h5>${post.title}</h5></a></div>`).join('\n');
  divFeeds.innerHTML = divFeedsInner;
  divPosts.innerHTML = divPostsInner;
};

export default (processState, data) => {
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
      render(data);
      break;
    default:
      throw new Error(`Unknown state: ${processState}`);
  }
};
