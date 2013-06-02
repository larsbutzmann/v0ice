Template.navi.events({
  'click #btn-record': function(){
    Meteor.Router.to(Meteor.Router.recordPath());
  },
  'click #btn-list': function(){
    Meteor.Router.to(Meteor.Router.listPath());
  },
});

Template.hear.events({
  'click .hear-content': function(){
    Meteor.Router.to(Meteor.Router.listPath());
  },
});

Meteor.Router.add({
  '/': 'home',
  '/list': 'list',
  '/record': 'record'
});

$('#recording-btn').popover({
  trigger: 'hover',
  placement: 'left',
  content: "Don't hesitate to give us your voice. Your feedback is heard!"
});

Template.body.helpers({
  layoutName: function() {
    switch (Meteor.Router.page()) {
      case 'home':
        return 'home';
      case 'list':
        return 'fileIndex';
      case 'record':  
        return 'record';
      default:
        return 'home';
    }
  }
});

