Meteor.startup(function () {
    console.log("Server started.");
});


// Lists -- {name: String}
Files = new Meteor.Collection("files");

// Publish complete set of lists to all clients.
Meteor.publish('files', function () {
    return Files.find();
});


// Topics = new Meteor.Collection("topics");

// // Publish all items for requested list_id.
// Meteor.publish('topics', function (topic_id) {
//   return Topics.find({topic_id: topic_id});
// });

Meteor.methods({
    'addFile':function(doc) {
        currentId = Files.findOne({},{sort:{id:-1}}).id || 1;
        doc.id = currentId + 1;
        Files.insert(doc);
        return doc.id;
    }
});
