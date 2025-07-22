import { auth, database, storage } from './firebaseConfig.js';
import {
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import {
  ref as dbRef,
  push,
  set,
  update,
  get,
  remove,
  onChildAdded
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';

const postContent = document.getElementById('postContent');
const postImage = document.getElementById('postImage');
const submitPost = document.getElementById('submitPost');
const postsDiv = document.getElementById('posts');
const signOutBtn = document.getElementById('signOut');
const openChatBtn = document.getElementById('openChatBtn');

// Redirect if not logged in
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = 'signin.html';
  }
});

// Convert links to clickable links
function linkify(text) {
  const urlPattern = /(\b(https?:\/\/|www\.)[^\s<>]+(?:\.[^\s<>]+)*(?:\/[^\s<>]*)?)/gi;
  return text.replace(urlPattern, (match) => {
    const url = match.startsWith('http') ? match : `https://${match}`;
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${match}</a>`;
  });
}

// Post submission
submitPost.addEventListener('click', async () => {
  const content = postContent.value.trim();
  const imageFile = postImage.files[0];

  if (!content && !imageFile) return;

  const user = auth.currentUser;
  if (!user) return;

  const postRef = push(dbRef(database, 'posts'));
  const postKey = postRef.key;

  const newPost = {
    uid: user.uid,
    username: user.displayName || 'Anonymous',
    content: content,
    timestamp: Date.now()
  };

  await set(postRef, newPost);

  if (imageFile) {
    const imgRef = storageRef(storage, `postImages/${postKey}`);
    await uploadBytes(imgRef, imageFile);
    const imageURL = await getDownloadURL(imgRef);
    await update(postRef, { imageURL });
  }

  postContent.value = '';
  postImage.value = '';
});

// Display posts with like + comment functionality
const postFeedRef = dbRef(database, 'posts');
onChildAdded(postFeedRef, async (snapshot) => {
  const post = snapshot.val();
  const postId = snapshot.key;
  const user = auth.currentUser;

  const postElement = document.createElement('div');
  postElement.className = 'post';

  const likeCount = post.likes ? Object.keys(post.likes).length : 0;
  const userLiked = post.likes && post.likes[user.uid];

  const linkedContent = linkify(post.content);

  postElement.innerHTML = `
    <strong>${post.username}</strong><br/>
    <p>${linkedContent}</p>
    ${post.imageURL ? `<img src="${post.imageURL}" alt="Post image" style="max-width: 300px; max-height: 300px;" />` : ''}
    <div>
      <button class="likeBtn" data-post-id="${postId}">
        ${userLiked ? '💙 Unlike' : '🤍 Like'}
      </button>
      <span class="likeCount">${likeCount} ${likeCount === 1 ? 'like' : 'likes'}</span>
    </div>
    <small>${new Date(post.timestamp).toLocaleString()}</small>

    <div class="comment-section">
      <input type="text" class="commentInput" placeholder="Add a comment..." />
      <button class="submitComment">Post</button>
      <div class="commentList"></div>
    </div>
  `;

  postsDiv.prepend(postElement);

  // Like functionality
  const likeBtn = postElement.querySelector('.likeBtn');
  const likeCountSpan = postElement.querySelector('.likeCount');

  likeBtn.addEventListener('click', async () => {
    const likeRef = dbRef(database, `posts/${postId}/likes/${user.uid}`);
    const currentLikeSnap = await get(likeRef);

    if (currentLikeSnap.exists()) {
      await remove(likeRef); // Unlike
    } else {
      await set(likeRef, true); // Like
    }

    const updatedPostSnap = await get(dbRef(database, `posts/${postId}`));
    const updatedPost = updatedPostSnap.val();
    const newLikeCount = updatedPost.likes ? Object.keys(updatedPost.likes).length : 0;
    const hasLiked = updatedPost.likes && updatedPost.likes[user.uid];

    likeBtn.textContent = hasLiked ? '💙 Unlike' : '🤍 Like';
    likeCountSpan.textContent = `${newLikeCount} ${newLikeCount === 1 ? 'like' : 'likes'}`;
  });

  // Comment functionality
  const commentInput = postElement.querySelector('.commentInput');
  const submitCommentBtn = postElement.querySelector('.submitComment');
  const commentList = postElement.querySelector('.commentList');

  submitCommentBtn.addEventListener('click', async () => {
    const commentText = commentInput.value.trim();
    if (!commentText) return;

    const commentRef = push(dbRef(database, `comments/${postId}`));
    const newComment = {
      uid: user.uid,
      username: user.displayName || 'Anonymous',
      text: commentText,
      timestamp: Date.now()
    };

    await set(commentRef, newComment);
    commentInput.value = '';
  });

  // Load existing and new comments
  const commentRef = dbRef(database, `comments/${postId}`);
  onChildAdded(commentRef, (snapshot) => {
    const comment = snapshot.val();
    const commentElement = document.createElement('div');
    commentElement.innerHTML = `<strong>${comment.username}</strong>: ${comment.text} <small>${new Date(comment.timestamp).toLocaleTimeString()}</small>`;
    commentList.appendChild(commentElement);
  });
});

// Sign out
signOutBtn?.addEventListener('click', () => {
  signOut(auth).then(() => {
    window.location.href = 'index.html';
  });
});

// Open chat
openChatBtn?.addEventListener('click', () => {
  window.open('https://dman1991g.github.io/Real-time-multi-person-chat-app/', '_blank');
});