# SSL Setup for ClearSky Homepage (Certbot)

Use this guide to serve the ClearSky homepage over HTTPS with a Let's Encrypt certificate via certbot.

## Prerequisites

- The domain for the site must point to this server (A record).
- Ports 80 and 443 open (for HTTP and HTTPS).
- ClearSky homepage app running on port 5173 (e.g. via PM2).

## 1. Install Nginx and Certbot

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx -y
```

**CentOS/RHEL:**

```bash
sudo dnf install nginx python3-certbot-nginx -y
# or: sudo yum install nginx python3-certbot-nginx -y
```

## 2. Configure Nginx (before SSL)

From the project root (e.g. `/root/clearsky-homepage`):

1. **Set your real domain** in the config:

   ```bash
   sed -i 's/your-domain.com/YOUR_ACTUAL_DOMAIN/g' nginx-clearsky-homepage.conf
   # Example: sed -i 's/your-domain.com/clearsky.example.com/g' nginx-clearsky-homepage.conf
   ```

2. **Install the config:**

   **Ubuntu/Debian:**

   ```bash
   sudo cp nginx-clearsky-homepage.conf /etc/nginx/sites-available/clearsky-homepage
   sudo ln -sf /etc/nginx/sites-available/clearsky-homepage /etc/nginx/sites-enabled/
   ```

   **CentOS/RHEL:**

   ```bash
   sudo cp nginx-clearsky-homepage.conf /etc/nginx/conf.d/clearsky-homepage.conf
   ```

3. **Test and reload Nginx:**

   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```

## 3. Obtain SSL Certificate with Certbot

**Option A – Helper script (from project root):**

```bash
sudo ./scripts/setup-ssl.sh
```

Or with explicit args: `sudo ./scripts/setup-ssl.sh clearskysoftware.net www.clearskysoftware.net`

**Option B – Manual certbot:**

```bash
sudo certbot --nginx -d clearskysoftware.net -d www.clearskysoftware.net
```

Certbot will:

- Request a certificate from Let's Encrypt
- Update your Nginx config to use HTTPS and redirect HTTP → HTTPS
- Set up automatic renewal

Follow the prompts (email, terms, redirect choice). Choose **redirect** so HTTP is redirected to HTTPS.

## 4. Verify

- Visit `https://clearskysoftware.net` — the site should load with a valid padlock.
- Check renewal: `sudo certbot renew --dry-run`

## 5. Firewall (if applicable)

```bash
sudo ufw allow 'Nginx Full'
sudo ufw reload
# or: sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw reload
```

## Troubleshooting

- **502 Bad Gateway:** Ensure the app is running: `pm2 status clearsky-homepage` and that it listens on port 5173.
- **Certbot fails:** Ensure Nginx is running and the domain resolves to this server; port 80 must be reachable from the internet.
- **Nginx logs:** `sudo tail -f /var/log/nginx/error.log`

## Auto-renewal

Certbot installs a systemd timer or cron job. Confirm with:

```bash
sudo systemctl list-timers | grep certbot
# or
sudo certbot renew --dry-run
```
