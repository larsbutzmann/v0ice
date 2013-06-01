Files = new Meteor.Collection("files");

Template.files.files = function () {
  return Files.find({}, {limit: 5, sort: {name: 1}});
};

Meteor.Router.add({
  '/': 'landingPage'
});

Template.body.helpers({
  layoutName: function() {
    switch (Meteor.Router.page()) {
      case 'landingPage':
        return 'landing';
      default:
        return 'landing';
    }
  }
});

