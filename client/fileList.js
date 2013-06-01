Files = new Meteor.Collection("files");

Template.fileIndex.files = function () {
  	f = Files.find({}, {limit: 10});
    return f;
};
