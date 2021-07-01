module.exports = {
  apps: [
    {
      script: __dirname + "/../bin/www",
      instances: "4",
      exec_mode: "cluster",
      name: "development-app",
      merge_logs: true,
      out_file: __dirname + "/../logs/output.log",
      error_file: __dirname + "/../logs/output.log",
      log_date_format: "YYYY-MM-DD HH:mm Z",
      env: {
        NODE_ENV: "development",
        THREAD_COUNT: 4,
        PORT: 3939
      }
    }
  ]
};
