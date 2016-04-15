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

/**
* Azure Storage Queue Sample in Node.JS 
* This samples demonstrates how to use the Queue Storage service.
* Queue storage provides a reliable messaging solution for asynchronous communication
* Queues can be accessed from anywhere in the world via HTTP or HTTPS.
*
* Documentation References: 
* - What is a Storage Account - http://azure.microsoft.com/en-us/documentation/articles/storage-whatis-account/
* - Getting Started with Queues - https://azure.microsoft.com/en-us/documentation/articles/storage-nodejs-how-to-use-queues
* - Queue Service Concepts - https://msdn.microsoft.com/en-us/library/azure/dd179353.aspx
* - Queue Service REST API - https://msdn.microsoft.com/en-us/library/azure/dd179363.aspx
* - Queue Service Node API - http://azure.github.io/azure-storage-node/QueueService.html
* - Delegating Access with Shared Access Signatures - http://azure.microsoft.com/en-us/documentation/articles/storage-dotnet-shared-access-signature-part-1/
* - Storage Emulator - https://azure.microsoft.com/en-us/documentation/articles/storage-use-emulator/
*/

var fs = require('fs');
var util = require('util');
var storage = require('azure-storage');
var queueNamePrefix = "storagesampleforqueue";
var queueService;

console.log('Azure Storage Queue Samples in Node.JS');

RunQueueSamples();

function RunQueueSamples() {
  /**
   * Instructions: This sample can be run using either the Azure Storage Emulator (https://go.microsoft.com/fwlink/?linkid=717179&clcid=0x409)
   * or by updating the app.config file with your account name and key.
   *
   * To run the sample using the Storage Emulator (default option, on Windows only)
   *      Start the Azure Storage Emulator (once only) by pressing the Start button or the Windows key and searching for it
   *      by typing "Azure Storage Emulator". Select it from the list of applications to start it.
   * 
   * To run the sample using the Storage Service
   *      Open the app.config file and comment out the setting for the emulator ("useDevelopmentStorage":true), 
   *      uncomment the "accountName" and "accountKey" for the storage service and set the account credential.
   */
  var config = GetConfigSettings();

  // Create a queue service client for interacting with the Queue service from account name and account key or the connection string.
  // You can either connect to an Azure storage account with account name and account key specified OR use the storage emulator for development.
  // How to create a storage connection string - http://msdn.microsoft.com/en-us/library/azure/ee758697.aspx
  if (config.connectionString) {
    queueService = storage.createQueueService(config.connectionString);
  } else {
    queueService = storage.createQueueService(config.accountName, config.accountKey);
  }

  var current = 0;
  var scenarios = [
    {
      scenario: QueueOperations,
      message: 'Basic Operations on Queue Completed\n'
    }, 
    {
      scenario: QueueMessageOperations,
      message: 'Basic Operations on Queue Messages Completed\n'
    }, 
    {
      scenario: QueueDeleteOperation,
      message: 'Delete Queue Operation Completed\n'
    }];
  
  var callback = function (error) {
    if (error) {
      if (error.code === "ECONNREFUSED") {
        console.log("Connection refused. Please check if the connection parameters are correct. If you are using the Emulator, please make sure it is running");
      } else {
        throw error;
      }
    } else {
      console.log(scenarios[current].message); 
      
      current++;
      if (current < scenarios.length) {
        scenarios[current].scenario(callback);
      }
    }
  };
   
  scenarios[current].scenario(callback);
}

// Read configuration file to retrieve credentials such as account name and account key
function GetConfigSettings() {
  var config = JSON.parse(fs.readFileSync('app.config', 'utf8'));
  
  if (config.useDevelopmentStorage) {
    // use the Storage Emulator if this option is specified
    // note that the Storage Emulator must be running for the sample to succeed
    config.connectionString = storage.generateDevelopmentStorageCredentials();
  }
  
  return config;
}

function QueueOperations(callback) {
  var id = 1;
  
  // define an array to return the list of queues
  var queues = [];
  
  // Create several queues.
  // Use createQueueIfNotExists to create a queue only if it does not already exist.
  var queueName = queueNamePrefix + (id++); 
  queueService.createQueueIfNotExists(queueName, function (error, result, response) {
    if (error) {
      callback(error);
    } else {
      console.log('QueueOperations: Queue ' + queueName + ' successfully created');
      
      queueName = queueNamePrefix + (id++);
      queueService.createQueueIfNotExists(queueName, function (error, result, response) {
        if (error) {
          callback(error);
        } else {
          console.log('QueueOperations: Queue ' + queueName + ' successfully created');
          
          queueName = queueNamePrefix + (id++);
          queueService.createQueueIfNotExists(queueName, function (error, result, response) {
            if (error) {
              callback(error);
            } else {
              console.log('QueueOperations: Queue ' + queueName + ' successfully created');
              
              // List all queues for a storage account.
              // Specify null for the continuationToken and options. For more on this, please check https://msdn.microsoft.com/en-us/library/azure/dd179363.aspx
              var continuationToken = null;
              var option = { maxResults: 2, include: 'metadata' };
              listQueues(queueService, queueNamePrefix, continuationToken, option, function (error, result) {
                for (var i = 0; i < result.length; i++) {
                  console.log(util.format('QueueOperations: Retrieved - %s'), result[i].name);
                }
                queueService.deleteQueue(queueName, function (error) {
                  callback(error);
                })
              });
            }
          });
        }
      });
    }
  });
  
  function listQueues(queueService, prefix, token, options, callback) {
    // return results by page and recursively invoke
    queueService.listQueuesSegmentedWithPrefix(prefix, token, options, function (error, result) {
      queues.push.apply(queues, result.entries);
      token = result.continuationToken;

      if (token) {
        console.log('QueueOperations:    Received a page of results. There are ' + result.entries.length + ' queues on this page.');
        listQueues(queueService, prefix, token, options, callback);
      } else {
        console.log('QueueOperations:    Completed listing. There are ' + queues.length + ' queues.');
        callback(null, queues);
      }
    });
  }
}

function QueueMessageOperations(callback) {
  var queueName = queueNamePrefix + "myqueueformessages";
  var message = "Hello world";
  var nextMessage = 'Hello world again';

  // Create a queue. 
  // Use createQueueIfNotExists to create a queue only if it does not already exist. 
  queueService.createQueueIfNotExists(queueName, function (error) {
    if (error) {
      callback(error);
    } else {
      console.log('QueueMessageOperations: Queue "' + queueName + '" successfully created');
        
      // Add a message to a queue.
      queueService.createMessage(queueName, message, function (error, result, response) {
        if (error) {
          callback(error);
        } else {
          console.log('QueueMessageOperations: Message "' + message + '" was added to queue successfully');
          
          queueService.createMessage(queueName, nextMessage, function (error, result, response) {
            if (error) {
              callback(error);
            } else {
              console.log('QueueMessageOperations: Message "' + nextMessage + '" was added to queue successfully');
              
              // Dequeue the next message. First retrieve the message, this makes the message invisible...
              // By default, a single message is retrieved from the queue with this operation.
              // Please refer to http://azure.github.io/azure-storage-node/QueueService.html#getMessages for more options.
              queueService.getMessages(queueName, function (error, messages) {
                // The messages will be invisible for further dequeueing for 30 seconds (by default)
                // The message text is available in messages[0].messagetext
                console.log('QueueMessageOperations: Message "' + messages[0].messageText + '" has been dequeued');
                
                // then delete it
                queueService.deleteMessage(queueName, messages[0].messageId, messages[0].popReceipt, function (error) {
                  if (error) {
                    callback(error);
                  }
                  console.log('QueueMessageOperations: Message "%s" deleted successfully', messages[0].messageId);
                  
                  // Find the next message in a queue, without changing the message visibility.
                  queueService.peekMessages(queueName, function (error, result) {
                    if (error) {
                      callback(error);
                    } else {
                      console.log('QueueMessageOperations: The next message in the queue is "%s"', result[0].messageText);
                      
                      // Change contents of a message, first retrieve...
                      // Retrieve a message from the front of the queue and make it invisible to other consumers.
                      // Please note the difference with queueService.getMessages that the return is a message instead of a message array.
                      queueService.getMessage(queueName, function (error, result, response) {
                        if (error) {
                          callback(error);
                        } else {
                          // then update the contents and set the new visibility timeout
                          var message = result;
                          queueService.updateMessage(queueName, message.messageId, message.popReceipt, 10, { messageText: 'new text' }, function (error, result, response) {
                            if (error) {
                              callback(error);
                            } else {
                              console.log("QueueMessageOperations: Contents of message changed");
                              queueService.deleteQueue(queueName, function(){
                                callback(error);
                              });
                            }
                          });
                        }
                      });
                    }
                  });
                });
              });
            }
          });
        }
      });
    }
  });
}

function QueueDeleteOperation(callback) {
  var queueName = queueNamePrefix + "myqueuedelete";

  ///Create a queue.
  ///Use  createQueueIfNotExists to create a queue only if it does not already exist. 
  queueService.createQueueIfNotExists(queueName, function (error, result, response) {
    if (error) {
      callback(error);
    } else {
      console.log('QueueDeleteOperation: Queue ' + queueName + ' successfully created');
            
      //delete queue
      queueService.deleteQueueIfExists(queueName, function (error, result) {
        if (!error) {
          console.log('QueueDeleteOperation: Queue ' + queueName + ' successfully deleted');
        }
        callback(error);
      });
    }
  });
}