<?php
/**
 * Step 1 of the GitHub OAuth dance.
 * Decap opens this URL in a popup. We redirect to GitHub's authorize page.
 */
session_start();

$configFile = __DIR__ . '/oauth-config.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    exit('OAuth is not configured: oauth-config.php is missing on the server.');
}
$cfg = require $configFile;

// CSRF protection: a random state echoed back by GitHub and verified in callback.
$state = bin2hex(random_bytes(16));
$_SESSION['oauth_state'] = $state;

$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$redirectUri = $scheme . '://' . $_SERVER['HTTP_HOST'] . '/oauth/callback.php';

$params = [
    'client_id'    => $cfg['client_id'],
    'redirect_uri' => $redirectUri,
    'scope'        => $cfg['scope'] ?? 'repo',
    'state'        => $state,
    'allow_signup' => 'false',
];

header('Location: https://github.com/login/oauth/authorize?' . http_build_query($params));
exit;
