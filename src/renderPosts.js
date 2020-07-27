export default (posts) => {
  const divPosts = document.querySelector('.posts');
  const divPostsInner = posts.map((post) => `<div><a href=${post.link}><h4>${post.title}</h4></a></div>`).join('');
  divPosts.innerHTML = divPostsInner;
};
