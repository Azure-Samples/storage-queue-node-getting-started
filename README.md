---
services: storage
platforms: nodejs
author: yaxia
---

# Getting Started with Azure Queue Service in Node.js

The getting started sample demonstrates how to perform common tasks using the Azure Queue Service in Node.js.
The Queue service provides reliable, persistent messaging within and between services. The API for the Queue service exposes two resources: queues and messages. 
Queues support user-defined metadata in the form of name-value pairs specified as headers on a request operation.

If you don't have a Microsoft Azure subscription you can
get a FREE trial account [here](http://go.microsoft.com/fwlink/?LinkId=330212)

## Running this sample

This sample can be run using either the [Azure Storage Emulator](https://azure.microsoft.com/en-us/documentation/articles/storage-use-emulator/) - or by
updating the app.config file with your account name and key.

To run the sample using the Storage Emulator (default option, on Windows only):

1. Download and Install the Azure Storage Emulator [here](https://go.microsoft.com/fwlink/?linkid=717179&clcid=0x409).
2. Start the Azure Storage Emulator (once only) by pressing the Start button or the Windows key and searching for it by typing "Azure Storage Emulator". Select it from the list of applications to start it.
3. Open the app.config file and set the configuration for the emulator ("useDevelopmentStorage":true).
4. Run the sample by: node ./queueSample.js

To run the sample using the Storage Service

1. Open the app.config file and set the connection string for the emulator ("useDevelopmentStorage":false) and set the connection string for the storage service ("connectionString":"...")
2. Create a Storage Account through the Azure Portal
3. Provide your connection string for the storage service ("connectionString":"...") in the app.config file. 
4. Run the sample by: node ./queueSample.js

## More information
- [What is a Storage Account](http://azure.microsoft.com/en-us/documentation/articles/storage-whatis-account/)
- [Getting Started with Queues](https://azure.microsoft.com/en-us/documentation/articles/storage-nodejs-how-to-use-queues/)
- [Queue Service Concepts](https://msdn.microsoft.com/en-us/library/azure/dd179353.aspx)
- [Queue Service REST API](https://msdn.microsoft.com/en-us/library/azure/dd179363.aspx)
- [Queue Service Node API](http://azure.github.io/azure-storage-node/QueueService.html)
- [Delegating Access with Shared Access Signatures](http://azure.microsoft.com/en-us/documentation/articles/storage-dotnet-shared-access-signature-part-1/)
- [Storage Emulator](https://azure.microsoft.com/en-us/documentation/articles/storage-use-emulator/)
