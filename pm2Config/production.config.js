module.exports = {
  apps: [
    {
      script: __dirname + "/../bin/www",
      instances: "16",
      exec_mode: "cluster",
      name: "production-app",
      output: "/dev/null",
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "production",
        THREAD_COUNT: 16,
        PORT: "3306"
      }
    }
  ]
};
