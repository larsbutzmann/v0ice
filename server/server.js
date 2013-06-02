Meteor.startup(function () {
    console.log("Server started.");
	// Meteor.call("removeData");
});

Meteor.methods({
    'removeData': function() {
        Files.remove({});
    }
});

// Lists -- {name: String}
Files = new Meteor.Collection("files");

// Publish complete set of lists to all clients.
Meteor.publish('files', function () {
    return Files.find();
});

Customers = new Meteor.Collection("customers");

Meteor.publish('customers', function () {
    return Customers.find();
});

// Topics = new Meteor.Collection("topics");

// // Publish all items for requested list_id.
// Meteor.publish('topics', function (topic_id) {
//   return Topics.find({topic_id: topic_id});
// });

Meteor.methods({
    addFile: function(doc) {
    	var currentId;

    	console.log(doc);
    	if (Files.findOne({},{sort:{id:-1}}) !== "undefined") {
    		currentId = Files.findOne({},{sort:{id:-1}}).id
    	} else {
    		currentId = 1;
    	}
        doc.id = currentId + 1;
    	console.log(doc);
        Files.insert(doc);
        return doc.id;
    }
});

Meteor.methods({
    getCustomer: function(identification) {
        customer = Customers.findOne({identification: identification}) || 1;
        if (customer !== "undefined") {
        	console.log("customer available");
        	return customer.id;
        } else {
	        currentId = Customers.findOne({},{sort:{id:-1}}).id || 1;
	        var newID = currentId + 1;
        	Customers.insert({
        		id: newID,
        		identification: identification
        	});
        	return newID
        }
    }
});
