var schedule = require("node-schedule");
//dayOfWeek
//month
//dayOfMonth
//hour
//minute
//second
let timer = {
  job: {},
  run: (option, fun) => {
    timer.job = schedule.scheduleJob(option, fun);
  },
  cancel: () => {
    timer.job.cancel();
  }
};
module.exports = timer;
