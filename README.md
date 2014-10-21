node-packerio
===================
A convenient wrapper module to control Packer.IO

```
 var newImage = new PackerFile()
 
 newImage.shellCmd('sudo apt-get update')
   .shellCmd('sudo apt-get install -y nginx mysql nodejs")
   .uploadFile('/my/app')
   .chefClient('http://chefServer:8012')
   .build()
```

The Basics
----

Packer.IO is a very useful command line application to generate server images across a multitude of services such as Amazon, Heroku, or local applications such as Docker or VirtualBox. It was created by Hashicorp, of which I am not associated with beyond being a fan.  I've created a node wrapper to allow me to programmatically control the tool as part of a larger project, and am sharing the results here.

This is a BETA module. Pull requests, input, stories of the module in use, and constructive criticisms are highly welcome. I'll try to be active in maintaining.

Installation
----------
```
npm install node-packerio
```


Usage
---------
```
var packerCmd = require('node-packerio').packerCmd
var PackerFile = require('node-packerio').PackerFile
```


packerCmd VS PackerFile
------
packerCmd is a command line wrapper for the build command for Packer.io. It also formats the output in a few ways. Currently, there are only a few commands in packer.io that are machine-readable compatible, and only the build command seems to make sense being built. As such, the other commands haven't been built out yet. They are TBD.

PackerFile is a helpful class wrapped around packerCmd - you don't need to bring in packerCmd unless you need to manually control the builder.

In other words, packerCmd allows you to execute commands on a packer file on your system. PackerFile manages that file, or removes the need for the file, as well as allows the execution of builds on that file.



Packer.io Documentation
----
I will not attempt to explain every nook and cranny of required parameters or what Packer.io is doing in the background -for that, I suggest you turn to the tool's documentation: http://www.packer.io/docs

I have tried to keep paramter names the same throughout the module. If an attribute can be passed in is mentioned in the docs, it works here.



packerCmd Documentation
===
packerCmd currently only wraps the build command, and formats output from the console.

packerCmd.command
---
```
packerCmd.command(command, file, options)
```
packerCmd.command creates the command string for a packer.io command on a given file. It shall pass options from a simple javascript object as -key=value.

* command - The command to execute. build, inspect, version, etc
* file - The file to execute the command on
* opts - A javascript object. The function will take the keys from options, and then pass them in the outputted command string as -key=value

packerCmd.build
---
```
packerCmd.build(file, options, cb)
```
packerCmd.build executes and handles the output formatting of a Packer.IO build command.

* file - the Packer file to execute the command on
* options - the options object to add to the command string
* cb - the callback

Example callback:
```
function(err, output){
 if(err){
  console.log("Uh-oh...", err)
 } else {
  console.log("Hooray! It worked", output)
 }
}
```

Please note that there is an additional, secret option not passed in as a command string to Packer.IO - outputType.
outputType is stripped from the options object before being passed into the command string, and used to request different types of output. The following options are available:
* raw - The straight up string output from Packer.IO
* delimited - An array of arrays, seperated by newlines and then commas.
* results - The default option - a javascript object describing the output artifacts for each builder
* all - an object with keys of the above types, with their respective output formats


PackerFile Documentation
===

PackerFile allows you to do this:

```
var PackerFile = require('node-packerio').PackerFile
 
var newImage = new PackerFile()
newImage.addAmazonEBS(process.env.AMAZON_ACCESS_TOKEN,
    process.env.AMAZON_SECRET_TOKEN,
    't1.micro',
    'us-east-1',
    'ami-3d8457d',
    'ubuntu')
 .shellCmd('sleep 30')
 .shellCmd('sudo apt-get update')
 .shellCmd('sudo apt-get install nodejs')
 .uploadFile('path/to/my/app')
 .build()
```


...and have Packer.io create an amazon image for deployment that is a base ubuntu install with nodejs installed.

All commands are chainable, or can be standalone.

