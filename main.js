const passURL = "https://tarmeezacademy.com/api/v1";
let currentPage = 1;
let lastPage = 1;
let isLoadingPosts = false;
let selectedPostIdForAction = null;

// ==========================================
// Navigation & Path Helpers
// ==========================================
function isSubfolder() {
  return window.location.pathname.toLowerCase().includes('qdetailspost');
}

function getBasePath() {
  return isSubfolder() ? './' : 'qdetailspost/';
}

function getHomePath() {
  return isSubfolder() ? '../index.html' : './index.html';
}

function getProfilePath(userId) {
  const base = getBasePath();
  return userId ? `${base}profile.html?userId=${userId}` : `${base}profile.html`;
}

function getDetailsPath(postId) {
  const base = getBasePath();
  return `${base}DetailsPost.html?postId=${postId}`;
}

function getSafeAvatar(imageUrl) {
  if (
    typeof imageUrl === 'string' &&
    imageUrl.trim() !== '' &&
    !imageUrl.includes('[object') &&
    !imageUrl.includes('undefined') &&
    imageUrl !== '{}'
  ) {
    return imageUrl;
  }
  return isSubfolder() ? '../profile-pics/user.png' : './profile-pics/user.png';
}

function getSafePostImage(imageUrl) {
  if (
    typeof imageUrl === 'string' &&
    imageUrl.trim() !== '' &&
    !imageUrl.includes('[object') &&
    !imageUrl.includes('undefined') &&
    (imageUrl.startsWith('http') || imageUrl.startsWith('data:'))
  ) {
    return imageUrl;
  }
  return null;
}

// Click on a post -> go to post details
function postClicked(postId) {
  if (!postId) return;
  window.location.href = getDetailsPath(postId);
}

// Click on any user avatar/name -> go to user's profile
function userClicked(userId, event) {
  if (event) {
    event.stopPropagation();
  }
  if (!userId) return;
  window.location.href = getProfilePath(userId);
}

// Click on Profile link or user avatar in Navbar
function profileNavClicked() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.id) {
    const targetUrl = getProfilePath(user.id);
    const urlParams = new URLSearchParams(window.location.search);
    const currentUserIdInUrl = urlParams.get('userId');

    // If already on profile.html
    if (window.location.pathname.includes('profile.html')) {
      if (currentUserIdInUrl == user.id) {
        // Already on my profile page -> refresh data
        getUser();
        getUserPostes();
      } else {
        // On someone else's profile page -> navigate to my profile
        window.location.href = targetUrl;
      }
    } else {
      window.location.href = targetUrl;
    }
  } else {
    appendAlert("يرجى تسجيل الدخول أولاً لعرض حسابك الشخصي.", "warning");
    const loginModalEl = document.getElementById("loginModal");
    if (loginModalEl) {
      const modal = bootstrap.Modal.getOrCreateInstance(loginModalEl);
      modal.show();
    }
  }
}

// Helper to get userId from URL query parameter or fallback to logged in user
function getCurrentUserId() {
  const urlParams = new URLSearchParams(window.location.search);
  const idFromUrl = urlParams.get('userId');
  if (idFromUrl) {
    return idFromUrl;
  }
  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  if (loggedInUser && loggedInUser.id) {
    return loggedInUser.id;
  }
  return null;
}

// ==========================================
// Alerts
// ==========================================
function appendAlert(message, type) {
  const alertPlaceholder = document.getElementById('liveAlertPlaceholder');
  if (!alertPlaceholder) return;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible fade show shadow" role="alert">`,
    `   <div>${message}</div>`,
    '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
    '</div>'
  ].join('');
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

// ==========================================
// UI Setup & Authentication
// ==========================================
function setupUI() {
  const token = localStorage.getItem("token");
  const logoutBtnDiv = document.getElementById("logoutBtnDiv");
  const loginBtnDiv = document.getElementById("loginBtnDiv");
  const addBtn = document.getElementById("addBtn");

  if (token == null) {
    if (loginBtnDiv) loginBtnDiv.style.display = "block";
    if (logoutBtnDiv) logoutBtnDiv.style.display = "none";
    if (addBtn) addBtn.style.display = "none";
  } else {
    if (loginBtnDiv) loginBtnDiv.style.display = "none";
    if (logoutBtnDiv) logoutBtnDiv.style.display = "flex";
    if (addBtn) addBtn.style.display = "flex";
    GetUserData();
  }
}

function GetUserData() {
  const userName = document.getElementById("userName");
  const userImage = document.getElementById("userImage");
  const userObj = localStorage.getItem("user");
  if (!userObj) return;

  try {
    const user = JSON.parse(userObj);
    if (userName && user.username) {
      userName.innerText = user.username;
    }
    if (userImage) {
      userImage.src = getSafeAvatar(user.profile_image);
    }
  } catch (e) {
    console.error("Error parsing user data", e);
  }
}

function loginBtnClick() {
  const userName = document.getElementById("username-input").value;
  const password = document.getElementById("password-input").value;
  const params = {
    username: userName,
    password: password
  };

  axios.post(`${passURL}/login`, params)
    .then((response) => {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      const modalEl = document.getElementById("loginModal");
      if (modalEl) {
        const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modalInstance.hide();
      }
      setupUI();
      appendAlert('تم تسجيل الدخول بنجاح', 'success');
      refreshCurrentPage();
    })
    .catch((error) => {
      appendAlert('اسم المستخدم أو كلمة المرور غير صحيحة', 'danger');
    });
}

function RegisterBtnClick() {
  const reName = document.getElementById("re-name-input").value;
  const reUserName = document.getElementById("re-username-input").value;
  const rePassword = document.getElementById("re-password-input")
    ? document.getElementById("re-password-input").value
    : "";
  const reImageInput = document.getElementById("re-image-input");
  const reImage = reImageInput && reImageInput.files ? reImageInput.files[0] : null;

  if (reName === "" || reUserName === "" || rePassword === "") {
    appendAlert('جميع الحقول مطلوبة', 'danger');
    return;
  }

  let formData = new FormData();
  formData.append("username", reUserName);
  formData.append("password", rePassword);
  formData.append("name", reName);
  if (reImage) {
    formData.append("image", reImage);
  }

  axios.post(`${passURL}/register`, formData)
    .then((response) => {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      const modalEl = document.getElementById("RegisterModal");
      if (modalEl) {
        const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modalInstance.hide();
      }
      appendAlert('تم إنشاء الحساب بنجاح', 'success');
      setupUI();
      refreshCurrentPage();
    })
    .catch((error) => {
      appendAlert('اسم المستخدم هذا مستخدم بالفعل أو البيانات غير صالحة', 'danger');
    });
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  setupUI();
  appendAlert('تم تسجيل الخروج بنجاح', 'info');
  refreshCurrentPage();
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
// Create Post
// ==========================================
function createNewPostList() {
  const postTitleInput = document.getElementById("post-title-input").value;
  const postBodyInput = document.getElementById("post-body-input").value;
  const imageInput = document.getElementById("post-image-input").files[0];

  let formData = new FormData();
  formData.append("body", postBodyInput);
  if (imageInput) {
    formData.append("image", imageInput);
  }
  formData.append("title", postTitleInput);

  const token = localStorage.getItem("token");
  if (!token) {
    appendAlert("يجب تسجيل الدخول لنشر منشور", "danger");
    return;
  }

  const header = {
    "authorization": `Bearer ${token}`
  };

  axios.post(`${passURL}/posts`, formData, { headers: header })
    .then((response) => {
      const modalEl = document.getElementById("createNewPost");
      if (modalEl) {
        const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modalInstance.hide();
      }
      appendAlert("تم نشر المنشور بنجاح", 'success');
      refreshCurrentPage();
    })
    .catch((error) => {
      appendAlert("حدث خطأ أثناء إضافة المنشور", 'danger');
    });
}

// ==========================================
// Home Feed: getPostes with Pagination & Infinite Scroll
// ==========================================
function getPostes(page = 1, reload = false) {
  const container = document.getElementById("container");
  if (!container) return;

  if (reload) {
    currentPage = 1;
    container.innerHTML = "";
    removeFeedPaginationControls();
  }

  isLoadingPosts = true;
  showFeedLoader(true);

  axios.get(`${passURL}/posts?limit=6&page=${page}`)
    .then(function (response) {
      lastPage = response.data.meta.last_page;
      currentPage = response.data.meta.current_page;
      let posts = response.data.data;
      const currentUser = JSON.parse(localStorage.getItem("user"));

      for (let post of posts) {
        const authorImage = getSafeAvatar(post.author.profile_image);
        const postImage = getSafePostImage(post.image);
        const postImgHtml = postImage
          ? `<img src="${postImage}" alt="post-image" style="width: 100%; max-height: 500px; object-fit: cover;" class="rounded my-2" />`
          : '';

        let editBtn = "";
        let deleteBtn = "";
        if (currentUser && currentUser.id == post.author.id) {
          const postJsonStr = encodeURIComponent(JSON.stringify(post));
          editBtn = `<button class="btn btn-outline-success btn-sm me-1" data-bs-toggle="modal" data-bs-target="#editModal" onclick="event.stopPropagation(); prepareEditPostFromEncoded('${postJsonStr}')">Edit</button>`;
          deleteBtn = `<button class="btn btn-outline-danger btn-sm" data-bs-toggle="modal" data-bs-target="#DeleteModal" onclick="event.stopPropagation(); prepareDeletePost(${post.id})">Delete</button>`;
        }

        container.innerHTML += `
          <!-- post -->
          <div class="col-12 col-md-9 m-auto shadow-sm rounded mb-4" id="post-${post.id}">
            <div class="card" onclick="postClicked(${post.id})" style="cursor: pointer;">
              <div class="card-header d-flex justify-content-between align-items-center bg-white">
                <div style="cursor: pointer; display: flex; align-items: center; gap: 10px;" onclick="userClicked(${post.author.id}, event)" title="عرض الملف الشخصي">
                  <img src="${authorImage}" onerror="this.src='./profile-pics/user.png'" alt="" style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover;" class="border border-secondary" />
                  <span style="font-size: 1.15rem; font-weight: 600; color: #212529;">${post.author.username}</span>
                </div>
                <div>
                  ${editBtn}
                  ${deleteBtn}
                </div>
              </div>
              <div class="card-body">
                ${postImgHtml}
                <span style="color: #6c757d; font-size: 0.85rem;">${post.created_at || ''}</span>
                <h4 class="mt-2 text-dark">${post.title || ''}</h4>
                <p class="text-secondary">${post.body || ''}</p>
                <hr>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-muted"><i class="bi bi-chat-left-text me-1"></i>(${post.comments_count}) comments</span>
                  <span id="post-tags${post.id}"></span>
                </div>
              </div>
            </div>
          </div>
          <!-- ## end post ## -->
        `;

        let tagDiv = document.getElementById(`post-tags${post.id}`);
        if (tagDiv && post.tags) {
          for (let tag of post.tags) {
            tagDiv.innerHTML += `<span class="badge bg-secondary me-1">${tag.name}</span>`;
          }
        }
      }

      showFeedLoader(false);
      isLoadingPosts = false;
      updateFeedPaginationControls();
    })
    .catch(function (error) {
      console.error(error);
      showFeedLoader(false);
      isLoadingPosts = false;
    });
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
      <p class="text-muted mt-2 small">جاري تحميل المنشورات...</p>
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

  if (currentPage < lastPage) {
    controlsDiv.innerHTML = `
      <div class="d-flex flex-column align-items-center gap-2">
        <button class="btn btn-primary shadow px-4 py-2 rounded-pill" onclick="loadNextFeedPage()" id="loadMoreBtn">
          <i class="bi bi-arrow-down-circle me-2"></i>تحميل المزيد من المنشورات (صفحة ${currentPage} من ${lastPage})
        </button>
        <span class="text-muted small">أو قم بالتمرير للأسفل للتحميل التلقائي ⬇️</span>
      </div>
    `;
  } else {
    controlsDiv.innerHTML = `
      <div class="alert alert-secondary d-inline-block px-4 py-2 text-muted shadow-sm rounded-pill">
        🎉 وصلت إلى نهاية جميع المنشورات
      </div>
    `;
  }
}

function removeFeedPaginationControls() {
  const controlsDiv = document.getElementById("feed-pagination-controls");
  if (controlsDiv) {
    controlsDiv.remove();
  }
}

function loadNextFeedPage() {
  if (currentPage < lastPage && !isLoadingPosts) {
    currentPage++;
    getPostes(currentPage, false);
  }
}

// ==========================================
// Infinite Scroll Event Listener
// ==========================================
window.addEventListener("scroll", function () {
  const container = document.getElementById("container");
  if (!container) return;

  const endOfPage =
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 250;

  if (endOfPage && currentPage < lastPage && !isLoadingPosts) {
    currentPage++;
    getPostes(currentPage, false);
  }
});

// ==========================================
// Details Post Logic
// ==========================================
function getPost() {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('postId');
  const postDeatils = document.getElementById("postDeatils");
  const postCreator = document.getElementById("postCreator");

  if (!postDeatils || !postId) return;

  axios.get(`${passURL}/posts/${postId}`)
    .then((response) => {
      let data = response.data.data;
      localStorage.setItem("data", JSON.stringify(data));

      let commentsDiv = ``;
      if (data.comments && data.comments.length > 0) {
        for (let i = 0; i < data.comments.length; i++) {
          const comment = data.comments[i];
          const commentAuthorImage = getSafeAvatar(comment.author.profile_image);
          commentsDiv += `
            <!-- comment -->
            <div class="p-3 my-2" style="background-color: #f8f9fa; border-radius: 10px;" id="comment${comment.id}">
              <div style="cursor: pointer; display: inline-flex; align-items: center; gap: 8px;" onclick="userClicked(${comment.author.id}, event)" title="عرض الملف الشخصي">
                <img src="${commentAuthorImage}" onerror="this.src='../profile-pics/user.png'" alt="" style="height: 35px; width: 35px; border-radius: 50%; object-fit: cover;" class="border">
                <b class="text-dark">${comment.author.username}</b>
              </div>
              <div class="mt-2 ps-2">
                <p class="mb-0 text-secondary">${comment.body}</p>
              </div>
            </div>
          `;
        }
      } else {
        commentsDiv = `<p class="text-muted p-2">لا توجد تعليقات حتى الآن.</p>`;
      }

      let editBtn = "";
      let deleteBtn = "";
      const currentUser = JSON.parse(localStorage.getItem("user"));
      if (currentUser && currentUser.id == data.author.id) {
        const postJsonStr = encodeURIComponent(JSON.stringify(data));
        editBtn = `<button class="btn btn-outline-success btn-sm me-1" data-bs-toggle="modal" data-bs-target="#editModal" onclick="prepareEditPostFromEncoded('${postJsonStr}')">Edit</button>`;
        deleteBtn = `<button class="btn btn-outline-danger btn-sm" data-bs-toggle="modal" data-bs-target="#DeleteModal" onclick="prepareDeletePost(${data.id})">Delete</button>`;
      }

      if (postCreator) {
        postCreator.innerHTML = `<span>${data.author.username}</span> Post`;
      }

      const postAuthorImg = getSafeAvatar(data.author.profile_image);
      const postImage = getSafePostImage(data.image);
      const postImgHtml = postImage
        ? `<img src="${postImage}" alt="post-image" style="width: 100%; max-height: 500px; object-fit: cover;" class="rounded my-2" />`
        : '';

      postDeatils.innerHTML = `
        <div class="col-12 col-md-9 m-auto shadow-sm rounded mb-4" id="post-${data.id}">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center bg-white">
              <div style="cursor: pointer; display: flex; align-items: center; gap: 10px;" onclick="userClicked(${data.author.id}, event)" title="عرض الملف الشخصي">
                <img src="${postAuthorImg}" onerror="this.src='../profile-pics/user.png'" alt="" style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover;" class="border border-secondary" />
                <span style="font-size: 1.15rem; font-weight: 600;">${data.author.username}</span>
              </div>
              <div>
                ${editBtn}
                ${deleteBtn}
              </div>
            </div>
            <div class="card-body">
              ${postImgHtml}
              <span style="color: #6c757d; font-size: 0.85rem;">${data.created_at || ''}</span>
              <h4 class="mt-2 text-dark">${data.title || ''}</h4>
              <p class="text-secondary">${data.body || ''}</p>
              <hr />
              <div>
                <span class="text-muted"><i class="bi bi-chat-left-text me-1"></i>(${data.comments_count}) comments</span>
                <div class="mt-3">
                  ${commentsDiv}
                  ${handleComment()}
                </div>
                <div id="post-tags-${data.id}" class="mt-2"></div>
              </div>
            </div>
          </div>
        </div>
      `;

      let tagDiv = document.getElementById(`post-tags-${data.id}`);
      if (tagDiv && data.tags) {
        for (let tag of data.tags) {
          tagDiv.innerHTML += `<span class="badge bg-secondary me-1">${tag.name}</span>`;
        }
      }
    })
    .catch((error) => {
      console.log(error);
      appendAlert("فشل تحميل تفاصيل المنشور", "danger");
    });
}

function handleComment() {
  const token = localStorage.getItem("token");
  if (token != null) {
    return `
      <div id="addCommentDiv" class="my-3 d-flex gap-2">
        <input type="text" id="commentInput" class="form-control" placeholder="أضف تعليقاً...">
        <button class="btn btn-primary" onclick="createCommentClicked()">إرسال</button>
      </div>
    `;
  } else {
    return `
      <div class="alert alert-light border my-2 text-center text-muted">
        سجل الدخول لتتمكن من إضافة تعليق.
      </div>
    `;
  }
}

function createCommentClicked() {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('postId');
  const commentInput = document.getElementById("commentInput");
  const token = localStorage.getItem("token");

  if (!token) {
    appendAlert("يجب تسجيل الدخول لإضافة تعليق", "danger");
    return;
  }
  if (!commentInput || commentInput.value.trim() === "") {
    appendAlert("لا يمكن أن يكون التعليق فارغاً", "warning");
    return;
  }

  const header = {
    "authorization": `Bearer ${token}`
  };
  const params = {
    "body": commentInput.value
  };

  axios.post(`${passURL}/posts/${postId}/comments`, params, { headers: header })
    .then((response) => {
      commentInput.value = "";
      getPost();
      appendAlert("تمت إضافة التعليق بنجاح", "success");
    })
    .catch((error) => {
      appendAlert("فشل إضافة التعليق", "danger");
    });
}

// ==========================================
// Edit & Delete Post
// ==========================================
function prepareEditPostFromEncoded(encodedPostJson) {
  try {
    const post = JSON.parse(decodeURIComponent(encodedPostJson));
    selectedPostIdForAction = post.id;
    const titleInput = document.getElementById("editTitle");
    const bodyInput = document.getElementById("editBody");
    if (titleInput) titleInput.value = post.title || "";
    if (bodyInput) bodyInput.value = post.body || "";
  } catch (e) {
    console.error("Error decoding post JSON", e);
  }
}

function prepareDeletePost(postId) {
  selectedPostIdForAction = postId;
}

function getNowData() {
  const localData = JSON.parse(localStorage.getItem("data"));
  if (!localData) return;
  selectedPostIdForAction = localData.id;
  const titleInput = document.getElementById("editTitle");
  const bodyInput = document.getElementById("editBody");
  if (titleInput) titleInput.value = localData.title || "";
  if (bodyInput) bodyInput.value = localData.body || "";
}

function updataPost() {
  const urlParams = new URLSearchParams(window.location.search);
  const currentPostId = urlParams.get('postId');
  const targetPostId = selectedPostIdForAction || currentPostId;

  const titleInput = document.getElementById("editTitle").value;
  const bodyInput = document.getElementById("editBody").value;
  const editImageInput = document.getElementById("editImage");
  const editImage = editImageInput && editImageInput.files ? editImageInput.files[0] : null;
  const token = localStorage.getItem("token");

  if (!token) {
    appendAlert("يجب تسجيل الدخول لتعديل المنشور", "danger");
    return;
  }

  const header = {
    "authorization": `Bearer ${token}`
  };

  const formData = new FormData();
  formData.append("title", titleInput);
  formData.append("body", bodyInput);
  if (editImage) {
    formData.append("image", editImage);
  }
  formData.append("_method", "put");

  axios.post(`${passURL}/posts/${targetPostId}`, formData, { headers: header })
    .then((response) => {
      const modalEl = document.getElementById("editModal");
      if (modalEl) {
        const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modalInstance.hide();
      }
      appendAlert("تم تحديث المنشور بنجاح", "success");
      refreshCurrentPage();
    })
    .catch((error) => {
      console.error(error);
      appendAlert("حدث خطأ أثناء تعديل المنشور", "danger");
    });
}

function deletePost() {
  const urlParams = new URLSearchParams(window.location.search);
  const currentPostId = urlParams.get('postId');
  const targetPostId = selectedPostIdForAction || currentPostId;
  const token = localStorage.getItem("token");

  if (!token) {
    appendAlert("يجب تسجيل الدخول لحذف المنشور", "danger");
    return;
  }

  const header = {
    "authorization": `Bearer ${token}`
  };

  axios.delete(`${passURL}/posts/${targetPostId}`, { headers: header })
    .then((response) => {
      const modalEl = document.getElementById("DeleteModal");
      if (modalEl) {
        const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modalInstance.hide();
      }
      appendAlert("تم حذف المنشور بنجاح", "success");

      if (document.getElementById("postDeatils")) {
        window.location.href = getHomePath();
      } else {
        refreshCurrentPage();
      }
    })
    .catch((error) => {
      console.error(error);
      appendAlert("حدث خطأ أثناء حذف المنشور", "danger");
    });
}

// ==========================================
// Profile Page Logic with Pagination
// ==========================================
let profileUserPosts = [];
let profileCurrentPage = 1;
const profilePostsPerPage = 5;

function getUser() {
  const userId = getCurrentUserId();
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
    if (headeremail) headeremail.innerText = "غير مسجل";
    if (headerUsername) headerUsername.innerText = "";
    if (postsCounter) postsCounter.innerText = "0";
    if (commentConunter) commentConunter.innerText = "0";
    if (postName) postName.innerText = "Guest";
    return;
  }

  axios.get(`${passURL}/users/${userId}`)
    .then((response) => {
      const userData = response.data.data;

      if (headerName) headerName.innerText = userData.name || userData.username || "User";
      if (headerName2) headerName2.innerText = userData.name || userData.username || "";
      if (headeremail) headeremail.innerText = userData.email || "البريد غير متوفر";
      if (headerUsername) headerUsername.innerText = userData.username ? `@${userData.username}` : "";
      if (postsCounter) postsCounter.innerText = userData.posts_count != null ? userData.posts_count : 0;
      if (commentConunter) commentConunter.innerText = userData.comments_count != null ? userData.comments_count : 0;

      if (headerImage) {
        headerImage.src = getSafeAvatar(userData.profile_image);
      }

      if (postName) {
        postName.innerText = userData.username || userData.name || "User";
      }

      // If this is the logged in user, keep local storage and navbar updated
      const loggedInUser = JSON.parse(localStorage.getItem("user"));
      if (loggedInUser && loggedInUser.id == userData.id) {
        localStorage.setItem("user", JSON.stringify({ ...loggedInUser, ...userData }));
        GetUserData();
      }
    })
    .catch((error) => {
      console.error(error);
      appendAlert("فشل تحميل بيانات المستخدم", "danger");
    });
}

function getUserPostes() {
  const userId = getCurrentUserId();
  const userPostesDiv = document.getElementById("userPostes");
  if (!userPostesDiv) return;

  if (!userId) {
    userPostesDiv.innerHTML = `<div class="alert alert-warning text-center">يرجى تسجيل الدخول أو اختيار مستخدم لعرض منشوراته.</div>`;
    return;
  }

  userPostesDiv.innerHTML = `<div class="text-center my-4"><div class="spinner-border text-primary" role="status"></div></div>`;

  axios.get(`${passURL}/users/${userId}/posts`)
    .then(function (response) {
      profileUserPosts = response.data.data || [];
      profileCurrentPage = 1;
      renderProfilePostsPage(1);
    })
    .catch(function (error) {
      console.error(error);
      userPostesDiv.innerHTML = `<div class="alert alert-danger text-center">فشل تحميل منشورات المستخدم.</div>`;
    });
}

function renderProfilePostsPage(page = 1) {
  const userPostesDiv = document.getElementById("userPostes");
  if (!userPostesDiv) return;

  profileCurrentPage = page;
  userPostesDiv.innerHTML = "";

  if (!profileUserPosts || profileUserPosts.length === 0) {
    userPostesDiv.innerHTML = `<div class="alert alert-info text-center">لا توجد منشورات لهذا المستخدم حتى الآن.</div>`;
    return;
  }

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const totalPosts = profileUserPosts.length;
  const totalPages = Math.ceil(totalPosts / profilePostsPerPage);
  const startIndex = (page - 1) * profilePostsPerPage;
  const endIndex = Math.min(startIndex + profilePostsPerPage, totalPosts);
  const displayedPosts = profileUserPosts.slice(startIndex, endIndex);

  for (let post of displayedPosts) {
    let editBtn = "";
    let deleteBtn = "";

    if (currentUser && currentUser.id == post.author.id) {
      const postJsonStr = encodeURIComponent(JSON.stringify(post));
      editBtn = `<button class="btn btn-outline-success btn-sm me-1" data-bs-toggle="modal" data-bs-target="#editModal" onclick="event.stopPropagation(); prepareEditPostFromEncoded('${postJsonStr}')">Edit</button>`;
      deleteBtn = `<button class="btn btn-outline-danger btn-sm" data-bs-toggle="modal" data-bs-target="#DeleteModal" onclick="event.stopPropagation(); prepareDeletePost(${post.id})">Delete</button>`;
    }

    const authorImage = getSafeAvatar(post.author.profile_image);
    const postImage = getSafePostImage(post.image);
    const postImgHtml = postImage
      ? `<img src="${postImage}" alt="post-image" style="width: 100%; max-height: 500px; object-fit: cover;" class="rounded my-2" />`
      : '';

    userPostesDiv.innerHTML += `
      <div class="col-12 col-md-9 m-auto shadow-sm rounded mb-4" id="post-${post.id}">
        <div class="card" onclick="postClicked(${post.id})" style="cursor: pointer;">
          <div class="card-header d-flex justify-content-between align-items-center bg-white">
            <div style="cursor: pointer; display: flex; align-items: center; gap: 10px;" onclick="userClicked(${post.author.id}, event)" title="عرض الملف الشخصي">
              <img src="${authorImage}" onerror="this.src='../profile-pics/user.png'" alt="" style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover;" class="border border-secondary" />
              <span style="font-size: 1.15rem; font-weight: 600;">${post.author.username}</span>
            </div>
            <div>
              ${editBtn}
              ${deleteBtn}
            </div>
          </div>
          <div class="card-body">
            ${postImgHtml}
            <span style="color: #6c757d; font-size: 0.85rem;">${post.created_at || ''}</span>
            <h4 class="mt-2 text-dark">${post.title || ''}</h4>
            <p class="text-secondary">${post.body || ''}</p>
            <hr />
            <div class="d-flex justify-content-between align-items-center">
              <span class="text-muted"><i class="bi bi-chat-left-text me-1"></i>(${post.comments_count}) comments</span>
              <span id="user-post-tags-${post.id}"></span>
            </div>
          </div>
        </div>
      </div>
    `;

    let tagDiv = document.getElementById(`user-post-tags-${post.id}`);
    if (tagDiv && post.tags) {
      for (let tag of post.tags) {
        tagDiv.innerHTML += `<span class="badge bg-secondary me-1">${tag.name}</span>`;
      }
    }
  }

  // Profile Pagination Controls if more than 1 page
  if (totalPages > 1) {
    let paginationHtml = `
      <nav aria-label="User posts pagination" class="col-12 col-md-9 m-auto my-4">
        <ul class="pagination justify-content-center shadow-sm">
          <li class="page-item ${page === 1 ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="renderProfilePostsPage(${page - 1})">السابق</a>
          </li>
    `;

    for (let i = 1; i <= totalPages; i++) {
      paginationHtml += `
        <li class="page-item ${i === page ? 'active' : ''}">
          <a class="page-link" href="javascript:void(0)" onclick="renderProfilePostsPage(${i})">${i}</a>
        </li>
      `;
    }

    paginationHtml += `
          <li class="page-item ${page === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="renderProfilePostsPage(${page + 1})">التالي</a>
          </li>
        </ul>
      </nav>
    `;
    userPostesDiv.innerHTML += paginationHtml;
  }
}

// ==========================================
// Initialization on Page Load
// ==========================================
window.addEventListener("DOMContentLoaded", () => {
  setupUI();

  // If on Home page
  if (document.getElementById("container")) {
    getPostes(1, true);
  }

  // If on Details Post page
  if (document.getElementById("postDeatils")) {
    getPost();
  }

  // If on Profile page
  if (document.getElementById("userPostes")) {
    getUser();
    getUserPostes();
  }
});