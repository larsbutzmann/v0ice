Template.mic.rendered = function () {
  $('#record-btn').click(function () {
    $(this).toggleClass("record-started");
  });
};


Template.mic.events({
  'click #record-btn' : function () {
    // template data, if any, is available in 'this'
    console.log("record started");
    
    
  }
});