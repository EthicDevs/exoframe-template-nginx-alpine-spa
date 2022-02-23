# @ethicdevs/exoframe-template-nginx-alpine-spa

NGINX (nginx:alpine-stable) deployment template, configured for Single Page Applications routing, for [exoframe].

## Usage

```bash
# Install the template into exoframe (needs to be installed globally, or use npx exoframe instead)
$ echo "@ethicdevs/exoframe-template-nginx-alpine-spa" | exoframe template
# Change directory to static website to deploy with SPA support (React, Vue, etc)
$ cd ./static_website
# Changes template to this one
$ jq '.template |= "@ethicdevs/exoframe-template-nginx-alpine-spa"' json | tee exoframe.json
# Enjoy :)
$ exoframe deploy --update # (or no --update; as you wish)
```

[exoframe]: https://github.com/exoframejs
