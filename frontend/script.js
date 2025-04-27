const API_URL = "http://localhost:5000/api";
let token = "";
let editContactId = null;

// Show Signup Section
function showSignup() {
    document.getElementById('signup-section').style.display = 'block';
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('contact-section').style.display = 'none';
}

// Show Login Section
function showLogin() {
    document.getElementById('signup-section').style.display = 'none';
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('contact-section').style.display = 'none';
}

// Signup
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const errorElement = document.getElementById('signup-error');
    errorElement.innerText = '';

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
            errorElement.innerText = data.message || 'Registration failed.';
        }
    } catch (err) {
        errorElement.innerText = 'Server error.';
    }
});

// Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorElement = document.getElementById('login-error');
    errorElement.innerText = '';

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

    if (editContactId) {
        await fetch(`${API_URL}/contacts/${editContactId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(contact)
        });
        editContactId = null;
        document.getElementById('add-update-button').innerText = "Add Contact";
    } else {
        await fetch(`${API_URL}/contacts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(contact)
        });
    }

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

// Edit Contact
function editContact(id, name, email, phoneNumber, address) {
    document.getElementById('name').value = name;
    document.getElementById('email').value = email;
    document.getElementById('phoneNumber').value = phoneNumber;
    document.getElementById('address').value = address;

    editContactId = id;
    document.getElementById('add-update-button').innerText = "Update Contact";
}

// Delete Contact
async function deleteContact(id) {
    await fetch(`${API_URL}/contacts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchContacts();
}

// Logout
document.getElementById('logout-button').addEventListener('click', () => {
    localStorage.removeItem('token');
    token = "";
    showLogin();
});

// Auto-login if token is saved
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
