const express = require('express');
const Contact = require('../models/items');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Create Contact
router.post('/', authMiddleware, async (req, res) => {
    try {
        const newContact = new Contact({
            ...req.body,
            user: req.user.id  // ✅ Save logged-in user's ID
        });
        await newContact.save();
        res.status(201).json(newContact);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Read All Contacts (Only user's own contacts)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const contacts = await Contact.find({ user: req.user.id });  // ✅ Only fetch logged-in user's contacts
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Contact (only if it belongs to user)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const contact = await Contact.findOne({ _id: req.params.id, user: req.user.id });
        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        const updated = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete Contact (only if it belongs to user)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const contact = await Contact.findOne({ _id: req.params.id, user: req.user.id });
        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        await Contact.findByIdAndDelete(req.params.id);
        res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
