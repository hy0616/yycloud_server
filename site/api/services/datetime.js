var moment = require('moment');

var datetime = module.exports;

datetime.getLocalTimeStamp = function () {
  var date = new Date();
  return date.getTime();
}

datetime.getLocalString = function (displayFormat) {
  var date = new Date();

  if (undefined === displayFormat) {
    return moment(date.getTime()).format('YYYY-MM-DD HH:mm:ss');

  } else {
    return moment(date.getTime()).format(displayFormat);
  }
}

datetime.getLocalDateString = function () {
  var date = new Date();
  return moment(date.getTime()).format('YYYY-MM-DD');
}

datetime.getUTCTimeStamp = function () {
  var date = new Date();
  return date.getTime() + date.getTimezoneOffset() * 60 * 1000;
}

datetime.getUTCString = function (displayFromat) {
  var date = new Date();
  if (undefined === displayFromat) {
    return moment.utc(date.getTime()).format('YYYY-MM-DD HH:mm:ss');
  } else {
    return moment.utc(date.getTime()).format(displayFromat);
  }
}

datetime.changeTimezone = function (date, tzo, tzn) {
  tzo = tzo * 60;
  tzn = tzn ? tzn * 60 : -date.getTimezoneOffset();
  date.setTime(date.getTime() - (tzo - tzn) * 60 * 1000);
  return date;
}

datetime.getCurrentYear = function () {
  return moment().get('year');
}

datetime.getCUrrentWeek = function () {
  return moment().get('week');
}

datetime.getUTCTimeFromTimeStamp = function (timeStamp) {
  var date = new Date();
  return new Date(timeStamp - date.getTimezoneOffset() * 60 * 1000);
  //return moment(timeStamp - date.getTimezoneOffset() * 60 * 1000);
  //return moment.utc(timeStamp);
}










