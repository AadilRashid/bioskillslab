const FORUM_API = '/api';

function initForum(container, chId) {
  container.innerHTML = `
    <div class="comment-form">
      <h4><i data-lucide="message-circle" style="width:18px;height:18px;display:inline;vertical-align:middle;"></i> Join the Discussion</h4>
      <div style="display:flex;gap:.75rem;flex-wrap:wrap;">
        <input id="cf-name" type="text" placeholder="Your name (optional)" style="flex:1;min-width:140px;padding:.65rem 1rem;background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:.9rem;">
        <input id="cf-email" type="email" placeholder="Email (optional, never shown)" style="flex:1;min-width:180px;padding:.65rem 1rem;background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:.9rem;">
      </div>
      <textarea id="cf-text" placeholder="Share your thoughts, ask a question, or help others..." rows="4" style="width:100%;margin-top:.75rem;padding:.75rem 1rem;background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:.9rem;resize:vertical;box-sizing:border-box;"></textarea>
      <div style="display:flex;align-items:center;gap:1rem;margin-top:.75rem;">
        <button id="cf-submit" style="padding:.6rem 1.5rem;background:var(--accent);color:#0f172a;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:.9rem;">Post Comment</button>
        <span id="cf-msg" style="font-size:.85rem;"></span>
      </div>
    </div>
    <div id="cf-list" style="margin-top:1.5rem;"></div>
  `;
  lucide.createIcons();
  loadComments(chId);
  document.getElementById('cf-submit').addEventListener('click', () => postComment(chId));
  document.getElementById('cf-text').addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.ctrlKey) postComment(chId);
  });
}

function getTokens() {
  return JSON.parse(localStorage.getItem('bsl_comment_tokens') || '{}');
}

function saveToken(id, token) {
  const tokens = getTokens();
  tokens[id] = token;
  localStorage.setItem('bsl_comment_tokens', JSON.stringify(tokens));
}

function loadComments(chId) {
  const list = document.getElementById('cf-list');
  if (!list) return;
  list.innerHTML = '<p style="color:var(--text-muted);font-size:.85rem;">Loading comments...</p>';
  fetch(`${FORUM_API}/get_comments.php?chapter=${encodeURIComponent(chId)}`)
    .then(r => r.json())
    .then(comments => {
      if (!comments.length) {
        list.innerHTML = '<p style="color:var(--text-muted);font-size:.85rem;">No comments yet. Be the first!</p>';
        return;
      }
      const tokens = getTokens();
      list.innerHTML = comments.map(c => {
        const isOwner = !!tokens[c.id];
        const edited = c.updated_at !== c.created_at
          ? `<span style="font-size:.72rem;color:var(--text-muted);margin-left:.5rem;">(edited)</span>` : '';
        const actions = isOwner ? `
          <div style="margin-top:.5rem;display:flex;gap:.75rem;">
            <button onclick="editComment(${c.id},'${chId}')" style="font-size:.78rem;background:none;border:none;color:var(--accent);cursor:pointer;padding:0;">Edit</button>
            <button onclick="deleteComment(${c.id},'${chId}')" style="font-size:.78rem;background:none;border:none;color:var(--red);cursor:pointer;padding:0;">Delete</button>
          </div>` : '';
        return `
          <div id="comment-${c.id}" style="padding:1rem;background:var(--bg-card);border:1px solid var(--border);border-radius:10px;margin-bottom:.75rem;">
            <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.5rem;">
              <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--purple));display:flex;align-items:center;justify-content:center;font-weight:700;color:#0f172a;flex-shrink:0;">${c.name.charAt(0).toUpperCase()}</div>
              <div>
                <div style="font-weight:600;font-size:.9rem;">${c.name}${edited}</div>
                <div style="font-size:.75rem;color:var(--text-muted);">${timeAgo(c.created_at)}</div>
              </div>
            </div>
            <p id="comment-text-${c.id}" style="font-size:.9rem;margin:0;line-height:1.6;">${c.text}</p>
            ${actions}
          </div>`;
      }).join('');
    })
    .catch(() => {
      list.innerHTML = '<p style="color:var(--text-muted);font-size:.85rem;">Could not load comments.</p>';
    });
}

function postComment(chId) {
  const name  = document.getElementById('cf-name').value.trim()  || 'Anonymous';
  const email = document.getElementById('cf-email').value.trim();
  const text  = document.getElementById('cf-text').value.trim();
  const msg   = document.getElementById('cf-msg');

  if (!text) { msg.innerHTML = '<span style="color:var(--red)">Please write something first.</span>'; return; }

  msg.innerHTML = '<span style="color:var(--text-muted)">Posting...</span>';
  document.getElementById('cf-submit').disabled = true;

  fetch(`${FORUM_API}/post_comment.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chapter: chId, name, email, text })
  })
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        saveToken(res.id, res.token);
        msg.innerHTML = '<span style="color:var(--green)">✓ Posted!</span>';
        document.getElementById('cf-text').value = '';
        document.getElementById('cf-name').value = '';
        document.getElementById('cf-email').value = '';
        loadComments(chId);
      } else {
        msg.innerHTML = `<span style="color:var(--red)">${res.error || 'Something went wrong.'}</span>`;
      }
    })
    .catch(() => { msg.innerHTML = '<span style="color:var(--red)">Network error. Try again.</span>'; })
    .finally(() => { document.getElementById('cf-submit').disabled = false; });
}

window.editComment = function(id, chId) {
  const p = document.getElementById(`comment-text-${id}`);
  if (!p) return;
  const current = p.textContent;
  p.outerHTML = `
    <textarea id="edit-area-${id}" rows="3" style="width:100%;padding:.65rem;background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:.9rem;resize:vertical;box-sizing:border-box;">${current}</textarea>
    <div style="display:flex;gap:.75rem;margin-top:.5rem;">
      <button onclick="submitEdit(${id},'${chId}')" style="padding:.4rem 1rem;background:var(--accent);color:#0f172a;border:none;border-radius:6px;font-weight:600;cursor:pointer;font-size:.85rem;">Save</button>
      <button onclick="loadComments('${chId}')" style="padding:.4rem 1rem;background:var(--bg-card);border:1px solid var(--border);border-radius:6px;color:var(--text);cursor:pointer;font-size:.85rem;">Cancel</button>
    </div>`;
};

window.submitEdit = function(id, chId) {
  const text  = document.getElementById(`edit-area-${id}`).value.trim();
  const token = getTokens()[id];
  if (!text || !token) return;

  fetch(`${FORUM_API}/edit_comment.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, token, text })
  })
    .then(r => r.json())
    .then(res => {
      if (res.success) loadComments(chId);
    });
};

window.deleteComment = function(id, chId) {
  if (!confirm('Delete your comment?')) return;
  const token = getTokens()[id];
  if (!token) return;

  fetch(`${FORUM_API}/delete_comment.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, token })
  })
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        const tokens = getTokens();
        delete tokens[id];
        localStorage.setItem('bsl_comment_tokens', JSON.stringify(tokens));
        loadComments(chId);
      }
    });
};

function timeAgo(ts) {
  const d = new Date(ts + 'Z');
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  return d.toLocaleDateString(undefined, { day:'numeric', month:'short', year:'numeric' });
}
