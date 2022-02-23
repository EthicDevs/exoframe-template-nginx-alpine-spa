const fs = require("fs");
const path = require("path");

const nginxConf = `server {
  listen 80 default_server;

  gzip on;
  gzip_min_length 1000;
  gzip_types text/plain text/xml application/javascript text/css;

  root /app;

  # normal routes
  # serve given url and default to index.html if not found
  # e.g. /, /user and /foo/bar will return index.html
  location / {
    add_header Cache-Control "no-store";
    try_files $uri $uri/index.html /index.html;
  }

  # files
  # for all routes matching a dot, check for files and return 404 if not found
  # e.g. /file.js returns a 404 if not found
  location ~ \.(?!html) {
    add_header Cache-Control "public, max-age=2678400";
    try_files $uri =404;
  }
}`;

const nginxDockerfile = `FROM nginx:stable-alpine
COPY . /app
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN chmod -R 755 /app
RUN chmod 755 /etc/nginx/conf.d/default.conf
`;

// template name
exports.name = "@ethicdevs/exoframe-template-nginx-alpine-spa";

// function to check if the template fits this recipe
exports.checkTemplate = async ({ tempDockerDir, folder }) => {
  // if project already has dockerfile - just exit
  try {
    const filesList = fs.readdirSync(path.join(tempDockerDir, folder));
    if (filesList.includes("index.html")) {
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};

// function to execute current template
exports.executeTemplate = async ({
  username,
  tempDockerDir,
  folder,
  resultStream,
  util,
  docker,
  existing,
}) => {
  try {
    // generate nginx.conf
    const ncPath = path.join(tempDockerDir, folder, "nginx.conf");
    fs.writeFileSync(ncPath, nginxConf, "utf-8");

    // generate dockerfile
    const dfPath = path.join(tempDockerDir, folder, "Dockerfile");
    fs.writeFileSync(dfPath, nginxDockerfile, "utf-8");

    // some logs
    util.writeStatus(resultStream, {
      message:
        "Deploying Static HTML project using nginx:stable-alpine configured for SPAs...",
      level: "info",
    });

    // build docker image
    const buildRes = await docker.build({ username, folder, resultStream });
    util.logger.debug("Build result:", buildRes);

    // start image
    const container = await docker.start(
      Object.assign({}, buildRes, { username, folder, existing, resultStream })
    );
    util.logger.debug(container);

    // return new deployments
    util.writeStatus(resultStream, {
      message: "Deployment success!",
      deployments: [container],
      level: "info",
    });
    resultStream.end("");
  } catch (e) {
    util.logger.debug("build failed!", e);
    util.writeStatus(resultStream, {
      message: e.error,
      error: e.error,
      log: e.log,
      level: "error",
    });
    resultStream.end("");
  }
};
