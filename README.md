node-packer
===================
A convenient wrapper module to control Packer

```
 var newImage = new PackerFile()
 
 newImage.shellCmd('sudo apt-get update')
   .shellCmd('sudo apt-get install -y nginx mysql nodejs")
   .uploadFile('/my/app')
   .chefClient('http://chefServer:8012')
   .build()
```

This is a BETA module. Pull requests, input, stories of the module in use, and constructive criticisms are highly welcome. I'll try to be active in maintaining.

1. [The Basics](#the-basics)
 * [Installation](#installation)
 * [Usage](#usage)
 * [packerCmd VS PackerFile](#packercmd-vs-packerfile)
2. [packerCmd Documentation](#packercmd-documentation)
 * [packerCmd.command](#packercmdcommand)
 * [packerCmd.build](#packercmdbuild)
3. [PackerFile Documentation](#packerfile-documentation)
 1. [Core functions](#core-functions)
  * [new PackerFile()](#new-packerfile)
  * [PackerFile.filePath](#packerfilefilePath)
  * [PackerFile.write](#packerfilewrite)
  * [PackerFile.build](#packerfilebuild)
  * [PackerFile.read](#packerfileread)
  * [PackerFile.clean](#packerfileclean)
  * [PackerFile.json](#packerfilejson)
2. [Builder functions](#builder-functions)
  * [PackerFile.addBuilder](#packerfileaddbuilder)
  * [PackerFile.addAmazonEBS](#packerfileaddamazonebs)
  * [PackerFile.addDigitalOcean](#packerfileadddigitalocean)
  * [PackerFile.addDocker](#packerfileadddocker)
  * [PackerFile.addGoogleComputeEngine](#packerfileaddgooglecomputeengine)
  * [PackerFile.addNullBuilder](#packerfileaddnullbuilder)
  * [PackerFile.addOpenStack](#packerfileaddopenstack)
  * [PackerFile.addParallelsISO](#packerfileaddparallelsiso)
  *  [PackerFile.addParallelsPVM](packerfileaddparallelspvm)
  * [PackerFIle.addQEMU](#packerfileaddqemu)
  * [PackerFile.addVirtualBoxISO](#packerfileaddvirtualboxiso)
  * [PackerFile.addVirtualBoxOVF](#packerfileaddvirtualboxovf)
  * [PackerFile.addVMWareISO](#packerfileaddvmwareiso)
  * [PackerFile.addVMWareVMX](#packerfileaddwmwarevmx)
  * [Provisioner functions](#provisioner-functions)
  * [PackerFile.addProvisioner](#packerfileaddprovisioner)
  * [PackerFile.shellCmd](#packerfileshellcmd)
  * [PackerFile.uploadFile](#packerfileuploadFile)
  * [PackerFile.ansible](#packerfileansible)
  * [Packer.chefClient](#packerchefclient)
  * [PackerFile.chefSolo](#packerfilechefsolo)
  * [PackerFile.puppetMasterless](#packerfilepuppetmasterless)
  * [PackerFile.saltMasterless](#packerfilesaltmasterless)
3. [Post-Processors](#post-processors)
  * [PackerFile.addPostProcessor](#packerfileaddpostprocessor)
  * [PackerFile.compress](#packerfilecompress)
  * [PackerFile.dockerImport](#packerfiledockerimport)
  * [PackerFile.dockerPush](#packerfiledockerpush)
  * [PackerFile.dockerSave](#packerFiledockersave)
  * [PackerFile.dockerTag](#packerfiledockertag)
  * [PackerFile.vagrant](#packerfilevagrant)
  * [PackerFile.vagrantCloud](#packerfilevagrantcloud)
  * [PackerFile.vsphere](#packerfilevsphere)

# The Basics


Packer is a very useful command line application to generate server images across a multitude of services such as Amazon, Heroku, or local applications such as Docker or VirtualBox. It was created by Hashicorp, of which I am not associated with beyond being a fan.  I've created a node wrapper to allow me to programmatically control the tool as part of a larger project, and am sharing the results here.


## Installation
```
npm install node-packerio
```


## Usage
```
var packerCmd = require('node-packerio').packerCmd
var PackerFile = require('node-packerio').PackerFile
```


### packerCmd VS PackerFile

packerCmd is a command line wrapper for the build command for Packer. It also formats the output in a few ways. Currently, there are only a few commands in Packer that are machine-readable compatible, and only the build command seems to make sense being built. As such, the other commands haven't been built out yet. They are TBD.

PackerFile is a helpful class wrapped around packerCmd - you don't need to bring in packerCmd unless you need to manually control the builder.

In other words, packerCmd allows you to execute commands on a packer file on your system. PackerFile manages that file, or removes the need for the file, as well as allows the execution of builds on that file.


## Packer.io Documentation
I will not attempt to explain every nook and cranny of required parameters or what Packer.io is doing in the background -for that, I suggest you turn to the tool's [documentation](http://www.packer.io/docs).

I have tried to keep paramter names the same throughout the module. If an attribute can be passed in is mentioned in the docs, it works here.



# packerCmd Documentation

packerCmd currently only wraps the build command, and formats output from the console.

### packerCmd.command

```
packerCmd.command(command, file, options)
```
packerCmd.command creates the command string for a packer.io command on a given file. It shall pass options from a simple javascript object as -key=value.

* command - The command to execute. build, inspect, version, etc
* file - The file to execute the command on
* opts - A javascript object. The function will take the keys from options, and then pass them in the outputted command string as -key=value

### packerCmd.build
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


# PackerFile Documentation


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

All PackerFile objects have the following attributes:
* filePath - the current filepath of the PackerFile. Can be null if it's only being worked on in memory.
* builders - an [] of builder objects
* provisioners - an [] of provisioner objects
* variables - an [] of variable objects
* post-processors - an [] of post-processor objects

## Core functions

### new PackerFile()

```
var packerFile = new PackerFile(opts)
```
* opts - an optional parameter. If it's passed in, it has all attributes for the PackerFile. If the filePath is included, it will immediately call this.read()


### PackerFile.filePath
```
packerFile.filePath(filePath)
```
Equivalent to packerFile.filePath = 'something', but allows function chaining.


### PackerFile.write
```
packerFile.write([workingDirectory,] cb)
```
Will write the PackerFile in memory to a file. If there is a filePath set, it will attempt to write to that file path. Otherwise it will generate one with a random file name. If workingDirectory is provided, it shall use that directory to generate the file. Otherwise, it will work locally (whatever './' is at the time)

Please note that, while calling it without a callback is possible, and the write function is chainable, that the function is asynchronous and thus chaining more functions into it does not mean it waits for the build to be complete.

Callback example:
```
packerFile.write(function(err){
 if(err){
  console.log('Oh noes!', err)
 } else {
  console.log("Hooray!")
 }
})
```

### PackerFile.build
```
packerFile.build([opts,] cb)
```
Will attempt a build by calling packerCmd.build. The opts parameter is optional. If filePath is set, it shall immediately start the build on that file and NOT write. If there is no filePath set, then it will call write() and, upon completion (either success or failure) shall call .clean()

Please note that, while calling it without a callback is possible, and the build function is chainable, that the function is asynchronous and thus chaining more functions into it does not mean it waits for the build to be complete.

Callback example:
```
packerFile.build(function(err, output){
 if(err){
  console.log("Fiddlesticks! Something went wrong :-(", err)
 } else {
  console.log("The formatted output from the build:", output)
 }

})
```

### PackerFile.read
```
packerFile.read(cb)
```
Will read the current filePath, if any. It shall then convert it to a JSON file and attempt to assign them from the PackerFile. Useful if you have pre-written PackerFiles that you want to start manipulating/build off of.

Callback example:
```
packerFile.write(function(err){
 if(err){
  console.log('Oh gum drops :-/', err)
 } else {
  console.log("My life has never been greater - it worked")
 }
})
```

### PackerFile.clean
```
packerFile.clean(cb)
```
Will destroy the filePath, if it exists. This is called by build if you call it without a filePath set.

Callback example:
```
packerFile.write(function(err){
 if(err){
  console.log('The system ignored our request', err)
 } else {
  console.log("Squeaky clean")
 }
})
```

### PackerFile.json
```
packerFile.json()
```
Returns the same JSON we write to the Packer file in .write()


## Builder functions

Buidler functions consist of a core function - addBuilder - and wrapper functions that merely, in turn, call that. All functions are chainable.

All builder functions list out required or suggested required attributes from the Packer.IO documentation, with an additional opts parameter where you can specify any additional, unlisted parameters.

All builder functions allow the passing of an object as its only parameter that defines the entirety of the builder. Type is not required on helper functions save addBuilder. 

For additional documentation on individual builders, please refer to the (Packer.IO docs)[http://www.packer.io/docs].

### PackerFile.addBuilder
```
packerFile.addBuilder(builderType, opts)
```
Core builder function. Requires type to be specified, all other options passed as a simple key/value javascript object.

### PackerFile.addAmazonEBS
```
packerFile.addAmazonEBS(access_key, secret_key, instance_type, region, source_ami, ssh_username, opts)
```


### PackerFile.addDigitalOcean
```
packerFile.addDigitalOcean(api_key, client_id, opts)
```

### PackerFile.addDocker
```
packerFile.addDocker(commit, export_path, image, opts)
```

### PackerFile.addGoogleComputeEngine
```
packerFile.addGoogleComputeEngine(account_file, client_secrets_file, private_key_file, project_id, source_image, bucket_name, zone, opts)
```

### PackerFile.addNullBuilder
```
packerFile.addNullBuilder(host, ssh_username, ssh_password, ssh_private_key_file, opts)
```

### PackerFile.addOpenStack
```
packerFile.addOpenStack(username, password, flavor, provider, image_name, source_image, opts){
```

### PackerFile.addParallelsISO
```
packerFile.addParallelsISO(parallels_tools_flavor, ssh_username, iso_url, iso_checksum, iso_checksum_type, opts)
```

### PackerFile.addParallelsPVM
```
packerFile.addParallelsPVM(parallels_tools_flavor, ssh_username, source_path, opts)
```

### PackerFIle.addQEMU
```
packerFile.addQEMU(ssh_username, iso_url, iso_checksum, iso_checksum_type, opts)
```

### PackerFile.addVirtualBoxISO
```
packerFile.addVirtualBoxISO = function(ssh_username, iso_url, iso_checksum, iso_checksum_type, opts)
```

### PackerFile.addVirtualBoxOVF
```
packerFile.addVirtualBoxOVF(ssh_username, source_path, opts)
```

### PackerFile.addVMWareISO
```
packerFile.addVMWareISO(ssh_username, iso_url, iso_checksum, iso_checksum_type, opts)
```

### PackerFile.addVMWareVMX
```
packerFile.addVMWareVMX(ssh_username, source_path, opts)
```

## Provisioner functions

Provisioner functions add, in order of calling, the provisioner to the Packer File. They are all built off of addProvisioner, and follow the same convention as builders - they can accept a single object as the first and only attribute.

### PackerFile.addProvisioner
```
packerFile.addProvisioner(provisionerType, opts)
```
Core provisioner function - all other provisioner functions use this.

### PackerFile.shellCmd
```
packerFile.shellCmd(cmds[, force])
```
Shell command has a unique attribute and approach compared to normal provisioners. The cmds variable accepts either a string or array of strings. If the last provisioner added was also a shell cmd, it will append the commands to the inline/shell command provisioner instead of creating a new provisioner. This can be overruled by setting force to true.

### PackerFile.uploadFile
```
packerFile.uploadFile(source, destination)
```

### PackerFile.ansible
```
packerFile.ansible(playbook_file, opts)
```

### Packer.chefClient
```
packerFile.chefClient(node_name, opts)
```

### PackerFile.chefSolo
```
packerFile.chefSolo(run_list, opts)
```

### PackerFile.puppetMasterless
```
packerFile.puppetMasterless(manifest_file, opts)
```

### PackerFile.saltMasterless
```
packerFile.saltMasterless(local_state_tree, opts)
```


## Post-Processors

Post-Processors can be added and manipulated in PackerFile, but beyond that the management of each post-processor is left as an exercise to the user for now. They work the same way as provisioners above.

### PackerFile.addPostProcessor
```
packerFile.addPostProcessor(processorType, opts)
```

### PackerFile.compress
```
packerFile.compress(path)
```

### PackerFile.dockerImport
```
packerFile.dockerImport(repository, tag)
```

### PackerFile.dockerPush
```
packerFile.dockerPush(opts)
```

### PackerFile.dockerSave
```
packerFile.dockerSave(path)
```

### PackerFile.dockerTag
```
packerFile.dockerTag(repository, tag)
```

### PackerFile.vagrant
```
packerFile.vagrant(opts)
```

### PackerFile.vagrantCloud
```  
packerFile.vagrantCloud(access_token, box_tag, version, opts)
```

### PackerFile.vsphere
```
packerFile.vsphere(username, password, host, datacenter, cluster, resource_pool, vm_name, opts)
```
