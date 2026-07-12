# Setup Guide

This walks you through turning this template into your own live website, step by
step. You don't need to know how to code, and you don't need a terminal — just a
web browser. It takes about 20–30 minutes, most of which is waiting for accounts
to be created.

You'll do everything in two places: **GitHub** (where your website's files live)
and **your web host** (the company that actually serves your website to visitors —
e.g. Bluehost). A few steps are unavoidably technical (getting hosting, wiring up
one set of credentials) because that's just what it takes to run your own
independent site — but every step below tells you exactly what to click.

---

## What you'll need before you start

- A **GitHub account** (free) — [github.com/join](https://github.com/join) if you
  don't have one.
- A **PHP web hosting account** with FTP access — e.g. Bluehost, HostGator,
  SiteGround. Any host that lets you host "PHP" or "static" sites works. (This
  guide assumes you already have one, or are about to sign up for one.)
- A **domain name** — usually bought through your host, or elsewhere and pointed
  at your host.
- A **Gmail account** you're willing to send contact-form emails from (a regular
  Gmail address works fine — you're not changing your password, just creating a
  separate "app password" for this one purpose, explained below).

---

## Step 1 — Make your own copy of this template

1. On this repository's GitHub page, click the green **"Use this template"**
   button near the top right, then **"Create a new repository."**
2. Choose an owner (your GitHub account) and a name for your new repository —
   this can be anything, e.g. `my-portfolio`.
3. Leave it set to **Public** (the CMS needs to read your content without you
   being signed in, so the repo can't be Private).
4. Click **Create repository**.

You now have your own, completely independent copy. Nothing you do next affects
the original template.

---

## Step 2 — Get your web host's FTP details

Your web host will deploy your GitHub repository to your host account
automatically every time you save something. To let that happen, you need three
pieces of information from your host — usually found under a section called
**FTP Accounts** or **FTP/SFTP** in your hosting control panel (cPanel):

- **FTP server / hostname** (often just your domain, or something like
  `ftp.yourdomain.com`)
- **FTP username**
- **FTP password**

Write these down or keep the tab open — you'll paste them into GitHub next.

---

## Step 3 — Add your FTP details to GitHub

In your new repository on GitHub:

1. Go to **Settings** (top tab) → **Secrets and variables** → **Actions**
   (left sidebar).
2. You'll see two tabs: **Secrets** and **Variables**. Add these:

   **Under the "Variables" tab** — click **New repository variable** for each:
   | Name | Value |
   |---|---|
   | `FTP_SERVER` | your FTP server/hostname from Step 2 |
   | `FTP_USERNAME` | your FTP username from Step 2 |

   **Under the "Secrets" tab** — click **New repository secret** for:
   | Name | Value |
   |---|---|
   | `FTP_PASSWORD` | your FTP password from Step 2 |

   (Secrets are hidden after saving — even from you — which is why the password
   goes here and the server/username, which aren't sensitive, go in Variables
   where you can see them again later.)

---

## Step 4 — Create a GitHub sign-in for your CMS

Your website's editor (`/admin/`) uses "Sign in with GitHub" so that only you
(or people you invite as collaborators) can edit it. This needs a one-time setup
called an **OAuth App**.

1. Go to **[github.com/settings/developers](https://github.com/settings/developers)**
   → **OAuth Apps** → **New OAuth App**.
2. Fill in:
   - **Application name:** anything, e.g. "My Portfolio CMS"
   - **Homepage URL:** `https://yourdomain.com` (your real domain from Step 2)
   - **Authorization callback URL:** `https://yourdomain.com/oauth/callback.php`
3. Click **Register application**.
4. On the page that appears, copy the **Client ID**.
5. Click **Generate a new client secret**, and copy that too (you won't be able
   to see it again after leaving the page).

Now add both to your repository, same place as Step 3 (**Settings → Secrets and
variables → Actions → Secrets tab**):

| Name | Value |
|---|---|
| `GH_OAUTH_CLIENT_ID` | the Client ID you copied |
| `GH_OAUTH_CLIENT_SECRET` | the client secret you copied |

---

## Step 5 — Set up your contact form's email

Your contact form sends its messages through your own Gmail account. This step
creates a special "app password" (not your real Gmail password) and uploads one
small file to your web host.

1. Go to **[myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)**
   (you may need 2-Step Verification turned on first — Google will prompt you).
2. Create an app password (name it anything, e.g. "Website contact form"), and
   copy the 16-character password it gives you.
3. In your GitHub repository, open **`smtp-config.sample.php`** and copy its
   contents.
4. Using your web host's **File Manager** (in cPanel) or an FTP program, create
   a new file called **`smtp-config.php`** in the same folder as `contact.php`
   (the top level of your site), and paste in the contents from step 3.
5. Edit the values you pasted:
   - `username` → your Gmail address
   - `password` → the 16-character app password from step 2
   - `from` → the same Gmail address
   - `to` → your own email address (a fallback — you'll also set this in the
     CMS in Step 7, which takes priority)
6. Save the file on your host.

This file is intentionally **never** part of your GitHub repository (it's
excluded on purpose, since it holds a real password) — it lives only on your
web host.

---

## Step 6 — Trigger your first deploy

Now that your credentials are in place, make GitHub build and deploy your site:

1. In your repository, go to the **Actions** tab.
2. Click on the most recent workflow run (it likely shows a red ✕ from before
   your credentials were set) → click **Re-run all jobs** in the top right.
3. Wait a minute or two. A green checkmark means your site has been built and
   uploaded to your host.

If it's your first time pointing this domain at your host, you may also need to
update your domain's DNS/nameservers to your host — your hosting provider's
support docs will walk you through that; it's outside what GitHub controls.

Visit your domain — your new site should be live.

---

## Step 7 — Start editing your site

Go to **`yourdomain.com/admin/`** and click **Sign in** → **Sign in with GitHub**.
Approve the popup. You're in.

The dashboard has four page cards (**Home**, **About**, **Contact**, **Design**)
and a **Case studies** section with two sample projects to start from.

- **Editing text or images:** open a page, click **Edit** (top right), then click
  directly on any heading, paragraph, or photo to change it. Click **Save** when
  you're done — it deploys automatically in a couple of minutes.
- **Case studies:** click into "Sample Case Study One/Two," turn on Edit, and
  replace the placeholder text and images with your own work. Use **+ New case
  study** on the dashboard to add more, or delete a sample one entirely.
- **Design panel:** click the **Design** card to set your **name or upload a
  logo** (shown top-left on every page), pick fonts, adjust text sizes and
  letter-spacing for each of the four text styles (Display, Heading, Body,
  Caption), and set your site's colors. A small tick mark on each slider shows
  its default — click **Reset** on any style to go back to it.
- **Contact form:** open the **Contact** page, turn on Edit, and you'll find:
  - **Notification email** — where messages actually get sent (this overrides
    the fallback you set in `smtp-config.php`).
  - **Email subject line** — customize the subject of messages you receive.
  - **Form fields** — your form starts with Name, Email, Organization, Project,
    and Other Notes. For each field you can rename its label, change its type
    (short text / email / long text / dropdown), mark it required, reorder it,
    or delete it. Dropdown fields let you edit their list of options directly
    underneath. You can also add brand-new fields with **+ Add field**. The
    **Email** field can't be deleted or changed to a different type — the form
    needs exactly one email field to know who to reply to — but you can still
    rename its label.

Every Save is one commit to your repository and triggers an automatic rebuild —
check the **Actions** tab if you want to watch it happen.

---

## Troubleshooting

- **A deploy fails in the Actions tab:** click into the failed run to see which
  step failed. Most often it's a typo in one of the Secrets/Variables from Steps
  3–4 — double check the exact values against your host.
- **"Sign in with GitHub" doesn't work:** double-check the Homepage URL and
  Authorization callback URL in your OAuth App (Step 4) exactly match your real
  domain, including `https://`.
- **Contact form messages aren't arriving:** confirm `smtp-config.php` was
  uploaded to your host (it's never in GitHub, so a fresh deploy can't create
  it for you), and that the Gmail app password was copied correctly.
- **You changed your mind about a Design setting:** every style, color, and the
  Site Identity name/logo can be reset independently — nothing is permanent
  until you click Save.
