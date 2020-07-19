export default (data) => {
  const feedsDiv = document.querySelector('[name="feeds"]');
  feedsDiv.innerHTML = '';
  data.feeds.forEach((feed) => {
    const div = document.createElement('div');
    const a = document.createElement('a');
    a.setAttribute('href', feed.link);
    const h4 = document.createElement('h4');
    h4.textContent = feed.title;
    a.appendChild(h4);
    div.appendChild(a);
    feedsDiv.appendChild(div);
  });
};
