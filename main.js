import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCwiVXtw7pvZJfA7uZ5e0YktVgq0vNMQcI",
  authDomain: "nexcomm-df329.firebaseapp.com",
  projectId: "nexcomm-df329",
  storageBucket: "nexcomm-df329.firebasestorage.app",
  messagingSenderId: "252645001078",
  appId: "1:252645001078:web:dec86f72c1b4db50ae5c57",
  measurementId: "G-S59FJ1KB7T"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. THEME SWITCHER (DARK/LIGHT MODE)
     ========================================================================== */
  const themeToggle = document.getElementById('theme-toggle');
  const htmlElement = document.documentElement;

  // Initialize theme from localStorage or system setting
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
  } else if (systemPrefersDark) {
    htmlElement.setAttribute('data-theme', 'dark');
  } else {
    htmlElement.setAttribute('data-theme', 'light');
  }

  // Toggle theme click event
  themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  /* ==========================================================================
     2. MOBILE MENU & HAMBURGER TOGGLE
     ========================================================================== */
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  const toggleMenu = () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    // Lock scroll when menu is active
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
  };

  hamburger.addEventListener('click', toggleMenu);

  // Close mobile menu when a nav link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('active')) {
        toggleMenu();
      }
    });
  });

  /* ==========================================================================
     3. STICKY NAVBAR SHOW/HIDE ON SCROLL
     ========================================================================== */
  const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 150) {
    // Add shadow when scrolled down
    navbar.style.boxShadow = 'var(--shadow-sm)';
    // Ensure it never gets hidden
    navbar.classList.remove('hidden'); 
  } else {
    // Remove shadow when at the very top
    navbar.style.boxShadow = 'none';
  }
});

  /* ==========================================================================
     4. INTERSECTION OBSERVER FOR FADE-UP ANIMATIONS
     ========================================================================== */
  const fadeUpElements = document.querySelectorAll('.fade-up');
  
  const fadeUpObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target); // Stop observing once animated
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  fadeUpElements.forEach(element => {
    fadeUpObserver.observe(element);
  });

  /* ==========================================================================
     5. SCROLLSPY (ACTIVE LINK ON SCROLL)
     ========================================================================== */
  const sections = document.querySelectorAll('section[id]');
  
  window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop;
      const sectionId = section.getAttribute('id');
      const associatedLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

      if (associatedLink && scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        navLinks.forEach(link => link.classList.remove('active'));
        associatedLink.classList.add('active');
      }
    });
  });

  /* ==========================================================================
     6. CURRICULUMS TAB SWITCHER
     ========================================================================== */
  const tabContainers = document.querySelectorAll('.tab-container');
  tabContainers.forEach(container => {
    const triggers = container.querySelectorAll('.tab-trigger');
    const panels = container.querySelectorAll('.tab-panel');

    triggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const targetPanelId = trigger.getAttribute('aria-controls');

        // Deactivate triggers & panels in this container
        triggers.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        panels.forEach(p => p.classList.remove('active'));

        // Activate selected trigger and panel
        trigger.classList.add('active');
        trigger.setAttribute('aria-selected', 'true');
        const targetPanel = container.querySelector(`#${targetPanelId}`) || document.getElementById(targetPanelId);
        if (targetPanel) {
          targetPanel.classList.add('active');
        }
      });
    });
  });

  /* ==========================================================================
     7. FAQ ACCORDION LOGIC
     ========================================================================== */
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const parent = question.parentElement;
      const answer = parent.querySelector('.faq-answer');
      const isExpanded = question.getAttribute('aria-expanded') === 'true';

      // Toggle state
      question.setAttribute('aria-expanded', !isExpanded);
      parent.classList.toggle('active');

      if (!isExpanded) {
        answer.hidden = false;
        // Small delay to allow browser to calculate layout before transition
        setTimeout(() => {
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }, 10);
      } else {
        answer.style.maxHeight = '0px';
        answer.addEventListener('transitionend', function handler() {
          answer.hidden = true;
          answer.removeEventListener('transitionend', handler);
        }, { once: true });
      }
    });
  });

 /* ==========================================================================
     8. APPLICATION FORM VALIDATION & INTERACTIVE STATE
     ========================================================================== */
  const applyForm = document.getElementById('apply-form');
  const successOverlay = document.getElementById('form-success');
  const resetBtn = document.getElementById('reset-form-btn');

  // Input elements
  const inputs = {
    name: document.getElementById('full-name'),
    email: document.getElementById('email'),
    year: document.getElementById('year'),
    program: document.getElementById('program-select'),
    experience: document.getElementById('experience')
  };

  // Validation functions
  const validateField = (input, validatorFn) => {
    const parent = input.parentElement;
    const isValid = validatorFn(input.value.trim());
    
    if (isValid) {
      parent.classList.remove('is-invalid');
    } else {
      parent.classList.add('is-invalid');
    }
    return isValid;
  };

  // Validators
  const validators = {
    name: val => val.length > 0,
    email: val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), // Basic email check
    year: val => val !== '',
    program: val => val !== '',
    experience: val => val.length >= 10 // Require at least 10 characters
  };

  // Add input event listeners for real-time validation clearing
  Object.keys(inputs).forEach(key => {
    const input = inputs[key];
    const eventType = input.tagName === 'SELECT' ? 'change' : 'input';
    
    input.addEventListener(eventType, () => {
      validateField(input, validators[key]);
    });
  });

  // Handle submit
  applyForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let formIsValid = true;
    
    // Check all fields
    Object.keys(inputs).forEach(key => {
      const isValid = validateField(inputs[key], validators[key]);
      if (!isValid) formIsValid = false;
    });

    if (formIsValid) {
      const submitBtn = applyForm.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Submitting...';
      submitBtn.disabled = true;

      // Get token if user is logged in
      // Send data to firebase
      addDoc(collection(db, 'applications'), {
        name: inputs.name.value.trim(),
        email: inputs.email.value.trim(),
        year: inputs.year.value,
        program: inputs.program.value,
        experience: inputs.experience.value.trim(),
        timestamp: new Date()
      })
      .then(() => {
        successOverlay.classList.add('active');
      })
      .catch(error => {
        console.error('Submission failed:', error);
        alert('Failed to submit application. Please try again.');
      });
    }
  });

  // Reset form / close success panel
  resetBtn.addEventListener('click', () => {
    successOverlay.classList.remove('active');
    applyForm.reset();
    // Clear validation styling classes
    Object.values(inputs).forEach(input => {
      input.parentElement.classList.remove('is-invalid');
    });
  });

  /* ==========================================================================
     9. FOOTER NEWSLETTER SUBSCRIPTION
     ========================================================================== */
  const newsletterForm = document.getElementById('newsletter-form');
  const newsSuccess = document.getElementById('news-success');

  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('news-email');
    const emailVal = emailInput.value.trim();

    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      emailInput.value = '';
      newsSuccess.classList.add('active');
      setTimeout(() => {
        newsSuccess.classList.remove('active');
      }, 4000);
    } else {
      emailInput.style.borderColor = '#ff3333';
      setTimeout(() => {
        emailInput.style.borderColor = '';
      }, 2000);
    }
  });

  /* ==========================================================================
     11. USER AUTHENTICATION & SESSION MANAGEMENT
     ========================================================================== */
  const authModal = document.getElementById('auth-modal');
  const navLoginBtn = document.getElementById('nav-login-btn');
  const authCloseBtn = document.getElementById('auth-close-btn');
  const googleBtn = document.getElementById('auth-google-btn');
  const githubBtn = document.getElementById('auth-github-btn');
  const chooseUsernameForm = document.getElementById('username-form');
  const chooseUsernameInput = document.getElementById('choose-username');
  const chooseUsernameError = document.getElementById('choose-username-error');
  const userDropdownWrapper = document.getElementById('user-dropdown-wrapper');
  const userProfileTrigger = document.getElementById('user-profile-trigger');
  const userDropdownMenu = document.getElementById('user-dropdown-menu');
  const userNavbarAvatar = document.getElementById('user-navbar-avatar');
  const userNavbarUsername = document.getElementById('user-navbar-username');
  const dropdownEmail = document.getElementById('dropdown-user-email');
  const dropdownProvider = document.getElementById('dropdown-user-provider');
  const logoutBtn = document.getElementById('logout-btn');
  const navJoinBtn = document.getElementById('nav-join-btn');

  // Panes
  const panes = {
    providers: document.getElementById('auth-pane-providers'),
    redirect: document.getElementById('auth-pane-redirect'),
    external: document.getElementById('auth-pane-external')
  };

  
  const allowedDomain = "@srmist.edu.in";

  // Form Inputs (Email/Password)
  const nameInput = document.getElementById("name-input");
  const emailInput = document.getElementById("email-input");
  const passwordInput = document.getElementById("password-input");
  const confirmPasswordInput = document.getElementById("confirm-password-input");
  const authContainer = document.querySelector(".auth-container");
  const signUpBtn = document.getElementById("sign-up-btn");
  const signInBtn = document.getElementById("sign-in-btn");

  const switchPane = (activePaneName) => {
    Object.keys(panes).forEach(paneKey => {
      if (paneKey === activePaneName) {
        panes[paneKey].classList.add('active');
      } else {
        panes[paneKey].classList.remove('active');
      }
    });
  };

  const updateAuthStateUI = async (user) => {
    if (user) {
      navLoginBtn.style.display = 'none';
      if (navJoinBtn) navJoinBtn.style.display = 'none';
      userDropdownWrapper.style.display = 'inline-flex';
      if (authContainer) authContainer.style.display = 'none';

      let userName = user.displayName || user.email.split("@")[0];
      try {
        const collectionName = user.email.endsWith(allowedDomain) ? "users" : "external_users";
        const userDoc = await getDoc(doc(db, collectionName, user.uid));
        if (userDoc.exists() && userDoc.data().name) {
          userName = userDoc.data().name;
        }
      } catch (e) {
        console.error("Error fetching profile name:", e);
      }

      userNavbarUsername.textContent = userName;
      dropdownEmail.textContent = user.email;
      userNavbarAvatar.src = user.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.uid}`;
      dropdownProvider.textContent = user.providerData.length > 0 ? `via ${user.providerData[0].providerId}` : 'via Email';
    } else {
      navLoginBtn.style.display = 'inline-block';
      if (navJoinBtn) navJoinBtn.style.display = 'inline-block';
      userDropdownWrapper.style.display = 'none';
      if (authContainer) authContainer.style.display = 'block';
    }
  };

  const openAuthModal = () => {
    authModal.classList.add('active');
    authModal.setAttribute('aria-hidden', 'false');
    switchPane('providers');
    document.body.style.overflow = 'hidden';
  };

  const closeAuthModal = () => {
    authModal.classList.remove('active');
    authModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  onAuthStateChanged(auth, (user) => {
    updateAuthStateUI(user);
  });

  const externalDetailsForm = document.getElementById('external-details-form');
  let pendingExternalUser = null;

  const showExternalDetailsForm = (userData) => {
    pendingExternalUser = userData;
    openAuthModal();
    switchPane('external');
  };

  if (externalDetailsForm) {
    externalDetailsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!pendingExternalUser) return;
      
      const college = document.getElementById('ext-college').value.trim();
      const dept = document.getElementById('ext-dept').value.trim();
      const year = document.getElementById('ext-year').value.trim();

      try {
        await setDoc(doc(db, "external_users", pendingExternalUser.uid), {
          name: pendingExternalUser.name,
          email: pendingExternalUser.email,
          joinMethod: pendingExternalUser.joinMethod,
          college: college,
          department: dept,
          year: year,
          hasPaid: false,
          timestamp: new Date()
        });
        alert("Registration complete!");
        closeAuthModal();
        updateAuthStateUI(auth.currentUser);
      } catch (error) {
        alert("Error saving details: " + error.message);
      }
    });
  }

  const handleOAuth = async (providerName) => {
    let provider = providerName === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const collectionName = user.email && user.email.endsWith(allowedDomain) ? "users" : "external_users";
      
      const userDoc = await getDoc(doc(db, collectionName, user.uid));
      if (!userDoc.exists()) {
        if (collectionName === "users") {
           await setDoc(doc(db, collectionName, user.uid), {
             name: user.displayName || "No Name Provided",
             email: user.email,
             joinMethod: providerName,
             hasPaid: false,
             timestamp: new Date()
           });
           closeAuthModal();
        } else {
           showExternalDetailsForm({
             uid: user.uid,
             name: user.displayName || "No Name Provided",
             email: user.email,
             joinMethod: providerName
           });
        }
      } else {
        closeAuthModal();
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  if (googleBtn) googleBtn.addEventListener('click', () => handleOAuth('google'));
  // Removed GitHub button listener

  
  const forgotPasswordLink = document.getElementById("forgot-password-link");
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      if (!email) {
        alert("Please enter your email address in the Email field first, then click 'Forgot Password?'.");
        return;
      }
      sendPasswordResetEmail(auth, email)
        .then(() => {
          alert("Password reset email sent! Check your inbox.");
        })
        .catch((error) => {
          alert("Error sending reset email: " + error.message);
        });
    });
  }

  if (signUpBtn) {
    signUpBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      if (passwordInput.value !== confirmPasswordInput.value) {
        alert("Passwords do not match.");
        return;
      }
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
        const user = userCredential.user;
        const providedName = nameInput && nameInput.value ? nameInput.value : "No Name Provided";
        
        if (user.email.endsWith(allowedDomain)) {
          await setDoc(doc(db, "users", user.uid), {
            name: providedName,
            email: user.email,
            joinMethod: "Email/Password",
            hasPaid: false,
            timestamp: new Date()
          });
          alert("Account created and logged in!");
        } else {
          showExternalDetailsForm({
             uid: user.uid,
             name: providedName,
             email: user.email,
             joinMethod: "Email/Password"
          });
        }
      } catch (error) {
        alert("Error: " + error.message);
      }
    });
  }

  if (signInBtn) {
    signInBtn.addEventListener("click", (e) => {
      e.preventDefault();
      signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value)
        .then(() => alert("Signed in successfully!"))
        .catch((error) => alert("Error: " + error.message));
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      signOut(auth).then(() => alert("Logged out successfully.")).catch((error) => alert("Error logging out: " + error.message));
    });
  }

  if (authCloseBtn) authCloseBtn.addEventListener('click', closeAuthModal);
  authModal.addEventListener('click', (e) => {
    if (e.target === authModal) closeAuthModal();
  });

  userProfileTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdownMenu.classList.toggle('active');
  });

  document.addEventListener('click', () => {
    userDropdownMenu.classList.remove('active');
  });

  const teaserNotifyBtn = document.getElementById('teaser-notify-btn');
  if (teaserNotifyBtn) {
    teaserNotifyBtn.addEventListener('click', () => {
      if (auth.currentUser) {
        alert('Alert profile confirmed! You will receive immediate updates and registration details for ANTENNA DUEL directly at your registered email address.');
      } else {
        alert('Please connect your student profile first to subscribe to ANTENNA DUEL notifications.');
        openAuthModal();
      }
    });
  }

});
