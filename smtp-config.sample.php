<?php
/**
 * SMTP credentials for the contact form.
 *
 * SETUP (one time, on your server only — NEVER commit the real file):
 *   1. Copy this file to `smtp-config.php` on your web host (same folder as
 *      contact.php). `smtp-config.php` is git-ignored on purpose.
 *   2. Fill in a mail account to SEND from. Gmail example below: create an
 *      "App password" at Google Account → Security → App passwords, and use
 *      that 16-character value (NOT your normal Gmail password).
 *
 * WHERE MESSAGES GO: the recipient is set in the CMS (Contact page →
 * "Notification email"), not here. `to` below is only a fallback if that's blank.
 */
return [
    'host'      => 'smtp.gmail.com',
    'port'      => 587,
    'username'  => 'you@gmail.com',        // the sending account
    'password'  => 'your-16-char-app-password',
    'from'      => 'you@gmail.com',        // must match the authenticated account
    'from_name' => 'Your Website contact form',
    'to'        => 'you@example.com',      // fallback recipient (CMS value wins)
];
