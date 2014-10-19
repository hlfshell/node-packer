var packerCmd = require('./packerCmd'),
  fs = require('fs')

module.exports = function(){

  //Create a PackerFile Class.
  /*
    PackerFile
    Attrs:
      filename = filename of the packer.json file IF it exists
      builders = [] of builders
      provisioners = [] of provisioners
      post-processors = [] of postProcessors
      variables = [] of variables
      fileDirectory = By default, './'

    Methods:
      write = Will create a random file OR use one already create and write the JSON output of the packer file.
      clean = Will destroy the packer file if one exists. Returns true or false.
      read = If there is a set filename for a PackerFile, it will be read and its attributes set to the object

  */
  var PackerFile = function(opts){
    this.filename = opts.filename
    this.builders = opts.builders
    this.provisioners = opts.provisioners
    this['post-processors'] = opts['post-processors']
    this.variables = opts.variables

    this.fileDirectory = opts.fileDirectory || './'

    if(this.filename){
      this.read()
    }
  }

  Packerfile.prototype.write = function(cb){
      if(!this.filename){
        //Generate a random filename
        this.filename = this.fileDirectory + '/' + Math.random().toString(36).slice(2) + '.json'
      }

      fs.writeFile(this.filename, JSON.stringify(
        {
          variables: this.variables,
          builders: this.builders,
          provisioners: this.provisioners,
          "post-processors": this['post-Processors']
        }
      ), cb)
  }

  //Build will either use the file in the filename (if it exists) and execute OR
  //create a file, write to that, and then execute, and finally remove the file
  //via a clean.
  //opts is optional and appended to the build at call time
  PackerFile.prototype.build = function(opts, cb){
    if(typeof opts == 'function'){
      cb = opts
      opts = null
    }

    if(this.filename){
      packerCmd.build(this.fileDirectory + '/' + this.filename, opts, cb)
    } else {
      this.write(function(err){
        if(err){
          cb(err)
        } else {
          packerCmd.build(this.fileDirectory + '/' + this.filename, opts, function(err, output){
            err ? cb(err, output) : this.clean(function(err){
              cb(err, output)
            })
          })
        }
      })
    }
  }

  //Read the current set filename and set its values to the current PackerFile object
  PackerFile.prototype.read = function(cb){
    if(filename){
      fs.readFile(this.fileDirectory + '/' + this.filename, function(err, data){
        if(err){
          cb(err)
        } else {
          var packerFile = JSON.parse(data)

          this.builders = results.builders || []
          this.provisioners = results.provisioners || []
          this['post-processors'] = results['post-processors'] || []

          cb(null)
        }
      })
    } else {
      cb(null)
    }
  }

  //If the filename exists, destory the file
  Packerfile.prototype.clean = function(cb){
    if(this.filename){
      fs.unlink(this.fileDirectory + '/' + this.filename, cb)
    } else {
      cb(null)
    }
  }

  //BUILDERS
  //Generic Builder
  //No validation, easy function, etc.
  PackerFile.prototype.addBuilder = function(builderType, opts){
    if(typeof builderType == 'object'){
      this.builders.push(builderType)
    } else {
      var builder = {
        type: builderType
      }
      if(opts){
        Object.keys(opts).forEach(function(key){
          builder[key] = opts[key]
        })
      }

      this.builders.push(builder)
    }
  }

  //Amazon helper function
  Packerfile.prototype.addAmazonEBS = function(access_key, secret_key, instance_type, region, source_ami, ssh_username, opts){
    if(typeof access_key == 'object'){
      this.addBuilder('amazon-ebs', access_key)
    } else {
      opts = opts || {}
      opts.ami_name = opts.ami_name || 'Packer.io generated instance - ' + (new Date()).getTime()
      opts.access_key = access_key
      opts.secret_key = secret_key
      opts.instance_type = instance_type
      opts.region = region
      opts.source_ami = source_ami
      opts.ssh_username = ssh_username
      this.addBuilder('amazon-ebs', opts)
    }
  }


  //PROVISIONERS

  PackerFile.prototype.addProvisioner = function(provisionerType, opts){
    if(typeof provisionerType == 'object'){
      this.provisioners.push(provisionerType)
    } else {
      if(!opts){
        opts = {}
      }
      opts.type = provisionerType

      this.provisioners.push(opts)
    }
  }

  //If the last provisioner added was a shell command, add it to that.
  //Since this is not thread/asynchronous safe, if you believe that it may
  //be an issue with a single PackerFile called by multiple functions simultaneously,
  //then force = true prevents this behavior.
  PackerFile.prototype.shellCmd = function(cmds, force){
    //If the input is a string, make it an array to avoid rewriting code here
    if(typeof cmds == 'string'){
      cmds = [cmds]
    }

    //If the last provisioner is currently a shell script, add to it
    if(!force &&
      this.provisioners.length > 0 &&
      this.provisioners[this.provisioners.length - 1].type == 'shell'){

        cmds.forEach(function(cmd){
          this.provisioners[this.provisions.length - 1].inline.push(cmd)
        })

    } else {
      this.provisioners.push({
        type: 'shell',
        inline: cmds
      })
    }
  }

  PackerFile.prototype.uploadFile = function(source, destination){
    this.provisioners.push({
      type: 'file',
      source: source,
      destination: destination
    })
  }

  return PackerFile

}
