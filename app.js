document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const loginSection = document.getElementById('login-section');
    const commentSection = document.getElementById('comment-section');
    const usernameInput = document.getElementById('login-username');
    const commentInput = document.querySelector('.cmnt-input');
    const sendButton = document.querySelector('.bu-primary');
    const commentsWrapper = document.querySelector('.comments-wrp');
    const videoPlayer = document.getElementById('main-video');
    const videoList = document.getElementById('video-list');

    let comments = [];

    // Fetch comments from MongoDB
    async function fetchComments() {
        try {
            const response = await fetch('http://localhost:3000/api/comments');
            comments = await response.json();
            displayComments();
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    }

    function createCommentNode(comment, index) {
        if (!comment || !comment.text) return null;

        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        
        commentElement.innerHTML = `
            <div class="comment-header">
                <span class="comment-username">${comment.username || 'Anonymous'}</span>
                <span class="comment-date">${comment.date || new Date().toLocaleString()}</span>
            </div>
            <div class="comment-content">${comment.text}</div>
            <div class="comment-actions">
                <button class="reply-btn">
                    <i class="fas fa-reply"></i> Reply
                </button>
                ${comment.username === localStorage.getItem('username') ? `
                    <button class="edit-btn">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="delete-btn">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                ` : ''}
            </div>
            <div class="reply-form" style="display: none;">
                <textarea class="reply-input" placeholder="Write your reply..."></textarea>
                <button class="send-reply-btn">Send</button>
            </div>
            <div class="replies">
                ${(comment.replies || []).map((reply, replyIndex) => `
                    <div class="reply">
                        <span class="reply-username">${reply.username}</span>
                        <span class="reply-date">${reply.date}</span>
                        <div class="reply-text">${reply.text}</div>
                        ${reply.username === localStorage.getItem('username') ? `
                            <button class="delete-reply-btn" data-reply-index="${replyIndex}">
                                <i class="fas fa-trash"></i> Delete Reply
                            </button>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;

        // Reply functionality
        const replyBtn = commentElement.querySelector('.reply-btn');
        const replyForm = commentElement.querySelector('.reply-form');
        const sendReplyBtn = commentElement.querySelector('.send-reply-btn');
        const replyInput = commentElement.querySelector('.reply-input');

        replyBtn.addEventListener('click', () => {
            replyForm.style.display = replyForm.style.display === 'none' ? 'block' : 'none';
        });

        sendReplyBtn.addEventListener('click', async () => {
            const replyText = replyInput.value.trim();
            if (replyText) {
                try {
                    const response = await fetch(`http://localhost:3000/api/comments/${comment._id}/replies`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            username: localStorage.getItem('username'),
                            text: replyText,
                            date: new Date().toLocaleString()
                        })
                    });

                    if (response.ok) {
                        replyInput.value = '';
                        replyForm.style.display = 'none';
                        await fetchComments();
                    }
                } catch (error) {
                    console.error('Error posting reply:', error);
                }
            }
        });

        // Delete comment functionality
        const deleteBtn = commentElement.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', async () => {
                try {
                    const response = await fetch(`http://localhost:3000/api/comments/${comment._id}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        await fetchComments();
                    } else {
                        console.error('Failed to delete comment');
                    }
                } catch (error) {
                    console.error('Error deleting comment:', error);
                }
            });
        }

        // Delete reply functionality
        const replies = commentElement.querySelector('.replies');
        if (replies) {
            replies.addEventListener('click', async (e) => {
                const deleteReplyBtn = e.target.closest('.delete-reply-btn');
                if (deleteReplyBtn) {
                    const replyIndex = deleteReplyBtn.dataset.replyIndex;
                    
                    try {
                        const response = await fetch(`http://localhost:3000/api/comments/${comment._id}/replies/${replyIndex}`, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });

                        if (response.ok) {
                            await fetchComments();
                        } else {
                            console.error('Failed to delete reply');
                        }
                    } catch (error) {
                        console.error('Error deleting reply:', error);
                    }
                }
            });
        }

        // Edit functionality
        const editBtn = commentElement.querySelector('.edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                const contentDiv = commentElement.querySelector('.comment-content');
                const currentText = contentDiv.textContent.trim();
                contentDiv.innerHTML = `
                    <textarea class="edit-input">${currentText}</textarea>
                    <button class="save-edit-btn">Save</button>
                    <button class="cancel-edit-btn">Cancel</button>
                `;

                const saveBtn = contentDiv.querySelector('.save-edit-btn');
                const cancelBtn = contentDiv.querySelector('.cancel-edit-btn');
                const editInput = contentDiv.querySelector('.edit-input');

                saveBtn.addEventListener('click', async () => {
                    const newText = editInput.value.trim();
                    if (newText) {
                        try {
                            const response = await fetch(`http://localhost:3000/api/comments/${comment._id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    ...comment,
                                    text: newText
                                })
                            });

                            if (response.ok) {
                                await fetchComments();
                            }
                        } catch (error) {
                            console.error('Error updating comment:', error);
                        }
                    }
                });

                cancelBtn.addEventListener('click', () => {
                    contentDiv.innerHTML = currentText;
                });
            });
        }

        return commentElement;
    }

    function displayComments() {
        commentsWrapper.innerHTML = '';
        comments.forEach((comment, index) => {
            const commentNode = createCommentNode(comment, index);
            if (commentNode) {
                commentsWrapper.appendChild(commentNode);
            }
        });
    }

    sendButton.addEventListener('click', async function() {
        const commentText = commentInput.value.trim();
        if (commentText) {
            try {
                const response = await fetch('http://localhost:3000/api/comments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: localStorage.getItem('username') || 'Anonymous',
                        text: commentText,
                        date: new Date().toLocaleString(),
                        replies: []
                    })
                });

                if (response.ok) {
                    commentInput.value = '';
                    await fetchComments();
                }
            } catch (error) {
                console.error('Error posting comment:', error);
            }
        }
    });

    // Login functionality
    loginBtn.addEventListener('click', function() {
        const username = usernameInput.value.trim();
        if (username) {
            localStorage.setItem('username', username);
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
            usernameInput.style.display = 'none';
            commentSection.style.display = 'block';
            
            const welcomeMsg = document.createElement('span');
            welcomeMsg.textContent = `Welcome, ${username}!`;
            welcomeMsg.className = 'welcome-msg';
            loginSection.appendChild(welcomeMsg);

            fetchComments();
        } else {
            alert('Please enter a username');
        }
    });

    // Logout functionality
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('username');
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        usernameInput.style.display = 'inline-block';
        usernameInput.value = '';
        commentSection.style.display = 'none';
        
        const welcomeMsg = loginSection.querySelector('.welcome-msg');
        if (welcomeMsg) {
            welcomeMsg.remove();
        }
    });

    // Check for stored username
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
        usernameInput.value = storedUsername;
        loginBtn.click();
    }

    // Initial fetch of comments
    fetchComments();

    // Add click event listeners to all playlist items
    videoList.addEventListener('click', function(e) {
        // Find the closest li element from the clicked element
        const listItem = e.target.closest('li');
        
        if (listItem) {
            // Get the video filename from data-video attribute
            const videoSrc = listItem.getAttribute('data-video');
            
            // Update the video source
            videoPlayer.src = videoSrc;
            
            // Load and play the new video
            videoPlayer.load();
            videoPlayer.play();

            // Remove 'active' class from all items and add to clicked item
            document.querySelectorAll('#video-list li').forEach(item => {
                item.classList.remove('active');
            });
            listItem.classList.add('active');
        }
    });
});