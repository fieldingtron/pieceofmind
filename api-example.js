// Example backend API endpoint for sending emails via Resend
// This file should be implemented on your backend server (Node.js, Python, PHP, etc.)
// DO NOT expose your Resend API key in frontend code!

// Example using Node.js with Express:

/*
const express = require('express');
const { Resend } = require('resend');
const cors = require('cors');

const app = express();
const resend = new Resend('YOUR_RESEND_API_KEY'); // Replace with your actual API key

app.use(express.json());
app.use(cors({
    origin: 'https://yourdomain.com' // Replace with your domain
}));

app.post('/api/send-order', async (req, res) => {
    try {
        const { to, from, subject, html, replyTo } = req.body;
        
        // Validate required fields
        if (!to || !from || !subject || !html) {
            return res.status(400).json({ 
                error: 'Missing required fields' 
            });
        }
        
        // Send email via Resend
        const data = await resend.emails.send({
            from: from,
            to: to,
            subject: subject,
            html: html,
            reply_to: replyTo
        });
        
        res.json({ 
            success: true, 
            id: data.id 
        });
        
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ 
            error: 'Failed to send email',
            message: error.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
*/

// Alternative: Serverless Function (e.g., Vercel, Netlify)
/*
// api/send-order.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { to, from, subject, html, replyTo } = req.body;
        
        const data = await resend.emails.send({
            from: from,
            to: to,
            subject: subject,
            html: html,
            reply_to: replyTo
        });
        
        res.status(200).json({ success: true, id: data.id });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
}
*/

// Alternative: PHP Example
/*
<?php
// api/send-order.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://yourdomain.com');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$apiKey = 'YOUR_RESEND_API_KEY';
$url = 'https://api.resend.com/emails';

$postData = [
    'from' => $data['from'],
    'to' => $data['to'],
    'subject' => $data['subject'],
    'html' => $data['html'],
    'reply_to' => $data['replyTo']
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $apiKey
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    echo $response;
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send email']);
}
?>
*/
