# DLanding

DLanding is a static landing page for a collection of self-hosted web services. NGINX serves the page and its assets, and reverse-proxies each service path to its own backend.

## Configure the service links

The service cards are defined in the `SERVICES` array near the top of [`app.js`](./app.js). Each `href` should match a path in your NGINX configuration. For example, `/xng/` maps to the SearXNG backend in the sample below.

```js
{ id: "xng", name: "Search Engine", hint: "SearXNG instance", icon: "1F50D", href: "/search/" },
```

Add or remove entries in `SERVICES` to match the services you run. The card links and NGINX locations must agree.

## Serve the static page

Copy the site files to a directory readable by NGINX. Keep the assets alongside `index.html`; the page loads `app.js`, `styles.css`, `fonts/`, and `icons/` using paths relative to the site root.

For example, from the project directory on a Linux host:

```sh
sudo install -d /var/www/dlanding
sudo cp -a index.html app.js styles.css fonts icons /var/www/dlanding/
```

## NGINX reverse-proxy example

This example assumes NGINX and the service backends run on the same host. Replace the example hostname, certificate paths, and ports with your own. Keep the backends bound to localhost or a private network so clients reach them through NGINX rather than directly.

The `map` directive belongs in NGINX's `http {}` context (for example, in `/etc/nginx/nginx.conf`), not inside a `server` block. It supports services that use WebSockets.

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}
```

Add a site configuration in NGINX's `http {}` context:

```nginx
upstream search_backend {
    server 127.0.0.1:8080;
}

upstream kutt_backend {
    server 127.0.0.1:3000;
}

upstream copyparty_backend {
    server 127.0.0.1:3923;
}

upstream invidious_backend {
    server 127.0.0.1:3001;
}

upstream picsur_backend {
    server 127.0.0.1:8081;
}

upstream privatebin_backend {
    server 127.0.0.1:8082;
}

upstream gitea_backend {
    server 127.0.0.1:3002;
}

server {
    listen 80;
    server_name home.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name home.example.com;

    ssl_certificate     /etc/letsencrypt/live/home.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/home.example.com/privkey.pem;

    root /var/www/dlanding;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    location /search/ {
        proxy_pass http://search_backend/;
        include proxy_params;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
    }

    location /kutt/ {
        proxy_pass http://kutt_backend/;
        include proxy_params;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
    }

    location /copyparty/ {
        client_max_body_size 1g;
        proxy_pass http://copyparty_backend/;
        include proxy_params;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
    }

    location /invidious/ {
        proxy_pass http://invidious_backend/;
        include proxy_params;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
    }

    location /picsur/ {
        client_max_body_size 20m;
        proxy_pass http://picsur_backend/;
        include proxy_params;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
    }

    location /bin/ {
        client_max_body_size 10m;
        proxy_pass http://privatebin_backend/;
        include proxy_params;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
    }

    location /git/ {
        client_max_body_size 100m;
        proxy_pass http://gitea_backend/;
        include proxy_params;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
    }
}
```

The ports and upload limits above are examples, not defaults required by this project. Set each upstream to the address and port of your service. Adjust upload limits for your use case.

### Configure services for a URL prefix

In the example, each `proxy_pass` ends in `/`. With a matching location such as `/kutt/`, NGINX removes that prefix before forwarding the request: `/kutt/login` reaches the backend as `/login`. Configure each service to generate links and redirects that work under its public prefix (such as `/kutt/`). The setting is service-specific.

If a service cannot run under a path prefix, give it a subdomain instead (for example, `kutt.home.example.com`), configure a separate NGINX `server` block for it, and update that card's `href` in `app.js` to the full HTTPS URL. Do not assume that changing `proxy_pass` alone makes an application prefix-aware.

`include proxy_params;` is provided by many Linux NGINX packages. If it is not present on your system, replace it with appropriate forwarding headers, such as:

```nginx
proxy_set_header Host              $host;
proxy_set_header X-Real-IP         $remote_addr;
proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

## Enable and verify

1. Point `home.example.com` to the host running NGINX and obtain a TLS certificate for it. The HTTP server block above redirects visitors to HTTPS.
2. Check the configuration and reload NGINX:

   ```sh
   sudo nginx -t
   sudo systemctl reload nginx
   ```

3. Open `https://home.example.com/`. Confirm that the page, fonts, and icons load, then test each card and its service. If a service fails under its prefix, check both its base-URL configuration and the corresponding NGINX location.

## License

Under **MIT** - see `LICENSE`.

*All emojis designed by **OpenMoji** – the open-source emoji and icon project. License: **CC BY-SA 4.0***