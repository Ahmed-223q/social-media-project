/**
 * FaceNote - Social Media Web Application
 * Clean, Modular & Production-Ready JavaScript
 */

// ==========================================
// 1. Constants & Application State
// ==========================================
const API_BASE_URL = "https://tarmeezacademy.com/api/v1";
const POSTS_LIMIT = 6;
const PROFILE_POSTS_LIMIT = 5;

const state = {
  feedCurrentPage: 1,
  feedLastPage: 1,
  isLoadingFeed: false,
  selectedPostId: null,
  profilePosts: [],
  profileCurrentPage: 1
};

// ==========================================
// 2. Utilities & Helper Functions
// ==========================================

/**
 * Escapes HTML characters to prevent XSS attacks.
 */
function escapeHtml(text) {
  if (text == null) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isSubfolder() {
  return window.location.pathname.toLowerCase().includes("qdetailspost");
}

function getBasePath() {
  return isSubfolder() ? "./" : "qdetailspost/";
}

function getHomePath() {
  return isSubfolder() ? "../index.html" : "./index.html";
}

function getProfilePath(userId) {
  const base = getBasePath();
  return userId ? `${base}profile.html?userId=${userId}` : `${base}profile.html`;
}

function getDetailsPath(postId) {
  const base = getBasePath();
  return `${base}DetailsPost.html?postId=${postId}`;
}

function getDefaultAvatar() {
  return isSubfolder() ? "../profile-pics/user.png" : "./profile-pics/user.png";
}

function getSafeAvatar(imageUrl) {
  if (
    typeof imageUrl === "string" &&
    imageUrl.trim() !== "" &&
    !imageUrl.includes("[object") &&
    !imageUrl.includes("undefined") &&
    imageUrl !== "{}"
  ) {
    return imageUrl;
  }
  return getDefaultAvatar();
}

function getSafePostImage(imageUrl) {
  if (
    typeof imageUrl === "string" &&
    imageUrl.trim() !== "" &&
    !imageUrl.includes("[object") &&
    !imageUrl.includes("undefined") &&
    (imageUrl.startsWith("http") || imageUrl.startsWith("data:"))
  ) {
    return imageUrl;
  }
  return null;
}

function getAuthToken() {
  return localStorage.getItem("token");
}

function getAuthUser() {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
}

function getAuthHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getCurrentUserIdFromUrlOrAuth() {
  const urlParams = new URLSearchParams(window.location.search);
  const idFromUrl = urlParams.get("userId");
  if (idFromUrl) return idFromUrl;
  const user = getAuthUser();
  return user && user.id ? user.id : null;
}

// ==========================================
// 3. UI Notifications & Form Validation
// ==========================================

function appendAlert(message, type = "info") {
  const alertPlaceholder = document.getElementById("liveAlertPlaceholder");
  if (!alertPlaceholder) return;

  const iconMap = {
    success: "check-circle-fill",
    danger: "exclamation-circle-fill",
    warning: "exclamation-triangle-fill",
    info: "info-circle-fill"
  };

  const icon = iconMap[type] || "info-circle-fill";
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show shadow d-flex align-items-center gap-2" role="alert">
      <i class="bi bi-${icon} fs-5"></i>
      <div class="flex-grow-1">${escapeHtml(message)}</div>
      <button type="button" class="btn-close shadow-none" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
  alertPlaceholder.append(wrapper);

  setTimeout(() => {
    try {
      const bsAlert = bootstrap.Alert.getOrCreateInstance(wrapper.firstElementChild);
      if (bsAlert) bsAlert.close();
    } catch (e) {
      wrapper.remove();
    }
  }, 4000);
}

function showInputError(inputId, errorId, message) {
  const inputEl = document.getElementById(inputId);
  const errorEl = document.getElementById(errorId);
  if (inputEl) {
    inputEl.classList.add("is-invalid");
  }
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = "block";
  }
}

function clearInputError(inputId, errorId) {
  const inputEl = document.getElementById(inputId);
  const errorEl = document.getElementById(errorId);
  if (inputEl) {
    inputEl.classList.remove("is-invalid");
  }
  if (errorEl) {
    errorEl.textContent = "";
    errorEl.style.display = "none";
  }
}

function clearAllErrors(formOrModalId) {
  const container = document.getElementById(formOrModalId);
  if (!container) return;
  container.querySelectorAll(".is-invalid").forEach((input) => {
    input.classList.remove("is-invalid");
  });
  container.querySelectorAll(".text-danger.small").forEach((err) => {
    err.textContent = "";
    err.style.display = "none";
  });
}

function setupInputListeners() {
  const fields = [
    { input: "username-input", error: "login-username-error" },
    { input: "password-input", error: "login-password-error" },
    { input: "re-name-input", error: "re-name-error" },
    { input: "re-username-input", error: "re-username-error" },
    { input: "re-password-input", error: "re-password-error" },
    { input: "re-image-input", error: "re-image-error" },
    { input: "post-title-input", error: "post-title-error" },
    { input: "post-body-input", error: "post-body-error" },
    { input: "editTitle", error: "edit-title-error" },
    { input: "editBody", error: "edit-body-error" }
  ];

  fields.forEach(({ input, error }) => {
    const el = document.getElementById(input);
    if (el) {
      el.addEventListener("input", () => clearInputError(input, error));
      el.addEventListener("change", () => clearInputError(input, error));
    }
  });
}

function hideModal(modalId) {
  const modalEl = document.getElementById(modalId);
  if (modalEl) {
    const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modalInstance.hide();
  }
}

// ==========================================
// 4. Navigation & User Authentication
// ==========================================

function setupUI() {
  const token = getAuthToken();
  const logoutBtnDiv = document.getElementById("logoutBtnDiv");
  const loginBtnDiv = document.getElementById("loginBtnDiv");
  const addBtn = document.getElementById("addBtn");

  if (token == null) {
    if (loginBtnDiv) {
      loginBtnDiv.classList.remove("d-none");
      loginBtnDiv.style.setProperty("display", "flex", "important");
    }
    if (logoutBtnDiv) {
      logoutBtnDiv.classList.add("d-none");
      logoutBtnDiv.style.setProperty("display", "none", "important");
    }
    if (addBtn) {
      addBtn.classList.add("d-none");
      addBtn.style.setProperty("display", "none", "important");
    }
  } else {
    if (loginBtnDiv) {
      loginBtnDiv.classList.add("d-none");
      loginBtnDiv.style.setProperty("display", "none", "important");
    }
    if (logoutBtnDiv) {
      logoutBtnDiv.classList.remove("d-none");
      logoutBtnDiv.style.setProperty("display", "flex", "important");
    }
    if (addBtn) {
      addBtn.classList.remove("d-none");
      addBtn.style.setProperty("display", "flex", "important");
    }
    GetUserData();
  }
}

function GetUserData() {
  const user = getAuthUser();
  if (!user) return;

  const userName = document.getElementById("userName");
  const userImage = document.getElementById("userImage");

  if (userName && user.username) {
    userName.innerText = user.username;
  }
  if (userImage) {
    userImage.src = getSafeAvatar(user.profile_image);
  }
}

async function loginBtnClick() {
  const userNameInput = document.getElementById("username-input");
  const passwordInput = document.getElementById("password-input");
  const userName = userNameInput ? userNameInput.value.trim() : "";
  const password = passwordInput ? passwordInput.value : "";

  clearAllErrors("loginModal");

  let hasError = false;
  if (!userName) {
    showInputError("username-input", "login-username-error", "This field is required.");
    hasError = true;
  }
  if (!password) {
    showInputError("password-input", "login-password-error", "This field is required.");
    hasError = true;
  }
  if (hasError) return;

  try {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      username: userName,
      password: password
    });

    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));

    hideModal("loginModal");
    setupUI();
    appendAlert("Logged in successfully!", "success");
    refreshCurrentPage();
  } catch (error) {
    const errorMsg =
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : "Invalid username or password.";

    showInputError("username-input", "login-username-error", errorMsg);
    showInputError("password-input", "login-password-error", errorMsg);
    appendAlert("Invalid username or password.", "danger");
  }
}

async function RegisterBtnClick() {
  const reNameInput = document.getElementById("re-name-input");
  const reUserNameInput = document.getElementById("re-username-input");
  const rePasswordInput = document.getElementById("re-password-input");
  const reImageInput = document.getElementById("re-image-input");

  const reName = reNameInput ? reNameInput.value.trim() : "";
  const reUserName = reUserNameInput ? reUserNameInput.value.trim() : "";
  const rePassword = rePasswordInput ? rePasswordInput.value : "";
  const reImage = reImageInput && reImageInput.files ? reImageInput.files[0] : null;

  clearAllErrors("RegisterModal");

  let hasError = false;
  if (!reName) {
    showInputError("re-name-input", "re-name-error", "This field is required.");
    hasError = true;
  }
  if (!reUserName) {
    showInputError("re-username-input", "re-username-error", "This field is required.");
    hasError = true;
  }
  if (!rePassword) {
    showInputError("re-password-input", "re-password-error", "This field is required.");
    hasError = true;
  } else if (rePassword.length < 6) {
    showInputError("re-password-input", "re-password-error", "Password must be at least 6 characters.");
    hasError = true;
  }
  if (hasError) return;

  const formData = new FormData();
  formData.append("username", reUserName);
  formData.append("password", rePassword);
  formData.append("name", reName);
  if (reImage) {
    formData.append("image", reImage);
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/register`, formData);
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));

    hideModal("RegisterModal");
    appendAlert("Account created successfully!", "success");
    setupUI();
    refreshCurrentPage();
  } catch (error) {
    let alertMsg = "Registration failed. Please check the fields below.";
    if (error.response && error.response.data) {
      const data = error.response.data;
      if (data.errors) {
        if (data.errors.username) {
          const msg = data.errors.username.join(", ");
          const userMsg = msg.toLowerCase().includes("taken")
            ? "This username is already taken. Please choose another."
            : msg;
          showInputError("re-username-input", "re-username-error", userMsg);
        }
        if (data.errors.password) {
          const msg = data.errors.password.join(", ");
          const passMsg = msg.toLowerCase().includes("at least")
            ? "Password must be at least 6 characters."
            : msg;
          showInputError("re-password-input", "re-password-error", passMsg);
        }
        if (data.errors.name) {
          showInputError("re-name-input", "re-name-error", data.errors.name.join(", "));
        }
        if (data.errors.image) {
          showInputError("re-image-input", "re-image-error", data.errors.image.join(", "));
        }
      } else if (data.message) {
        if (data.message.toLowerCase().includes("username") || data.message.toLowerCase().includes("taken")) {
          showInputError("re-username-input", "re-username-error", "This username is already taken. Please choose another.");
        } else {
          showInputError("re-username-input", "re-username-error", data.message);
        }
      }
    }
    appendAlert(alertMsg, "danger");
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  setupUI();
  appendAlert("Logged out successfully!", "info");

  if (window.location.pathname.toLowerCase().includes("profile.html")) {
    window.location.href = getHomePath();
  } else {
    refreshCurrentPage();
  }
}

function userClicked(userId, event) {
  if (event) event.stopPropagation();
  if (!userId) return;
  window.location.href = getProfilePath(userId);
}

function postClicked(postId) {
  if (!postId) return;
  window.location.href = getDetailsPath(postId);
}

function profileNavClicked() {
  const token = getAuthToken();
  const user = getAuthUser();

  if (token && user && user.id) {
    const targetUrl = getProfilePath(user.id);
    const urlParams = new URLSearchParams(window.location.search);
    const currentUserIdInUrl = urlParams.get("userId");

    if (window.location.pathname.includes("profile.html")) {
      if (currentUserIdInUrl == user.id) {
        getUser();
        getUserPostes();
      } else {
        window.location.href = targetUrl;
      }
    } else {
      window.location.href = targetUrl;
    }
  } else {
    appendAlert("Please log in first to view your profile.", "warning");
    const loginModalEl = document.getElementById("loginModal");
    if (loginModalEl) {
      const modal = bootstrap.Modal.getOrCreateInstance(loginModalEl);
      modal.show();
    }
  }
}

function refreshCurrentPage() {
  if (document.getElementById("container")) {
    getPostes(1, true);
  } else if (document.getElementById("postDeatils")) {
    getPost();
  } else if (document.getElementById("userPostes")) {
    getUser();
    getUserPostes();
  }
}

// ==========================================
// 5. Reusable Post Card Generator (Clean Code)
// ==========================================

/**
 * Creates clean, uniform HTML for any Post Card across Feed, Details, or Profile.
 */
function createPostCardHtml(post, options = {}) {
  const { isDetails = false, tagPrefix = "post-tags" } = options;
  const currentUser = getAuthUser();
  const authorImage = getSafeAvatar(post.author ? post.author.profile_image : null);
  const postImage = getSafePostImage(post.image);
  const authorName = post.author ? escapeHtml(post.author.username || post.author.name) : "User";
  const authorId = post.author ? post.author.id : null;

  let editBtn = "";
  let deleteBtn = "";
  if (currentUser && post.author && currentUser.id == post.author.id) {
    const postJsonStr = encodeURIComponent(JSON.stringify(post));
    editBtn = `<button class="btn btn-outline-success btn-sm me-1" data-bs-toggle="modal" data-bs-target="#editModal" onclick="event.stopPropagation(); prepareEditPostFromEncoded('${postJsonStr}')">Edit</button>`;
    deleteBtn = `<button class="btn btn-outline-danger btn-sm" data-bs-toggle="modal" data-bs-target="#DeleteModal" onclick="event.stopPropagation(); prepareDeletePost(${post.id})">Delete</button>`;
  }

  const postImgHtml = postImage
    ? `<img src="${postImage}" alt="Post image" style="width: 100%; max-height: 500px; object-fit: cover;" class="rounded my-2" />`
    : "";

  let tagsHtml = "";
  if (post.tags && Array.isArray(post.tags)) {
    tagsHtml = post.tags.map((tag) => `<span class="badge bg-secondary me-1">${escapeHtml(tag.name)}</span>`).join("");
  }

  const clickAttr = isDetails ? "" : `onclick="postClicked(${post.id})" style="cursor: pointer;"`;

  return `
    <div class="col-12 col-md-9 m-auto shadow-sm rounded mb-4" id="post-${post.id}">
      <div class="card" ${clickAttr}>
        <div class="card-header d-flex justify-content-between align-items-center bg-white">
          <div style="cursor: pointer; display: flex; align-items: center; gap: 10px;" onclick="userClicked(${authorId}, event)" title="View Profile">
            <img src="${authorImage}" onerror="this.src='${getDefaultAvatar()}'" alt="" style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover;" class="border border-secondary" />
            <span style="font-size: 1.15rem; font-weight: 600; color: #212529;">${authorName}</span>
          </div>
          <div>
            ${editBtn}
            ${deleteBtn}
          </div>
        </div>
        <div class="card-body">
          ${postImgHtml}
          <span style="color: #6c757d; font-size: 0.85rem;">${escapeHtml(post.created_at || "")}</span>
          <h4 class="mt-2 text-dark">${escapeHtml(post.title || "")}</h4>
          <p class="text-secondary">${escapeHtml(post.body || "")}</p>
          <hr />
          <div class="d-flex justify-content-between align-items-center">
            <span class="text-muted"><i class="bi bi-chat-left-text me-1"></i>(${post.comments_count || 0}) comments</span>
            <span id="${tagPrefix}-${post.id}">${tagsHtml}</span>
          </div>
          ${isDetails ? `<div class="mt-3" id="post-details-comments-section"></div>` : ""}
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// 6. Home Feed & Infinite Scroll
// ==========================================

async function getPostes(page = 1, reload = false) {
  const container = document.getElementById("container");
  if (!container) return;

  if (reload) {
    state.feedCurrentPage = 1;
    container.innerHTML = "";
    removeFeedPaginationControls();
  }

  state.isLoadingFeed = true;
  showFeedLoader(true);

  try {
    const response = await axios.get(`${API_BASE_URL}/posts?limit=${POSTS_LIMIT}&page=${page}`);
    state.feedLastPage = response.data.meta.last_page;
    state.feedCurrentPage = response.data.meta.current_page;
    const posts = response.data.data;

    for (const post of posts) {
      container.innerHTML += createPostCardHtml(post, { isDetails: false, tagPrefix: "post-tags" });
    }

    showFeedLoader(false);
    state.isLoadingFeed = false;
    updateFeedPaginationControls();
  } catch (error) {
    showFeedLoader(false);
    state.isLoadingFeed = false;
  }
}

function showFeedLoader(show) {
  let loader = document.getElementById("posts-loader");
  const container = document.getElementById("container");
  if (!container) return;

  if (!loader) {
    loader = document.createElement("div");
    loader.id = "posts-loader";
    loader.className = "text-center my-4";
    loader.innerHTML = `
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="text-muted mt-2 small">Loading posts...</p>
    `;
    container.parentElement.appendChild(loader);
  }
  loader.style.display = show ? "block" : "none";
}

function updateFeedPaginationControls() {
  const container = document.getElementById("container");
  if (!container) return;

  let controlsDiv = document.getElementById("feed-pagination-controls");
  if (!controlsDiv) {
    controlsDiv = document.createElement("div");
    controlsDiv.id = "feed-pagination-controls";
    controlsDiv.className = "text-center my-4";
    container.parentElement.appendChild(controlsDiv);
  }

  if (state.feedCurrentPage < state.feedLastPage) {
    controlsDiv.innerHTML = `
      <div class="d-flex flex-column align-items-center gap-2">
        <button class="btn btn-primary shadow px-4 py-2 rounded-pill" onclick="loadNextFeedPage()" id="loadMoreBtn">
          <i class="bi bi-arrow-down-circle me-2"></i>Load more posts (${state.feedCurrentPage} of ${state.feedLastPage})
        </button>
        <span class="text-muted small">or scroll down to auto-load ⬇️</span>
      </div>
    `;
  } else {
    controlsDiv.innerHTML = `
      <div class="alert alert-secondary d-inline-block px-4 py-2 text-muted shadow-sm rounded-pill">
        🎉 You have reached the end of all posts
      </div>
    `;
  }
}

function removeFeedPaginationControls() {
  const controlsDiv = document.getElementById("feed-pagination-controls");
  if (controlsDiv) controlsDiv.remove();
}

function loadNextFeedPage() {
  if (state.feedCurrentPage < state.feedLastPage && !state.isLoadingFeed) {
    state.feedCurrentPage++;
    getPostes(state.feedCurrentPage, false);
  }
}

window.addEventListener("scroll", () => {
  const container = document.getElementById("container");
  if (!container) return;

  const endOfPage =
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 250;

  if (endOfPage && state.feedCurrentPage < state.feedLastPage && !state.isLoadingFeed) {
    state.feedCurrentPage++;
    getPostes(state.feedCurrentPage, false);
  }
});

// ==========================================
// 7. Post CRUD Operations
// ==========================================

async function createNewPostList() {
  const postTitleInput = document.getElementById("post-title-input");
  const postBodyInput = document.getElementById("post-body-input");
  const imageInputEl = document.getElementById("post-image-input");

  const postTitle = postTitleInput ? postTitleInput.value : "";
  const postBody = postBodyInput ? postBodyInput.value.trim() : "";
  const imageInput = imageInputEl && imageInputEl.files ? imageInputEl.files[0] : null;

  clearAllErrors("createNewPost");

  if (!postBody) {
    showInputError("post-body-input", "post-body-error", "This field is required.");
    return;
  }

  const token = getAuthToken();
  if (!token) {
    appendAlert("You must be logged in to create a post.", "danger");
    return;
  }

  const formData = new FormData();
  formData.append("body", postBody);
  formData.append("title", postTitle);
  if (imageInput) {
    formData.append("image", imageInput);
  }

  try {
    await axios.post(`${API_BASE_URL}/posts`, formData, { headers: getAuthHeaders() });
    hideModal("createNewPost");

    if (postTitleInput) postTitleInput.value = "";
    if (postBodyInput) postBodyInput.value = "";
    if (imageInputEl) imageInputEl.value = "";

    appendAlert("Post published successfully!", "success");
    refreshCurrentPage();
  } catch (error) {
    appendAlert("Failed to publish post. Please try again.", "danger");
  }
}

function prepareEditPostFromEncoded(encodedPostJson) {
  try {
    const post = JSON.parse(decodeURIComponent(encodedPostJson));
    state.selectedPostId = post.id;
    const titleInput = document.getElementById("editTitle");
    const bodyInput = document.getElementById("editBody");
    if (titleInput) titleInput.value = post.title || "";
    if (bodyInput) bodyInput.value = post.body || "";
  } catch (e) {
    console.error("Error decoding post JSON", e);
  }
}

function prepareDeletePost(postId) {
  state.selectedPostId = postId;
}

async function updataPost() {
  const urlParams = new URLSearchParams(window.location.search);
  const currentPostId = urlParams.get("postId");
  const targetPostId = state.selectedPostId || currentPostId;

  const titleInput = document.getElementById("editTitle").value;
  const bodyInput = document.getElementById("editBody").value;
  const editImageInput = document.getElementById("editImage");
  const editImage = editImageInput && editImageInput.files ? editImageInput.files[0] : null;

  clearAllErrors("editModal");

  if (!bodyInput.trim()) {
    showInputError("editBody", "edit-body-error", "This field is required.");
    return;
  }

  if (!getAuthToken()) {
    appendAlert("You must be logged in to edit a post.", "danger");
    return;
  }

  const formData = new FormData();
  formData.append("title", titleInput);
  formData.append("body", bodyInput);
  if (editImage) {
    formData.append("image", editImage);
  }
  formData.append("_method", "put");

  try {
    await axios.post(`${API_BASE_URL}/posts/${targetPostId}`, formData, { headers: getAuthHeaders() });
    hideModal("editModal");
    appendAlert("Post updated successfully!", "success");
    refreshCurrentPage();
  } catch (error) {
    appendAlert("Failed to update post.", "danger");
  }
}

async function deletePost() {
  const urlParams = new URLSearchParams(window.location.search);
  const currentPostId = urlParams.get("postId");
  const targetPostId = state.selectedPostId || currentPostId;

  if (!getAuthToken()) {
    appendAlert("You must be logged in to delete a post.", "danger");
    return;
  }

  try {
    await axios.delete(`${API_BASE_URL}/posts/${targetPostId}`, { headers: getAuthHeaders() });
    hideModal("DeleteModal");
    appendAlert("Post deleted successfully!", "success");

    if (document.getElementById("postDeatils")) {
      window.location.href = getHomePath();
    } else {
      refreshCurrentPage();
    }
  } catch (error) {
    appendAlert("Failed to delete post.", "danger");
  }
}

// ==========================================
// 8. Post Details & Comments
// ==========================================

async function getPost() {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("postId");
  const postDeatils = document.getElementById("postDeatils");
  const postCreator = document.getElementById("postCreator");

  if (!postDeatils || !postId) return;

  try {
    const response = await axios.get(`${API_BASE_URL}/posts/${postId}`);
    const data = response.data.data;
    localStorage.setItem("data", JSON.stringify(data));

    if (postCreator && data.author) {
      postCreator.innerHTML = `<span>${escapeHtml(data.author.username)}</span>'s Post`;
    }

    // Render main post card
    postDeatils.innerHTML = createPostCardHtml(data, { isDetails: true, tagPrefix: `post-tags-${data.id}` });

    // Render comments inside post card
    const commentsSection = document.getElementById("post-details-comments-section");
    if (commentsSection) {
      let commentsHtml = "";
      if (data.comments && data.comments.length > 0) {
        for (const comment of data.comments) {
          const commentAuthorImage = getSafeAvatar(comment.author ? comment.author.profile_image : null);
          const authorId = comment.author ? comment.author.id : null;
          const authorName = comment.author ? escapeHtml(comment.author.username) : "User";
          commentsHtml += `
            <div class="p-3 my-2" style="background-color: #f8f9fa; border-radius: 10px;" id="comment${comment.id}">
              <div style="cursor: pointer; display: inline-flex; align-items: center; gap: 8px;" onclick="userClicked(${authorId}, event)" title="View Profile">
                <img src="${commentAuthorImage}" onerror="this.src='${getDefaultAvatar()}'" alt="" style="height: 35px; width: 35px; border-radius: 50%; object-fit: cover;" class="border" />
                <b class="text-dark">${authorName}</b>
              </div>
              <div class="mt-2 ps-2">
                <p class="mb-0 text-secondary">${escapeHtml(comment.body)}</p>
              </div>
            </div>
          `;
        }
      } else {
        commentsHtml = `<p class="text-muted p-2">No comments yet. Be the first to comment! ✨</p>`;
      }

      const commentInputHtml = getAuthToken()
        ? `
          <div id="addCommentDiv" class="my-3 d-flex gap-2">
            <input type="text" id="commentInput" class="form-control" placeholder="Write a comment..." />
            <button class="btn btn-primary" onclick="createCommentClicked()">Send</button>
          </div>
        `
        : `
          <div class="alert alert-light border my-2 text-center text-muted">
            Please log in to add a comment.
          </div>
        `;

      commentsSection.innerHTML = commentsHtml + commentInputHtml;
    }
  } catch (error) {
    appendAlert("Failed to load post details.", "danger");
  }
}

async function createCommentClicked() {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("postId");
  const commentInput = document.getElementById("commentInput");

  if (!getAuthToken()) {
    appendAlert("You must be logged in to comment.", "danger");
    return;
  }
  if (!commentInput || commentInput.value.trim() === "") {
    appendAlert("Comment cannot be empty.", "warning");
    return;
  }

  try {
    await axios.post(
      `${API_BASE_URL}/posts/${postId}/comments`,
      { body: commentInput.value },
      { headers: getAuthHeaders() }
    );
    commentInput.value = "";
    getPost();
    appendAlert("Comment added successfully!", "success");
  } catch (error) {
    appendAlert("Failed to add comment.", "danger");
  }
}

// ==========================================
// 9. Profile Page & Profile Pagination
// ==========================================

async function getUser() {
  const userId = getCurrentUserIdFromUrlOrAuth();
  const headerName = document.getElementById("headerName");
  const headerName2 = document.getElementById("headerName2");
  const headeremail = document.getElementById("headeremail");
  const headerUsername = document.getElementById("headerUsername");
  const postsCounter = document.getElementById("postsCounter");
  const commentConunter = document.getElementById("commentConunter");
  const headerImage = document.getElementById("headerImage");
  const postName = document.getElementById("postName");

  if (!userId) {
    if (headerName) headerName.innerText = "Guest";
    if (headerName2) headerName2.innerText = "Guest";
    if (headeremail) headeremail.innerText = "Not registered";
    if (headerUsername) headerUsername.innerText = "";
    if (postsCounter) postsCounter.innerText = "0";
    if (commentConunter) commentConunter.innerText = "0";
    if (postName) postName.innerText = "Guest";
    return;
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
    const userData = response.data.data;

    if (headerName) headerName.innerText = userData.name || userData.username || "User";
    if (headerName2) headerName2.innerText = userData.name || userData.username || "";
    if (headeremail) headeremail.innerText = userData.email || "Email not available";
    if (headerUsername) headerUsername.innerText = userData.username ? `@${userData.username}` : "";
    if (postsCounter) postsCounter.innerText = userData.posts_count != null ? userData.posts_count : 0;
    if (commentConunter) commentConunter.innerText = userData.comments_count != null ? userData.comments_count : 0;
    if (headerImage) headerImage.src = getSafeAvatar(userData.profile_image);
    if (postName) postName.innerText = userData.username || userData.name || "User";

    const loggedInUser = getAuthUser();
    if (loggedInUser && loggedInUser.id == userData.id) {
      localStorage.setItem("user", JSON.stringify({ ...loggedInUser, ...userData }));
      GetUserData();
    }
  } catch (error) {
    appendAlert("Failed to load user data.", "danger");
  }
}

async function getUserPostes() {
  const userId = getCurrentUserIdFromUrlOrAuth();
  const userPostesDiv = document.getElementById("userPostes");
  if (!userPostesDiv) return;

  if (!userId) {
    userPostesDiv.innerHTML = `<div class="alert alert-warning text-center">Please log in or select a user to view their posts.</div>`;
    return;
  }

  userPostesDiv.innerHTML = `<div class="text-center my-4"><div class="spinner-border text-primary" role="status"></div></div>`;

  try {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}/posts`);
    state.profilePosts = response.data.data || [];
    state.profileCurrentPage = 1;
    renderProfilePostsPage(1);
  } catch (error) {
    userPostesDiv.innerHTML = `<div class="alert alert-danger text-center">Failed to load user posts.</div>`;
  }
}

function renderProfilePostsPage(page = 1) {
  const userPostesDiv = document.getElementById("userPostes");
  if (!userPostesDiv) return;

  state.profileCurrentPage = page;
  userPostesDiv.innerHTML = "";

  if (!state.profilePosts || state.profilePosts.length === 0) {
    userPostesDiv.innerHTML = `<div class="alert alert-info text-center">This user has no posts yet.</div>`;
    return;
  }

  const totalPosts = state.profilePosts.length;
  const totalPages = Math.ceil(totalPosts / PROFILE_POSTS_LIMIT);
  const startIndex = (page - 1) * PROFILE_POSTS_LIMIT;
  const endIndex = Math.min(startIndex + PROFILE_POSTS_LIMIT, totalPosts);
  const displayedPosts = state.profilePosts.slice(startIndex, endIndex);

  for (const post of displayedPosts) {
    userPostesDiv.innerHTML += createPostCardHtml(post, { isDetails: false, tagPrefix: `user-post-tags` });
  }

  if (totalPages > 1) {
    let paginationHtml = `
      <nav aria-label="User posts pagination" class="col-12 col-md-9 m-auto my-4">
        <ul class="pagination justify-content-center shadow-sm">
          <li class="page-item ${page === 1 ? "disabled" : ""}">
            <a class="page-link" href="javascript:void(0)" onclick="renderProfilePostsPage(${page - 1})">Previous</a>
          </li>
    `;

    for (let i = 1; i <= totalPages; i++) {
      paginationHtml += `
        <li class="page-item ${i === page ? "active" : ""}">
          <a class="page-link" href="javascript:void(0)" onclick="renderProfilePostsPage(${i})">${i}</a>
        </li>
      `;
    }

    paginationHtml += `
          <li class="page-item ${page === totalPages ? "disabled" : ""}">
            <a class="page-link" href="javascript:void(0)" onclick="renderProfilePostsPage(${page + 1})">Next</a>
          </li>
        </ul>
      </nav>
    `;
    userPostesDiv.innerHTML += paginationHtml;
  }
}

// ==========================================
// 10. Initialization & Page Guards
// ==========================================

window.addEventListener("DOMContentLoaded", () => {
  setupInputListeners();
  setupUI();

  // Auth guard: If on Profile page with no userId and not logged in, redirect to Home
  if (window.location.pathname.toLowerCase().includes("profile.html")) {
    const urlParams = new URLSearchParams(window.location.search);
    const targetUserId = urlParams.get("userId");
    const token = getAuthToken();
    if (!targetUserId && !token) {
      window.location.replace(getHomePath());
      return;
    }
  }

  // Page-specific initialization
  if (document.getElementById("container")) {
    getPostes(1, true);
  }

  if (document.getElementById("postDeatils")) {
    getPost();
  }

  if (document.getElementById("userPostes")) {
    getUser();
    getUserPostes();
  }
});