module.exports = {
  apps: [
    {
      name: "wikiback", // Name of your app
      script: "src/server.js", // Entry point of your app
      args: "start",
      cwd: "/var/www/wikiback.horizonduweb.fr", // Absolute path to your app
      watch: true, // Restart app on file changes (useful for development)
      env: {
        NODE_ENV: "production", // Environment mode
        DB_USER: "wikipoisson_user", // Database username
        DB_PASSWORD: "Df082365!", // Database password (consider using environment variables)
        DB_NAME: "wikipoisson", // Database name
        JWT_SECRET: "votremotsecret", // JWT secret key
        PORT: 3013, // Port your app will run on
        CLOUDINARY_CLOUD_NAME: "dfmbhkfao", // Cloudinary cloud name
        CLOUDINARY_API_KEY: "148282553687442", // Cloudinary API key
        CLOUDINARY_API_SECRET: "bzm64S_3FrVrYEg2PIoKM9uLRMM", // Cloudinary API secret
      },
    },
  ],
};
