export default (data) => {
  const postsDiv = document.querySelector('[name="posts"]');
  postsDiv.innerHTML = '';
  data.posts.forEach((post) => {
    const div = document.createElement('div');
    const a = document.createElement('a');
    a.setAttribute('href', post.link);
    const h5 = document.createElement('h5');
    h5.textContent = post.title;
    a.appendChild(h5);
    div.appendChild(a);
    postsDiv.appendChild(div);
  });
};
