import { auth, database } from "./firebase-config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Signup event listener is now handled in the DOMContentLoaded event below

// Create and add CSS for modal
const modalStyle = document.createElement('style');
modalStyle.textContent = `
  .modal-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  .modal-overlay.active {
    opacity: 1;
  }
`;
document.head.appendChild(modalStyle);

// Create success modal HTML
const successModal = document.createElement('div');
successModal.className = 'modal-overlay';
successModal.innerHTML = `
  <div class="modal" style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
    <h3 style="color: #00BFA5;">Signup Successful!</h3>
    <p>Your account has been created successfully.</p>
    <button onclick="window.location.href='login.html'" style="background: #00BFA5; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">Go to Login</button>
  </div>
`;
document.body.appendChild(successModal);

// Signup Function
document.addEventListener('DOMContentLoaded', () => {
  const signupBtn = document.getElementById("signup-btn");
  if (!signupBtn) {
    console.error('Signup button not found!');
    return;
  }

  signupBtn.addEventListener("click", async function (e) {
    e.preventDefault();
    console.log('Signup button clicked');

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    // Form validation
    if (!username || !email || !password || !confirmPassword) {
      alert("Please fill in all fields");
      console.log('Form validation failed: empty fields');
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      console.log('Form validation failed: passwords do not match');
      return;
    }

    try {
      console.log('Attempting to create user with email:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userId = user.uid;
      console.log('User created successfully:', userId);

      // Store user data in Firebase Database
      try {
        await set(ref(database, "users/" + userId), {
          username: username,
          email: email,
          userId: userId
        });
        console.log('User data stored in database');
        
        // Show success modal
        successModal.style.display = 'flex';
        setTimeout(() => {
          successModal.classList.add('active');
        }, 10);
      } catch (dbError) {
        console.error('Database Error:', dbError);
        alert("Database Error: " + dbError.message);
      }
    } catch (authError) {
      console.error('Authentication Error:', authError);
      alert("Signup Failed: " + authError.message);
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById("login-btn");
  if (!loginBtn) {
    console.error('Login button not found!');
    return;
  }

  loginBtn.addEventListener("click", async function (e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }
    
    login(email, password);
  });
});

function login(email, password) {
    // Clear previous errors
    document.getElementById('email-error').textContent = '';
    document.getElementById('password-error').textContent = '';

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            console.log("User logged in:", userCredential.user);
            window.location.href = 'app.html';
        })
        .catch(error => {
            console.error("Error:", error.code);
            // Handle specific error cases
            if (error.code === 'auth/invalid-email' || error.code === 'auth/user-not-found') {
                document.getElementById('email-error').textContent = 'Invalid email or user not found';
            } else if (error.code === 'auth/wrong-password') {
                document.getElementById('password-error').textContent = 'Incorrect password';
            } else {
                alert('Login failed: ' + error.message);
            }
        });
}


firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log("User logged in:", user.email);
        
        // Load tasks only for this user
        loadTasks(user.uid);
    } else {
        console.log("No user logged in");
        
        // Clear the task list if the user logs out
        document.getElementById("taskList").innerHTML = "";
    }
});

  
  