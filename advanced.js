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
      action: setCors,
      message: 'Set CORS\n'
    }];
}

// Set Cors Properties (Ese lo podes copiar del blob)
function setCors(callback) {

  console.log('Getting service properties');
  queueService.getServiceProperties(function (error, properties) {
    if (error) return callback(error);

    console.log('Setting Cors rules in the service properties');

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

module.exports = advancedSamples();