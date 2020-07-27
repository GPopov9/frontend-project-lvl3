export default (feeds) => {
  const divFeeds = document.querySelector('.feeds');
  const divFeedsInner = feeds.map((feed) => `<div><a href=${feed.link}><h4>${feed.title}</h4></a></div>`).join('');
  divFeeds.innerHTML = divFeedsInner;
};
