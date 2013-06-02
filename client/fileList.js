Files = new Meteor.Collection("files");

Template.fileIndex.files = function () {
  var file = [];
  f = Files.find({}, {limit: 10});
  f.forEach(function(el) {
    el.date = timestampToDate(el.timestamp);
    el.time = timestampToTime(el.timestamp);
    file.push(el);
  })
  return file;
};

function timestampToDate(timestamp) {
    var d = new Date(timestamp);
    var curr_date = d.getDate();
    var curr_month = d.getMonth() + 1; //Months are zero based
    var curr_year = d.getFullYear();
    return curr_month + "/" + curr_date + "/" + curr_year;
}

function timestampToTime(timestamp) {
    var d = new Date(timestamp);
    var curr_hour = d.getHours();
    var curr_minute = zeroFill(d.getMinutes(), 2);
    return curr_hour + ":" + curr_minute;
}

function zeroFill( number, width )
{
  width -= number.toString().length;
  if ( width > 0 )
  {
    return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
  }
  return number + ""; // always return a string
}