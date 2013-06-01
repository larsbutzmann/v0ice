Template.mic.greeting = function () {
  return "TODO: this needs to be round tripped to match against customer/user";
};

Template.mic.events({
  'click #record-btn' : function () {
    console.log("record started");
    this.recording = true;
    // template data, if any, is available in 'this'
    if (typeof console !== 'undefined')
      console.log("You pressed the button");
  }
});