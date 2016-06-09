//----------------------------------------------------------------------------------
// Microsoft Developer & Platform Evangelism
//
// Copyright (c) Microsoft Corporation. All rights reserved.
//
// THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, 
// EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES 
// OF MERCHANTABILITY AND/OR FITNESS FOR A PARTICULAR PURPOSE.
//----------------------------------------------------------------------------------
// The example companies, organizations, products, domain names,
// e-mail addresses, logos, people, places, and events depicted
// herein are fictitious.  No association with any real company,
// organization, product, domain name, email address, logo, person,
// places, or events is intended or should be inferred.
//----------------------------------------------------------------------------------

var fs = require('fs');
var util = require('util');
var config = require('./config.js');
var storage = require('azure-storage');
var queueNamePrefix = "storagesampleforqueue";
var queueService;

function basicSamples() {

  // Create a queue service client for interacting with the Queue service from account name and account key or the connection string.
  // You can either connect to an Azure storage account with account name and account key specified OR use the storage emulator for development.
  // How to create a storage connection string - http://msdn.microsoft.com/en-us/library/azure/ee758697.aspx
  if (config.connectionString) {
    queueService = storage.createQueueService(config.connectionString);
  } else {
    queueService = storage.createQueueService(config.accountName, config.accountKey);
  }

  return scenarios = [
    {
      action: queueOperations,
      message: 'Basic Operations on Queue\n'
    },
    {
      action: queueMessageOperations,
      message: 'Basic Operations on Queue Messages\n'
    },
    {
      action: deleteQueue,
      message: 'Delete Queue\n'
    }];
}


function queueOperations(callback) {
  var id = 1;

  // define an array to return the list of queues
  var queues = [];

  // Create several queues.
  // Use createQueueIfNotExists to create a queue only if it does not already exist.
  var queueNameA = queueNamePrefix + (id++);
  queueService.createQueueIfNotExists(queueNameA, function (error, result, response) {
    if (error) return callback(error);

    console.log('QueueOperations: Queue ' + queueNameA + ' successfully created');

    var queueNameB = queueNamePrefix + (id++);
    queueService.createQueueIfNotExists(queueNameB, function (error, result, response) {
      if (error) return callback(error);

      console.log('QueueOperations: Queue ' + queueNameB + ' successfully created');

      queueNameC = queueNamePrefix + (id++);
      queueService.createQueueIfNotExists(queueNameC, function (error, result, response) {
        if (error) return callback(error);

        console.log('QueueOperations: Queue ' + queueNameC + ' successfully created');

        // List all queues for a storage account.
        // Specify null for the continuationToken and options. For more on this, please check https://msdn.microsoft.com/en-us/library/azure/dd179363.aspx
        var continuationToken = null;
        var option = { maxResults: 2, include: 'metadata' };
        listQueues(queueService, queueNamePrefix, continuationToken, option, function (error, result) {
          if (error) callback(error);

          result.forEach(function (queue, index) {
            console.log(util.format('QueueOperations: Retrieved - %s'), queue.name);
          })

          queueService.deleteQueue(queueNameA, function (error) {
            if (error) callback(error);

            console.log('QueueOperations: Queue ' + queueNameA + ' successfully deleted');

            queueService.deleteQueue(queueNameB, function (error) {
              if (error) callback(error);

              console.log('QueueOperations: Queue ' + queueNameB + ' successfully deleted');
              queueService.deleteQueue(queueNameC, function (error) {

                if (!error)
                  console.log('QueueOperations: Queue ' + queueNameC + ' successfully deleted');

                callback(error);
              })
            })
          })
        });
      });
    });
  });

  function listQueues(queueService, prefix, token, options, callback) {
    // return results by segment and recursively invoke
    queueService.listQueuesSegmentedWithPrefix(prefix, token, options, function (error, result) {
      if (error) return callback(error);

      queues.push.apply(queues, result.entries);
      token = result.continuationToken;

      if (token) {
        console.log('QueueOperations:    Received a segment of results. There are ' + result.entries.length + ' queues on this page.');
        listQueues(queueService, prefix, token, options, callback);
      } else {
        console.log('QueueOperations:    Completed listing. There are ' + queues.length + ' queues.');
        callback(null, queues);
      }
    });
  }
}

function queueMessageOperations(callback) {
  var queueName = queueNamePrefix + "myqueueformessages";
  var message = "Hello world";
  var nextMessage = 'Hello world again';

  // Create a queue. 
  // Use createQueueIfNotExists to create a queue only if it does not already exist. 
  queueService.createQueueIfNotExists(queueName, function (error) {
    if (error) return callback(error);

    console.log('QueueMessageOperations: Queue "' + queueName + '" successfully created');

    // Add a message to a queue.
    queueService.createMessage(queueName, message, function (error, result, response) {
      if (error) return callback(error);

      console.log('QueueMessageOperations: Message "' + message + '" was added to queue successfully');

      queueService.createMessage(queueName, nextMessage, function (error, result, response) {
        if (error) return callback(error);

        console.log('QueueMessageOperations: Message "' + nextMessage + '" was added to queue successfully');

        // Dequeue the next message. First retrieve the message, this makes the message invisible...
        // By default, a single message is retrieved from the queue with this operation.
        // Please refer to http://azure.github.io/azure-storage-node/QueueService.html#getMessages for more options.
        queueService.getMessages(queueName, function (error, messages) {

          if (error) return callback(error);

          // The messages will be invisible for further dequeueing for 30 seconds (by default)
          // The message text is available in messages[0].messagetext
          console.log('QueueMessageOperations: Message "' + messages[0].messageText + '" has been dequeued');

          // then delete it
          queueService.deleteMessage(queueName, messages[0].messageId, messages[0].popReceipt, function (error) {
            if (error) return callback(error);

            console.log('QueueMessageOperations: Message "%s" deleted successfully', messages[0].messageId);

            // Find the next message in a queue, without changing the message visibility.
            queueService.peekMessages(queueName, function (error, result) {
              if (error) return callback(error);

              console.log('QueueMessageOperations: The next message in the queue is "%s"', result[0].messageText);

              // Change contents of a message, first retrieve...
              // Retrieve a message from the front of the queue and make it invisible to other consumers.
              // Please note that the difference with queueService.getMessages that the return is a message instead of a message array.
              queueService.getMessage(queueName, function (error, result, response) {
                if (error) return callback(error);

                // then update the contents and set the new visibility timeout
                var message = result;
                queueService.updateMessage(queueName, message.messageId, message.popReceipt, 10, { messageText: 'new text' }, function (error, result, response) {
                  if (error) {
                    callback(error);
                  } else {
                    console.log("QueueMessageOperations: Contents of message changed \n");
                    queueService.deleteQueue(queueName, function () {
                      callback(error);
                    });
                  }
                });
              });
            });
          });
        });
      });
    });
  });
}

function deleteQueue(callback) {
  var queueName = queueNamePrefix + "myqueuedelete";

  ///Create a queue.
  ///Use  createQueueIfNotExists to create a queue only if it does not already exist. 
  queueService.createQueueIfNotExists(queueName, function (error, result, response) {
    if (error) return callback(error);

    console.log('QueueDeleteOperation: Queue ' + queueName + ' successfully created');

    //delete queue
    queueService.deleteQueueIfExists(queueName, function (error, result) {
      if (!error) {
        console.log('QueueDeleteOperation: Queue ' + queueName + ' successfully deleted');
      }
      callback(error);
    });
  });
}

module.exports = basicSamples();