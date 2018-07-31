module.exports = {
  apps: [
    {
      name: "trump-said-wtf-web",
      script: "npm -- start",
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
      }
    }
  ],

  deploy: {
    production: {
      user: "web",
      host: "10.142.0.5",
      key: "~/.ssh/google_compute_engine",
      ref: "origin/master",
      repo: "https://github.com/trumpsaid-wtf/web-app.git",
      path: "/var/www/trumpsaid.wtf",
      cwd: "/var/www/trumpsaid.wtf/source/",
      "pre-deploy": "bin/nvm-env.sh",
      "post-deploy":
        "npm install && npm run build-prod && pm2 reload ecosystem.config.js --update-env --env production"
    }
  }
};
