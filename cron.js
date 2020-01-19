var sh = require('shelljs');
var CronJob = require('cron').CronJob;
console.log('debut instanciation');
const job = new CronJob('0 * * * * ', function() {
  sh.exec('casperjs ./index.js');
});
console.log('fin instanciation');
job.start();
