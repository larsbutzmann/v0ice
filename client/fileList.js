Files = new Meteor.Collection("files");

Template.fileIndex.files = function () {
  return Files.find({}, {limit: 5, sort: {name: 1}});
};
