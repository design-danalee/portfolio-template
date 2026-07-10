<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Location: contact.html");
    exit;
}

$name         = trim($_POST['name'] ?? '');
$email        = trim($_POST['email'] ?? '');
$organization = trim($_POST['organization'] ?? '');
$project      = trim($_POST['project'] ?? '');
$message      = trim($_POST['message'] ?? '');

// Load PHPMailer.
// Manual install: upload the PHPMailer "src" folder so these paths exist.
// Composer install: delete the three lines below and use:
//   require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/phpmailer/src/Exception.php';
require __DIR__ . '/phpmailer/src/PHPMailer.php';
require __DIR__ . '/phpmailer/src/SMTP.php';

$cfg = require __DIR__ . '/smtp-config.php';

// Recipient + subject come from the CMS (src/_data/contact.json → built into
// /contact-config.json). Fall back to the server SMTP config if unset.
$recipient = $cfg['to'];
$subject   = 'New message from your website';
$ccPath    = __DIR__ . '/contact-config.json';
if (is_readable($ccPath)) {
    $cc = json_decode(file_get_contents($ccPath), true);
    if (is_array($cc)) {
        if (!empty($cc['notifyEmail']) && filter_var($cc['notifyEmail'], FILTER_VALIDATE_EMAIL)) {
            $recipient = $cc['notifyEmail'];
        }
        if (!empty($cc['formSubject'])) {
            $subject = $cc['formSubject'];
        }
    }
}

$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host       = $cfg['host'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $cfg['username'];
    $mail->Password   = $cfg['password'];
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = (int) $cfg['port'];
    $mail->CharSet    = 'UTF-8';

    // Gmail requires the From to be the authenticated account; the visitor's
    // address goes on Reply-To so you can reply straight to them.
    $mail->setFrom($cfg['from'], $cfg['from_name']);
    $mail->addAddress($recipient);
    if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $mail->addReplyTo($email, $name !== '' ? $name : $email);
    }

    $mail->Subject = $subject;
    $mail->Body    = "Name: $name\n"
                   . "Email: $email\n"
                   . "Organization: $organization\n"
                   . "Project: $project\n\n"
                   . "Other notes:\n$message";

    $mail->send();
    header("Location: contact.html?status=success");
} catch (Exception $e) {
    error_log("contact.php PHPMailer error: " . $mail->ErrorInfo);
    header("Location: contact.html?status=error");
}
exit;
