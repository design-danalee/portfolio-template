<?php
/**
 * Copy this file to `oauth-config.php` ON THE SERVER (do NOT commit the real one)
 * and fill in the credentials from your GitHub OAuth App.
 *
 * GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
 *   Homepage URL:               https://YOUR-LIVE-DOMAIN
 *   Authorization callback URL: https://YOUR-LIVE-DOMAIN/oauth/callback.php
 *
 * See CMS-SETUP.md for full instructions.
 */
return [
    'client_id'     => 'YOUR_GITHUB_OAUTH_CLIENT_ID',
    'client_secret' => 'YOUR_GITHUB_OAUTH_CLIENT_SECRET',
    // OAuth scope. "repo" is required so the CMS can read/write the repository.
    'scope'         => 'repo',
];
