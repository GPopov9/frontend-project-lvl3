const getFeed = (data) => {
  const titleFeed = data.querySelector('channel > title');
  const descriptionFeed = data.querySelector('channel > description');
  const title = titleFeed.textContent;
  const description = descriptionFeed.textContent;
  return { title, description };
};

const getPosts = (data) => {
  const items = [...data.querySelectorAll('item')];
  return items.map((item) => {
    const titlePost = item.querySelector('title');
    const descriptionPost = item.querySelector('description');
    const linkPost = item.querySelector('link');
    const title = titlePost.textContent;
    const description = descriptionPost.textContent;
    const link = linkPost.textContent;
    return { title, description, link };
  });
};

export default (data) => {
  const parse = new DOMParser();
  const rssData = parse.parseFromString(data, 'text/xml');
  const feed = getFeed(rssData);
  const posts = getPosts(rssData);
  return { feed, posts };
};
