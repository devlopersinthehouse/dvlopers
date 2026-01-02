const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { protect } = require('../middleware/auth');

router.post('/submit', protect, async (req, res) => {
    const { name, email, details, estimatedPrice, files = [] } = req.body;

    try {
        // Save to database (optional – abhi ke liye skip kar sakte ho)

        // Send email to admin
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        let filesHtml = '';
        if (files.length > 0) {
            filesHtml = '<h3>Attached Files:</h3><ul>';
            files.forEach(file => {
                filesHtml += `<li><a href="${file}" target="_blank">${file}</a></li>`;
            });
            filesHtml += '</ul>';
        }

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: 'developersinthehouse@gmail.com', // ← APNA ADMIN EMAIL DAALO
            subject: `New Order from ${name}`,
            html: `
                <h2>New Project Order Received!</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Estimated Price:</strong> ₹${estimatedPrice}</p>
                <p><strong>Project Details:</strong></p>
                <p>${details.replace(/\n/g, '<br>')}</p>
                ${filesHtml}
                <hr>
                <small>Sent from Developer Studio</small>
            `
        });

        res.json({ message: 'Order submitted successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to submit order' });
    }
});

module.exports = router;