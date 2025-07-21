import { auth, database, storage, messaging } from './firebaseConfig.js'; // messaging should be exported there
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
import {
  getToken,
  onMessage
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging.js';

const postContent = document.getElementById('postContent');
const postImage = document.getElementById('postImage');
const submitPost = document.getElementById('submitPost');
const postsDiv = document.getElementById('posts');
const signOutBtn = document.getElementById('signOut');
const openChatBtn = document.getElementById('openChatBtn');

// Redirect if not logged in
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'signin.html';
  } else {
    // ✅ Request permission for notifications
    try {
      const currentToken = await getToken(messaging, {
        vapidKey: 'BGYu3HK3lQOkMrBEaQ7F_bRHqPDNB8OrdnfrDeGfWZl1vNwG4EcP5EwQseq0m_sG32poAgOjuLfoniKZ3Ua9hZ4' // Replace with your actual VAPID key from Firebase Console
      });
      if (currentToken) {
        console.log('FCM token received:', currentToken);
        // You can store the token in the database under the user if needed
      } else {
        console.warn('No FCM token available. Request permission to generate one.');
      }
    } catch (err) {
      console.error('An error occurred while retrieving token:', err);
    }

    // ✅ Listen for messages while app is open
    onMessage(messaging, (payload) => {
      console.log('Message received:', payload);
      // Optionally show an in-app notification
      alert(payload.notification?.title || 'New Notification');
    });
  }
});

// ... your linkify and post submission functions stay the same ...

// Display posts with Like buttons
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
  `;

  postsDiv.prepend(postElement);

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