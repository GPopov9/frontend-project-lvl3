const getFeed = (data) => {
  const titleRSS = data.querySelector('channel > title');
  const descriptionRSS = data.querySelector('channel > description');
  const title = titleRSS.textContent;
  const description = descriptionRSS.textContent;
  return {title, description};
};

// Parser 
export default (data) => {
  const parse = new DOMParser();
  const rssData = parse.parseFromString(data, 'text/xml');
  const feed = getFeed(rssData);
  return feed;
};