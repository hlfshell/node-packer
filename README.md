node-packerio
===================

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

PackerFile is a helpful class wrapped around packerCmd - you don't need to bring in packerCmd unless you need to manually control the builder. PackerFile allows you to do this:

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


Packer.io Documentation
----
I will not attempt to explain every nook and cranny of required parameters or what Packer.io is doing in the background -for that, I suggest you turn to the tool's documentation: http://www.packer.io/docs

I have tried to keep paramter names the same throughout the module. If an attribute can be passed in is mentioned in the docs, it works here.



packerCmd Documentation
===



PackerFile Documentation
===
