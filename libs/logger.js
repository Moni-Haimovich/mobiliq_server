const fs = require('fs');
const chalk = require('chalk');

const getReqDurationInMilliseconds = (start) => {
  const NS_PER_SEC = 1e9; // convert to nanoseconds
  const NS_TO_MS = 1e6; // convert to milliseconds
  const diff = process.hrtime(start);
  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};

const logger = (req, res, next) => {
  const { method, url } = req;
  const { statusCode: status } = res;

  const curDate = new Date();
  const reqDateTime = `${curDate.getFullYear()}-${
    curDate.getMonth() + 1
  }-${curDate.getDate()} ${curDate.getHours()}:${curDate.getMinutes()}:${curDate.getSeconds()}`;

  const start = process.hrtime();
  const durationInMilliseconds = getReqDurationInMilliseconds(start);

  let log = `[${chalk.blue(reqDateTime)}] ${method}:${url} ${status} ${chalk.red(
    durationInMilliseconds.toLocaleString() + 'ms'
  )}`;
  console.log(log);

  fs.appendFile('logs.txt', log + '\n', (err) => err && console.log(err));

  next();
};

module.exports = { logger };
