const API_URL = "http://localhost:5000/api";
let token = "";
let editContactId = null;

function showSignup() {
    document.getElementById('signup-section').style.display = 'block';
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('contact-section').style.display = 'none';
}

function showLogin() {
    document.getElementById('signup-section').style.display = 'none';
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('contact-section').style.display = 'none';
}

// Signup with validation
const signupForm = document.getElementById('signup-form');
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailInput = document.getElementById('signup-email');
    const passwordInput = document.getElementById('signup-password');
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');

    emailError.innerText = '';
    passwordError.innerText = '';
    emailInput.classList.remove('invalid', 'valid');
    passwordInput.classList.remove('invalid', 'valid');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
    const validDomains = ["gmail.com", "yahoo.com", "outlook.com"];
    const domain = email.split('@')[1];

    let hasError = false;

    if (!email) {
        emailError.innerText = 'Email is required.';
        emailInput.classList.add('invalid');
        hasError = true;
    } else if (!emailRegex.test(email)) {
        emailError.innerText = 'Please enter a valid email address.';
        emailInput.classList.add('invalid');
        hasError = true;
    } else if (!validDomains.includes(domain)) {
        emailError.innerText = 'Only Gmail, Yahoo, or Outlook emails are allowed.';
        emailInput.classList.add('invalid');
        hasError = true;
    } else {
        emailInput.classList.add('valid');
    }

    if (!password) {
        passwordError.innerText = 'Password is required.';
        passwordInput.classList.add('invalid');
        hasError = true;
    } else if (password.length < 6) {
        passwordError.innerText = 'Password must be at least 6 characters.';
        passwordInput.classList.add('invalid');
        hasError = true;
    } else {
        passwordInput.classList.add('valid');
    }

    if (hasError) return;

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.status === 201) {
            alert('Registration Successful! Please Login.');
            showLogin();
        } else {
            emailError.innerText = data.message || 'Registration failed.';
        }
    } catch (err) {
        emailError.innerText = 'Server error.';
    }
});

// Login
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const errorElement = document.getElementById('login-error');
    errorElement.innerText = '';

    if (!email || !password) {
        errorElement.innerText = 'Email and password are required.';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (data.token) {
            localStorage.setItem('token', data.token);
            token = data.token;
            document.getElementById('signup-section').style.display = 'none';
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('contact-section').style.display = 'block';
            fetchContacts();
        } else {
            errorElement.innerText = data.message || 'Login failed.';
        }
    } catch (err) {
        errorElement.innerText = 'Server error.';
    }
});

// Toggle Signup/Login links
document.getElementById('to-login').addEventListener('click', (e) => {
    e.preventDefault();
    showLogin();
});

document.getElementById('to-signup').addEventListener('click', (e) => {
    e.preventDefault();
    showSignup();
});

// Add / Update Contact
document.getElementById('contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const contact = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        address: document.getElementById('address').value
    };

    const url = editContactId ? `${API_URL}/contacts/${editContactId}` : `${API_URL}/contacts`;
    const method = editContactId ? 'PUT' : 'POST';

    await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(contact)
    });

    editContactId = null;
    document.getElementById('add-update-button').innerText = "Add Contact";
    document.getElementById('contact-form').reset();
    fetchContacts();
});

// Fetch Contacts
async function fetchContacts() {
    const res = await fetch(`${API_URL}/contacts`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const contacts = await res.json();

    const tbody = document.getElementById('contacts-body');
    tbody.innerHTML = '';

    contacts.forEach(contact => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${contact.name}</td>
            <td>${contact.email}</td>
            <td>${contact.phoneNumber}</td>
            <td>${contact.address}</td>
            <td>
                <button onclick="editContact('${contact._id}', '${contact.name}', '${contact.email}', '${contact.phoneNumber}', '${contact.address}')">Edit</button>
                <button onclick="deleteContact('${contact._id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function editContact(id, name, email, phoneNumber, address) {
    document.getElementById('name').value = name;
    document.getElementById('email').value = email;
    document.getElementById('phoneNumber').value = phoneNumber;
    document.getElementById('address').value = address;

    editContactId = id;
    document.getElementById('add-update-button').innerText = "Update Contact";
}

async function deleteContact(id) {
    await fetch(`${API_URL}/contacts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchContacts();
}

document.getElementById('logout-button').addEventListener('click', () => {
    localStorage.removeItem('token');
    token = "";
    showLogin();
});

window.addEventListener('load', () => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
        token = savedToken;
        document.getElementById('signup-section').style.display = 'none';
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('contact-section').style.display = 'block';
        fetchContacts();
    }
});

document.getElementById("search-input").addEventListener("input", function () {
    const searchValue = this.value.toLowerCase();
    const rows = document.querySelectorAll("#contacts-body tr");

    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        let matched = false;

        for (let i = 0; i < 3; i++) {
            const cellText = cells[i].innerText;
            const lowerText = cellText.toLowerCase();

            if (searchValue && lowerText.includes(searchValue)) {
                const regex = new RegExp(`(${searchValue})`, 'gi');
                cells[i].innerHTML = cellText.replace(regex, `<mark>$1</mark>`);
                matched = true;
            } else {
                cells[i].innerHTML = cellText;
            }
        }

        row.style.display = matched || !searchValue ? "" : "none";
    });
});
