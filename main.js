const passURL = "https://tarmeezacademy.com/api/v1";
let currentPage = 1;
let lastPage = 1;
let isLoadingPosts = false;
let selectedPostIdForAction = null;

// ==========================================
// Multi-Language (i18n) System
// ==========================================
const translations = {
  en: {
    langBtn: "🌐 العربية",
    appName: "FaceNote",
    home: "Home",
    profile: "Profile",
    login: "Login",
    register: "Register",
    logout: "Logout",
    viewMyProfile: "View My Profile",

    // Modals - Login
    loginModalTitle: "Login",
    usernameLabel: "Username:",
    usernamePlaceholder: "e.g. ahmed_dev",
    passwordLabel: "Password:",
    passwordPlaceholder: "Enter your password",
    closeBtn: "Close",

    // Modals - Register
    registerModalTitle: "Register a New User",
    nameLabel: "Full Name:",
    namePlaceholder: "e.g. Ahmed Ibrahim",
    regUsernamePlaceholder: "e.g. ahmed_2024 (English letters & numbers)",
    regPasswordPlaceholder: "At least 6 characters",
    profileImageLabel: "Profile Picture:",

    // Modals - Create / Edit Post
    addNewPostTitle: "Add New Post",
    editPostTitle: "Edit Post",
    postTitleLabel: "Title:",
    postTitlePlaceholder: "e.g. Exciting Announcement!",
    postBodyLabel: "Content:",
    postBodyPlaceholder: "What's on your mind?",
    postImageLabel: "Image:",
    publishBtn: "Publish",
    saveChangesBtn: "Save Changes",

    // Modals - Delete
    deletePostTitle: "Delete Post",
    deleteConfirmation: "Are you sure you want to delete this post? This action cannot be undone.",
    deleteBtn: "Delete",

    // Post Card & Feed
    editBtn: "Edit",
    commentsCount: "comments",
    loadMorePosts: "Load more posts",
    endOfPosts: "🎉 You have reached the end of all posts",
    loadingPosts: "Loading posts...",
    scrollDownNotice: "or scroll down to auto-load ⬇️",
    viewProfileTitle: "View Profile",

    // Post Details
    postOf: "'s Post",
    backToPosts: "Back to Posts",
    noComments: "No comments yet. Be the first to comment! ✨",
    commentsHeader: "Comments",
    addCommentPlaceholder: "Write a comment...",
    sendBtn: "Send",
    loginToComment: "Please log in to add a comment.",

    // Profile Page
    postsStat: "Posts",
    commentsStat: "Comments",
    userPostsTitle: "'s Posts",
    noUserPosts: "This user has no posts yet.",
    paginationPrev: "Previous",
    paginationNext: "Next",
    guest: "Guest",
    unregistered: "Not registered",
    selectUserNotice: "Please log in or select a user to view their posts.",

    // Validation & Alerts
    loginRequiredProfile: "Please log in first to view your profile.",
    loginSuccess: "Logged in successfully!",
    loginFailed: "Invalid username or password.",
    registerSuccess: "Account created successfully!",
    registerFailed: "Registration failed. Please check the fields below.",
    allFieldsRequired: "This field is required.",
    passwordMinLength: "Password must be at least 6 characters.",
    usernameTaken: "This username is already taken. Please try another.",
    logoutSuccess: "Logged out successfully!",
    loginRequiredPost: "You must be logged in to create a post.",
    postCreatedSuccess: "Post published successfully!",
    postCreateFailed: "Failed to publish post. Please try again.",
    postDetailsFailed: "Failed to load post details.",
    loginRequiredComment: "You must be logged in to comment.",
    emptyCommentWarning: "Comment cannot be empty.",
    commentSuccess: "Comment added successfully!",
    commentFailed: "Failed to add comment.",
    loginRequiredEdit: "You must be logged in to edit a post.",
    postUpdatedSuccess: "Post updated successfully!",
    postUpdateFailed: "Failed to update post.",
    loginRequiredDelete: "You must be logged in to delete a post.",
    postDeletedSuccess: "Post deleted successfully!",
    postDeleteFailed: "Failed to delete post.",
    userDataFailed: "Failed to load user data.",
    userPostsFailed: "Failed to load user posts."
  },
  ar: {
    langBtn: "🌐 English",
    appName: "فيس نوت",
    home: "الرئيسية",
    profile: "حسابي",
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    logout: "تسجيل الخروج",
    viewMyProfile: "عرض حسابي الشخصي",

    // Modals - Login
    loginModalTitle: "تسجيل الدخول",
    usernameLabel: "اسم المستخدم:",
    usernamePlaceholder: "مثال: ahmed_dev",
    passwordLabel: "كلمة المرور:",
    passwordPlaceholder: "أدخل كلمة المرور",
    closeBtn: "إلغاء",

    // Modals - Register
    registerModalTitle: "إنشاء حساب جديد",
    nameLabel: "الاسم الكامل:",
    namePlaceholder: "مثال: أحمد إبراهيم",
    regUsernamePlaceholder: "مثال: ahmed_2024 (أحرف إنجليزية وأرقام)",
    regPasswordPlaceholder: "6 أحرف أو أرقام على الأقل",
    profileImageLabel: "الصورة الشخصية:",

    // Modals - Create / Edit Post
    addNewPostTitle: "إضافة منشور جديد",
    editPostTitle: "تعديل المنشور",
    postTitleLabel: "العنوان:",
    postTitlePlaceholder: "مثال: خبر مميز اليوم!",
    postBodyLabel: "المحتوى:",
    postBodyPlaceholder: "ما الذي يدور في ذهنك؟",
    postImageLabel: "الصورة:",
    publishBtn: "نشر",
    saveChangesBtn: "حفظ التعديلات",

    // Modals - Delete
    deletePostTitle: "تأكيد حذف المنشور",
    deleteConfirmation: "هل أنت متأكد من رغبتك في حذف هذا المنشور؟ لا يمكن التراجع بعد الحذف.",
    deleteBtn: "حذف",

    // Post Card & Feed
    editBtn: "تعديل",
    commentsCount: "تعليقات",
    loadMorePosts: "تحميل المزيد من المنشورات",
    endOfPosts: "🎉 وصلت إلى نهاية جميع المنشورات",
    loadingPosts: "جاري تحميل المنشورات...",
    scrollDownNotice: "أو قم بالتمرير للأسفل للتحميل التلقائي ⬇️",
    viewProfileTitle: "عرض الملف الشخصي",

    // Post Details
    postOf: "منشور",
    backToPosts: "الرجوع للمنشورات",
    noComments: "لا توجد تعليقات حتى الآن. كن أول من يعلق! ✨",
    commentsHeader: "التعليقات",
    addCommentPlaceholder: "اكتب تعليقاً لطيفاً...",
    sendBtn: "إرسال",
    loginToComment: "يرجى تسجيل الدخول لتتمكن من إضافة تعليق.",

    // Profile Page
    postsStat: "المنشورات",
    commentsStat: "التعليقات",
    userPostsTitle: "منشورات",
    noUserPosts: "لا توجد منشورات لهذا المستخدم حتى الآن.",
    paginationPrev: "السابق",
    paginationNext: "التالي",
    guest: "زائر",
    unregistered: "غير مسجل",
    selectUserNotice: "يرجى تسجيل الدخول أو اختيار مستخدم لعرض منشوراته.",

    // Validation & Alerts
    loginRequiredProfile: "يرجى تسجيل الدخول أولاً لعرض حسابك الشخصي.",
    loginSuccess: "تم تسجيل الدخول بنجاح!",
    loginFailed: "اسم المستخدم أو كلمة المرور غير صحيحة.",
    registerSuccess: "تم إنشاء الحساب بنجاح!",
    registerFailed: "فشل إنشاء الحساب، يرجى مراجعة البيانات المدخلة.",
    allFieldsRequired: "هذا الحقل مطلوب.",
    passwordMinLength: "كلمة المرور يجب أن تكون 6 أحرف على الأقل.",
    usernameTaken: "اسم المستخدم هذا مستخدم بالفعل. يرجى اختيار اسم آخر.",
    logoutSuccess: "تم تسجيل الخروج بنجاح!",
    loginRequiredPost: "يجب تسجيل الدخول لنشر منشور.",
    postCreatedSuccess: "تم نشر المنشور بنجاح!",
    postCreateFailed: "حدث خطأ أثناء إضافة المنشور.",
    postDetailsFailed: "فشل تحميل تفاصيل المنشور.",
    loginRequiredComment: "يجب تسجيل الدخول لإضافة تعليق.",
    emptyCommentWarning: "لا يمكن أن يكون التعليق فارغاً.",
    commentSuccess: "تمت إضافة التعليق بنجاح!",
    commentFailed: "فشل إضافة التعليق.",
    loginRequiredEdit: "يجب تسجيل الدخول لتعديل المنشور.",
    postUpdatedSuccess: "تم تحديث المنشور بنجاح!",
    postUpdateFailed: "حدث خطأ أثناء تعديل المنشور.",
    loginRequiredDelete: "يجب تسجيل الدخول لحذف المنشور.",
    postDeletedSuccess: "تم حذف المنشور بنجاح!",
    postDeleteFailed: "حدث خطأ أثناء حذف المنشور.",
    userDataFailed: "فشل تحميل بيانات المستخدم.",
    userPostsFailed: "فشل تحميل منشورات المستخدم."
  }
};

function getCurrentLang() {
  return localStorage.getItem("app_lang") || "en";
}

function t(key) {
  const lang = getCurrentLang();
  if (translations[lang] && translations[lang][key]) {
    return translations[lang][key];
  }
  if (translations.en[key]) {
    return translations.en[key];
  }
  return key;
}

function setLanguage(lang) {
  localStorage.setItem("app_lang", lang);
  applyTranslations();
  refreshCurrentPage();
}

function toggleLanguage() {
  const current = getCurrentLang();
  const next = current === "en" ? "ar" : "en";
  setLanguage(next);
}

function applyTranslations() {
  const lang = getCurrentLang();
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

  // Update switcher button
  const langBtn = document.getElementById("langSwitcherBtn");
  if (langBtn) {
    langBtn.innerHTML = t("langBtn");
  }

  // Update elements with data-i18n
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key) {
      el.textContent = t(key);
    }
  });

  // Update elements with data-i18n-html
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    if (key) {
      el.innerHTML = t(key);
    }
  });

  // Update placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (key) {
      el.placeholder = t(key);
    }
  });

  // Update titles
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = el.getAttribute("data-i18n-title");
    if (key) {
      el.title = t(key);
    }
  });
}

// ==========================================
// Form Validation & Error Helpers
// ==========================================
function showInputError(inputId, errorId, message) {
  const inputEl = document.getElementById(inputId);
  const errorEl = document.getElementById(errorId);
  if (inputEl) {
    inputEl.classList.add("is-invalid");
    inputEl.style.borderColor = "#ef4444";
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
    inputEl.style.borderColor = "";
  }
  if (errorEl) {
    errorEl.textContent = "";
    errorEl.style.display = "none";
  }
}

function clearAllErrors(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.querySelectorAll(".is-invalid").forEach((input) => {
    input.classList.remove("is-invalid");
    input.style.borderColor = "";
  });
  form.querySelectorAll(".text-danger.small").forEach((err) => {
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
    appendAlert(t("loginRequiredProfile"), "warning");
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
  const icon = type === 'success' ? 'check-circle-fill' : type === 'danger' ? 'exclamation-circle-fill' : type === 'warning' ? 'exclamation-triangle-fill' : 'info-circle-fill';
  const wrapper = document.createElement('div');
  wrapper.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible fade show shadow d-flex align-items-center gap-2" role="alert">`,
    `   <i class="bi bi-${icon} fs-5"></i>`,
    `   <div class="flex-grow-1">${message}</div>`,
    '   <button type="button" class="btn-close shadow-none" data-bs-dismiss="alert" aria-label="Close"></button>',
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
    if (loginBtnDiv) loginBtnDiv.style.display = "flex";
    if (logoutBtnDiv) logoutBtnDiv.style.display = "none";
    if (addBtn) addBtn.style.display = "none";
  } else {
    if (loginBtnDiv) loginBtnDiv.style.display = "none";
    if (logoutBtnDiv) logoutBtnDiv.style.display = "flex";
    if (addBtn) addBtn.style.display = "flex";
    GetUserData();
  }

  applyTranslations();
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
  const userNameInput = document.getElementById("username-input");
  const passwordInput = document.getElementById("password-input");
  const userName = userNameInput ? userNameInput.value.trim() : "";
  const password = passwordInput ? passwordInput.value : "";

  clearAllErrors("loginModal");

  let hasError = false;
  if (!userName) {
    showInputError("username-input", "login-username-error", t("allFieldsRequired"));
    hasError = true;
  }
  if (!password) {
    showInputError("password-input", "login-password-error", t("allFieldsRequired"));
    hasError = true;
  }

  if (hasError) return;

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
      appendAlert(t("loginSuccess"), 'success');
      refreshCurrentPage();
    })
    .catch((error) => {
      console.error("Login error:", error);
      const errorMsg = (error.response && error.response.data && error.response.data.message)
        ? error.response.data.message
        : t("loginFailed");

      showInputError("username-input", "login-username-error", errorMsg);
      showInputError("password-input", "login-password-error", errorMsg);
      appendAlert(t("loginFailed"), 'danger');
    });
}

function RegisterBtnClick() {
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
    showInputError("re-name-input", "re-name-error", t("allFieldsRequired"));
    hasError = true;
  }
  if (!reUserName) {
    showInputError("re-username-input", "re-username-error", t("allFieldsRequired"));
    hasError = true;
  }
  if (!rePassword) {
    showInputError("re-password-input", "re-password-error", t("allFieldsRequired"));
    hasError = true;
  } else if (rePassword.length < 6) {
    showInputError("re-password-input", "re-password-error", t("passwordMinLength"));
    hasError = true;
  }

  if (hasError) return;

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
      appendAlert(t("registerSuccess"), 'success');
      setupUI();
      refreshCurrentPage();
    })
    .catch((error) => {
      console.error("Register error:", error);
      let alertMsg = t("registerFailed");

      if (error.response && error.response.data) {
        const data = error.response.data;

        if (data.errors) {
          if (data.errors.username) {
            const msg = data.errors.username.join(", ");
            const userMsg = msg.toLowerCase().includes("taken") ? t("usernameTaken") : msg;
            showInputError("re-username-input", "re-username-error", userMsg);
          }
          if (data.errors.password) {
            const msg = data.errors.password.join(", ");
            const passMsg = msg.toLowerCase().includes("at least") ? t("passwordMinLength") : msg;
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
            showInputError("re-username-input", "re-username-error", t("usernameTaken"));
          } else {
            showInputError("re-username-input", "re-username-error", data.message);
          }
        }
      }

      appendAlert(alertMsg, 'danger');
    });
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  setupUI();
  appendAlert(t("logoutSuccess"), 'info');
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
  const postTitleInput = document.getElementById("post-title-input");
  const postBodyInput = document.getElementById("post-body-input");
  const imageInputEl = document.getElementById("post-image-input");

  const postTitle = postTitleInput ? postTitleInput.value : "";
  const postBody = postBodyInput ? postBodyInput.value.trim() : "";
  const imageInput = imageInputEl && imageInputEl.files ? imageInputEl.files[0] : null;

  clearAllErrors("createNewPost");

  if (!postBody) {
    showInputError("post-body-input", "post-body-error", t("allFieldsRequired"));
    return;
  }

  let formData = new FormData();
  formData.append("body", postBody);
  if (imageInput) {
    formData.append("image", imageInput);
  }
  formData.append("title", postTitle);

  const token = localStorage.getItem("token");
  if (!token) {
    appendAlert(t("loginRequiredPost"), "danger");
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
      if (postTitleInput) postTitleInput.value = "";
      if (postBodyInput) postBodyInput.value = "";
      if (imageInputEl) imageInputEl.value = "";

      appendAlert(t("postCreatedSuccess"), 'success');
      refreshCurrentPage();
    })
    .catch((error) => {
      console.error(error);
      appendAlert(t("postCreateFailed"), 'danger');
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
          editBtn = `<button class="btn btn-outline-success btn-sm me-1" data-bs-toggle="modal" data-bs-target="#editModal" onclick="event.stopPropagation(); prepareEditPostFromEncoded('${postJsonStr}')">${t("editBtn")}</button>`;
          deleteBtn = `<button class="btn btn-outline-danger btn-sm" data-bs-toggle="modal" data-bs-target="#DeleteModal" onclick="event.stopPropagation(); prepareDeletePost(${post.id})">${t("deleteBtn")}</button>`;
        }

        container.innerHTML += `
          <!-- post -->
          <div class="col-12 col-md-9 m-auto shadow-sm rounded mb-4" id="post-${post.id}">
            <div class="card" onclick="postClicked(${post.id})" style="cursor: pointer;">
              <div class="card-header d-flex justify-content-between align-items-center bg-white">
                <div style="cursor: pointer; display: flex; align-items: center; gap: 10px;" onclick="userClicked(${post.author.id}, event)" title="${t("viewProfileTitle")}">
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
                  <span class="text-muted"><i class="bi bi-chat-left-text me-1"></i>(${post.comments_count}) ${t("commentsCount")}</span>
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
      <p class="text-muted mt-2 small">${t("loadingPosts")}</p>
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
          <i class="bi bi-arrow-down-circle me-2"></i>${t("loadMorePosts")} (${currentPage} / ${lastPage})
        </button>
        <span class="text-muted small">${t("scrollDownNotice")}</span>
      </div>
    `;
  } else {
    controlsDiv.innerHTML = `
      <div class="alert alert-secondary d-inline-block px-4 py-2 text-muted shadow-sm rounded-pill">
        ${t("endOfPosts")}
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
              <div style="cursor: pointer; display: inline-flex; align-items: center; gap: 8px;" onclick="userClicked(${comment.author.id}, event)" title="${t("viewProfileTitle")}">
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
        commentsDiv = `<p class="text-muted p-2">${t("noComments")}</p>`;
      }

      let editBtn = "";
      let deleteBtn = "";
      const currentUser = JSON.parse(localStorage.getItem("user"));
      if (currentUser && currentUser.id == data.author.id) {
        const postJsonStr = encodeURIComponent(JSON.stringify(data));
        editBtn = `<button class="btn btn-outline-success btn-sm me-1" data-bs-toggle="modal" data-bs-target="#editModal" onclick="prepareEditPostFromEncoded('${postJsonStr}')">${t("editBtn")}</button>`;
        deleteBtn = `<button class="btn btn-outline-danger btn-sm" data-bs-toggle="modal" data-bs-target="#DeleteModal" onclick="prepareDeletePost(${data.id})">${t("deleteBtn")}</button>`;
      }

      if (postCreator) {
        const lang = getCurrentLang();
        postCreator.innerHTML = lang === "ar"
          ? `${t("postOf")} <span class="text-primary">${data.author.username}</span>`
          : `<span>${data.author.username}</span>${t("postOf")}`;
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
              <div style="cursor: pointer; display: flex; align-items: center; gap: 10px;" onclick="userClicked(${data.author.id}, event)" title="${t("viewProfileTitle")}">
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
                <span class="text-muted"><i class="bi bi-chat-left-text me-1"></i>(${data.comments_count}) ${t("commentsCount")}</span>
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
      appendAlert(t("postDetailsFailed"), "danger");
    });
}

function handleComment() {
  const token = localStorage.getItem("token");
  if (token != null) {
    return `
      <div id="addCommentDiv" class="my-3 d-flex gap-2">
        <input type="text" id="commentInput" class="form-control" placeholder="${t("addCommentPlaceholder")}">
        <button class="btn btn-primary" onclick="createCommentClicked()">${t("sendBtn")}</button>
      </div>
    `;
  } else {
    return `
      <div class="alert alert-light border my-2 text-center text-muted">
        ${t("loginToComment")}
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
    appendAlert(t("loginRequiredComment"), "danger");
    return;
  }
  if (!commentInput || commentInput.value.trim() === "") {
    appendAlert(t("emptyCommentWarning"), "warning");
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
      appendAlert(t("commentSuccess"), "success");
    })
    .catch((error) => {
      console.error(error);
      appendAlert(t("commentFailed"), "danger");
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

function updataPost() {
  const urlParams = new URLSearchParams(window.location.search);
  const currentPostId = urlParams.get('postId');
  const targetPostId = selectedPostIdForAction || currentPostId;

  const titleInput = document.getElementById("editTitle").value;
  const bodyInput = document.getElementById("editBody").value;
  const editImageInput = document.getElementById("editImage");
  const editImage = editImageInput && editImageInput.files ? editImageInput.files[0] : null;
  const token = localStorage.getItem("token");

  clearAllErrors("editModal");

  if (!bodyInput.trim()) {
    showInputError("editBody", "edit-body-error", t("allFieldsRequired"));
    return;
  }

  if (!token) {
    appendAlert(t("loginRequiredEdit"), "danger");
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
      appendAlert(t("postUpdatedSuccess"), "success");
      refreshCurrentPage();
    })
    .catch((error) => {
      console.error(error);
      appendAlert(t("postUpdateFailed"), "danger");
    });
}

function deletePost() {
  const urlParams = new URLSearchParams(window.location.search);
  const currentPostId = urlParams.get('postId');
  const targetPostId = selectedPostIdForAction || currentPostId;
  const token = localStorage.getItem("token");

  if (!token) {
    appendAlert(t("loginRequiredDelete"), "danger");
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
      appendAlert(t("postDeletedSuccess"), "success");

      if (document.getElementById("postDeatils")) {
        window.location.href = getHomePath();
      } else {
        refreshCurrentPage();
      }
    })
    .catch((error) => {
      console.error(error);
      appendAlert(t("postDeleteFailed"), "danger");
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
    if (headerName) headerName.innerText = t("guest");
    if (headerName2) headerName2.innerText = t("guest");
    if (headeremail) headeremail.innerText = t("unregistered");
    if (headerUsername) headerUsername.innerText = "";
    if (postsCounter) postsCounter.innerText = "0";
    if (commentConunter) commentConunter.innerText = "0";
    if (postName) postName.innerText = t("guest");
    return;
  }

  axios.get(`${passURL}/users/${userId}`)
    .then((response) => {
      const userData = response.data.data;

      if (headerName) headerName.innerText = userData.name || userData.username || t("guest");
      if (headerName2) headerName2.innerText = userData.name || userData.username || "";
      if (headeremail) headeremail.innerText = userData.email || t("unregistered");
      if (headerUsername) headerUsername.innerText = userData.username ? `@${userData.username}` : "";
      if (postsCounter) postsCounter.innerText = userData.posts_count != null ? userData.posts_count : 0;
      if (commentConunter) commentConunter.innerText = userData.comments_count != null ? userData.comments_count : 0;

      if (headerImage) {
        headerImage.src = getSafeAvatar(userData.profile_image);
      }

      if (postName) {
        postName.innerText = userData.username || userData.name || t("guest");
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
      appendAlert(t("userDataFailed"), "danger");
    });
}

function getUserPostes() {
  const userId = getCurrentUserId();
  const userPostesDiv = document.getElementById("userPostes");
  if (!userPostesDiv) return;

  if (!userId) {
    userPostesDiv.innerHTML = `<div class="alert alert-warning text-center">${t("selectUserNotice")}</div>`;
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
      userPostesDiv.innerHTML = `<div class="alert alert-danger text-center">${t("userPostsFailed")}</div>`;
    });
}

function renderProfilePostsPage(page = 1) {
  const userPostesDiv = document.getElementById("userPostes");
  if (!userPostesDiv) return;

  profileCurrentPage = page;
  userPostesDiv.innerHTML = "";

  if (!profileUserPosts || profileUserPosts.length === 0) {
    userPostesDiv.innerHTML = `<div class="alert alert-info text-center">${t("noUserPosts")}</div>`;
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
      editBtn = `<button class="btn btn-outline-success btn-sm me-1" data-bs-toggle="modal" data-bs-target="#editModal" onclick="event.stopPropagation(); prepareEditPostFromEncoded('${postJsonStr}')">${t("editBtn")}</button>`;
      deleteBtn = `<button class="btn btn-outline-danger btn-sm" data-bs-toggle="modal" data-bs-target="#DeleteModal" onclick="event.stopPropagation(); prepareDeletePost(${post.id})">${t("deleteBtn")}</button>`;
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
            <div style="cursor: pointer; display: flex; align-items: center; gap: 10px;" onclick="userClicked(${post.author.id}, event)" title="${t("viewProfileTitle")}">
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
              <span class="text-muted"><i class="bi bi-chat-left-text me-1"></i>(${post.comments_count}) ${t("commentsCount")}</span>
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
            <a class="page-link" href="javascript:void(0)" onclick="renderProfilePostsPage(${page - 1})">${t("paginationPrev")}</a>
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
            <a class="page-link" href="javascript:void(0)" onclick="renderProfilePostsPage(${page + 1})">${t("paginationNext")}</a>
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
  setupInputListeners();
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