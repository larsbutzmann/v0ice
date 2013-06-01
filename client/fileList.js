Files = new Meteor.Collection("files");

Template.fileIndex.files = function () {
	var file = [];
  	f = Files.find({}, {limit: 10});
  	f.forEach(function(el) {
  		el.time = timestampToDate(el.timestamp);
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
