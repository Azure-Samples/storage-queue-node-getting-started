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

function advancedSamples() {

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
      action: corsRules,
      message: 'Queue CORS Sample\n'
    },
    {
      action: serviceProperties,
      message: 'Queue Service Properties Sample\n'
    },
    {
      action: queueMetadata,
      message: 'Queue Metadata Sample\n'
    },
    {
      action: queueAcl,
      message: 'Queue Access Policy Sample\n'
    }
    ];
}

// Get Cors properties, change them and revert back to original
function corsRules(callback) {

  console.log('Get service properties');
  queueService.getServiceProperties(function (error, properties) {
    if (error) return callback(error);

    console.log('Set Cors rules in the service properties');

    // Keeps the original Cors rules
    var originalCors = properties.Cors;

    properties.Cors = {
      CorsRule: [{
        AllowedOrigins: ['*'],
        AllowedMethods: ['POST', 'GET', 'HEAD', 'PUT'],
        AllowedHeaders: ['*'],
        ExposedHeaders: ['*'],
        MaxAgeInSeconds: 3600
      }]
    };

    queueService.setServiceProperties(properties, function (error) {
      if (error) return callback(error);

      console.log('Cors rules set successfuly');

      // reverts the cors rules back to the original ones so they do not get corrupted by the ones set in this sample
      properties.Cors = originalCors;

      queueService.setServiceProperties(properties, function (error) {
        return callback(error);
      });

    });
  });
}


// Manage logging and metrics service properties
function serviceProperties(callback) {
  // Create a blob client for interacting with the blob service from connection string
  // How to create a storage connection string - http://msdn.microsoft.com/en-us/library/azure/ee758697.aspx
  var blobService = storage.createBlobService(config.connectionString);

  console.log('Get service properties');
  blobService.getServiceProperties(function (error, properties) {
    if (error) return callback(error);

    var originalProperties = properties;

    properties = serviceProperties = {
      Logging: {
        Version: '1.0',
        Delete: true,
        Read: true,
        Write: true,
        RetentionPolicy: {
          Enabled: true,
          Days: 10,
        },
      },
      HourMetrics: {
        Version: '1.0',
        Enabled: true,
        IncludeAPIs: true,
        RetentionPolicy: {
          Enabled: true,
          Days: 10,
        },
      },
      MinuteMetrics: {
        Version: '1.0',
        Enabled: true,
        IncludeAPIs: true,
        RetentionPolicy: {
          Enabled: true,
          Days: 10,
        },
      }
    };

    console.log('Set service properties');
    blobService.setServiceProperties(properties, function (error) {
      if (error) return callback(error);

      // reverts the cors rules back to the original ones so they do not get corrupted by the ones set in this sample
      blobService.setServiceProperties(originalProperties, function (error) {
        return callback(error);
      });
    });
  });
}

// Retrieve statistics related to replication for the Queue service
function serviceStats(callback) {
  
  console.log('Get service statistics');
  queueService.getServiceStats(function (error, serviceStats){
    if (error) return callback(error);

    callback(null);
  });

}

// Manage queue user-defined metadata
function queueMetadata(callback) {
  
  var queueName = queueNamePrefix + "myqueueformetadata";
  var metadata = { color: 'blue', foo: 'Bar' };

  console.log('Create queue');
  queueService.createQueueIfNotExists(queueName, function (error) {
    if (error) return callback(error);

    console.log('Set queue metadata');
    queueService.setQueueMetadata(queueName, metadata, function (error) {
      if (error) return callback(error);

      console.log('Get queue metadata');
      queueService.getQueueMetadata(queueName, function (error, queue) {
        if (error) return callback(error);
        
        console.log(' color: ' + queue.metadata.color);
        console.log(' foo: ' + queue.metadata.foo);

        console.log('Delete queue');
        queueService.deleteQueue(queueName, function () {
          callback(error);
        });
      });
    });
  });
}

// Manage access policies of the queue
function queueAcl(callback) {
  var queueName = queueNamePrefix + "myqueueforacl";

  console.log('Create queue');
  queueService.createQueueIfNotExists(queueName, function() {
    
    // Set access policy
    var expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + 10);
    var id = 'sampleIDForQueuePolicy';

    var sharedAccessPolicy = {
      sampleIDForQueuePolicy: {
        Permissions: storage.QueueUtilities.SharedAccessPermissions.PROCESS,
        Expiry: expiryDate
      }
    };

    console.log('Set queue access policy');
    queueService.setQueueAcl(queueName, sharedAccessPolicy, function (error, result, response) {
      if (error) return callback(error);

      // Get access policy
      console.log('Get queue access policy');
      queueService.getQueueAcl(queueName, function(error, result, response) {
        if (error) return callback(error);

        console.log(' Permissions: ' + result.signedIdentifiers.sampleIDForQueuePolicy.Permissions);
        console.log(' Expiry: ' + result.signedIdentifiers.sampleIDForQueuePolicy.Expiry.toISOString());

        console.log('Delete queue');
        queueService.deleteQueue(queueName, function () {
          callback(error);
        });
      });
    });
  });
}

module.exports = advancedSamples();