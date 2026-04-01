function initForum(container, chId) {
  const key = 'bsl_forum_' + chId;
  const comments = JSON.parse(localStorage.getItem(key) || '[]');

  function render() {
    const list = container.querySelector('.comment-list');
    if (!list) return;
    if (comments.length === 0) {
      list.innerHTML = '<div class="no-comments">No comments yet. Be the first to share your thoughts!</div>';
      return;
    }
    list.innerHTML = comments.map((c, i) => `
      <div class="comment">
        <div class="comment-header">
          <div class="comment-avatar">${c.name.charAt(0).toUpperCase()}</div>
          <div class="comment-meta">
            <div class="name">${esc(c.name)}</div>
            <div class="time">${timeAgo(c.time)}</div>
          </div>
        </div>
        <div class="comment-body">${esc(c.text)}</div>
        <div class="comment-actions">
          <button onclick="likeComment('${chId}',${i})">👍 ${c.likes||0}</button>
          <button onclick="deleteComment('${chId}',${i})">🗑️ Delete</button>
        </div>
      </div>`).join('');
  }

  // Submit handler
  const form = container.querySelector('.comment-form');
  if (form) {
    const nameInput = form.querySelector('input');
    const textInput = form.querySelector('textarea');
    const submitBtn = form.querySelector('.comment-submit');

    submitBtn.addEventListener('click', () => {
      const name = nameInput.value.trim() || 'Anonymous';
      const text = textInput.value.trim();
      if (!text) return;
      comments.unshift({ name, text, time: Date.now(), likes: 0 });
      localStorage.setItem(key, JSON.stringify(comments));
      nameInput.value = '';
      textInput.value = '';
      render();
    });

    textInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && e.ctrlKey) submitBtn.click();
    });
  }

  render();
}

// Global functions for button onclick
window.likeComment = function(chId, idx) {
  const key = 'bsl_forum_' + chId;
  const comments = JSON.parse(localStorage.getItem(key) || '[]');
  if (comments[idx]) {
    comments[idx].likes = (comments[idx].likes || 0) + 1;
    localStorage.setItem(key, JSON.stringify(comments));
    // Re-render
    const forum = document.getElementById('forum');
    if (forum) initForum(forum, chId);
  }
};

window.deleteComment = function(chId, idx) {
  if (!confirm('Delete this comment?')) return;
  const key = 'bsl_forum_' + chId;
  const comments = JSON.parse(localStorage.getItem(key) || '[]');
  comments.splice(idx, 1);
  localStorage.setItem(key, JSON.stringify(comments));
  const forum = document.getElementById('forum');
  if (forum) initForum(forum, chId);
};

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  const days = Math.floor(hrs / 24);
  return days + 'd ago';
}
