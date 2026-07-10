<?php
/**
 * Step 2 of the GitHub OAuth dance.
 * GitHub redirects back here with a `code`. We exchange it for an access token
 * and hand that token to the Decap window via postMessage.
 */
session_start();

$configFile = __DIR__ . '/oauth-config.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    exit('OAuth is not configured: oauth-config.php is missing on the server.');
}
$cfg = require $configFile;

$code  = $_GET['code']  ?? '';
$state = $_GET['state'] ?? '';

// Verify the CSRF state matches what we issued in auth.php.
$stateOk = $state !== ''
    && isset($_SESSION['oauth_state'])
    && hash_equals($_SESSION['oauth_state'], $state);
unset($_SESSION['oauth_state']);

$token = null;
$error = null;

if (!$code || !$stateOk) {
    $error = 'Invalid OAuth request (missing code or bad state).';
} else {
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $redirectUri = $scheme . '://' . $_SERVER['HTTP_HOST'] . '/oauth/callback.php';

    $ch = curl_init('https://github.com/login/oauth/access_token');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => ['Accept: application/json'],
        CURLOPT_POSTFIELDS     => http_build_query([
            'client_id'     => $cfg['client_id'],
            'client_secret' => $cfg['client_secret'],
            'code'          => $code,
            'redirect_uri'  => $redirectUri,
        ]),
        CURLOPT_TIMEOUT        => 15,
    ]);
    $response = curl_exec($ch);
    if ($response === false) {
        $error = 'Could not reach GitHub: ' . curl_error($ch);
    }
    curl_close($ch);

    if (!$error) {
        $data = json_decode($response, true);
        $token = $data['access_token'] ?? null;
        if (!$token) {
            $error = 'GitHub did not return a token: ' . ($data['error_description'] ?? 'unknown error');
        }
    }
}

// Build the message Decap expects on its window.
if ($token) {
    $content = 'authorization:github:success:' . json_encode(['token' => $token, 'provider' => 'github']);
} else {
    $content = 'authorization:github:error:' . json_encode(['message' => $error]);
}
?><!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Authorizing…</title></head>
<body>
<p>Completing sign-in… you can close this window if it doesn't close on its own.</p>
<script>
(function () {
    function receiveMessage(e) {
        window.opener.postMessage(<?php echo json_encode($content); ?>, e.origin);
        window.removeEventListener('message', receiveMessage, false);
    }
    window.addEventListener('message', receiveMessage, false);
    // Tell the opener (Decap) we're ready; it replies and we send the token above.
    window.opener.postMessage('authorizing:github', '*');
})();
</script>
</body>
</html>
