var SlackAPI = require('slackbotapi');

var slack = new SlackAPI({
	'token': 'YOUR_TOKEN_HERE',
	'logging': false,
	'autoReconnect': true
});

function requestFiles(callback) {
	slack.reqAPI('files.list', {}, function(response) {
		callback(response.files);
	});
}

function deleteFile(fileID, callback) {
	slack.reqAPI('files.delete', {file: fileID}, function(response) {
		callback();
	});
}

function deleteFiles() {
	requestFiles(function(files) {
		
		//If there are no files to delete, terminate.
		if(files.length == 0) {
			console.log('No more files could be found, terminating program.');
			process.exit();
		} else {
			console.log('Found ' + files.length + ' files to delete. Deleting...');
		}

		var index = 0;

		var deleteNextFile = function(fileID) {
			deleteFile(fileID, function() {
				console.log('Deleted file: ' + fileID);

				//If there are more files remaining then run this function again, otherwise fetch more.
				if(index < files.length - 1) {
					deleteNextFile(files[index++].id);
				} else {
					console.log('Finished deleting files. Fetching more...');
					deleteFiles();
				}
			});
		};

		deleteNextFile(files[index++].id);
	});
}

//Wait until the connection is established with slack.
slack.on('hello', function(data) {
	deleteFiles();
});