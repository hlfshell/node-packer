var packerCmd = require('./packerCmd')(),
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
      variables = {} typical object
      fileDirectory = By default, './'

    Methods:
      write = Will create a random file OR use one already create and write the JSON output of the packer file.
      clean = Will destroy the packer file if one exists. Returns true or false.
      read = If there is a set filename for a PackerFile, it will be read and its attributes set to the object

  */
  var PackerFile = function(opts){
    if(!opts){
      opts = {}
    }

    this.filename = opts.filename
    this.builders = opts.builders || []
    this.provisioners = opts.provisioners || []
    this['post-processors'] = opts['post-processors'] || []
    this.variables = opts.variables || {}

    this.fileDirectory = opts.fileDirectory || './'

    if(this.filename){
      this.read()
    }
  }

  PackerFile.prototype.write = function(cb){
    var self = this
    if(!self.filename){
      //Generate a random filename
      self.filename = Math.random().toString(36).slice(2) + '.json'
    }

    if(!cb){
      cb = function(){}
    }

    fs.writeFile(self.fileDirectory + '/' + self.filename, JSON.stringify(self.json()), cb)

    return self
  }

  //Build will either use the file in the filename (if it exists) and execute OR
  //create a file, write to that, and then execute, and finally remove the file
  //via a clean.
  //opts is optional and appended to the build at call time
  PackerFile.prototype.build = function(opts, cb){
    self = this
    if(typeof opts == 'function'){
      cb = opts
      opts = null
    }

    if(self.filename){
      if(!cb){
        cb = function(){}
      }
      packerCmd.build(self.fileDirectory + '/' + self.filename, opts, cb)
    } else {
      self.write(function(err){
        if(err && cb){
          cb(err)
        } else {
          packerCmd.build(self.fileDirectory + '/' + self.filename, opts, function(err, output){
            err ? cb(err, output) : self.clean(function(err){
              cb ? cb(err, output) : null
            })
          })
        }
      })
    }
    return self
  }

  //Read the current set filename and set its values to the current PackerFile object
  PackerFile.prototype.read = function(cb){
    var self = this
    if(filename){
      fs.readFile(self.fileDirectory + '/' + self.filename, function(err, data){
        if(err){
          cb(err)
        } else {
          var packerFile = JSON.parse(data)

          self.builders = results.builders || []
          self.provisioners = results.provisioners || []
          self['post-processors'] = results['post-processors'] || []

          cb(null)
        }
      })
    } else if(cb){
      cb(null)
    }

    return self
  }

  //If the filename exists, destory the file
  PackerFile.prototype.clean = function(cb){
    var self = this
    if(self.filename){
      fs.unlink(self.fileDirectory + '/' + self.filename, cb)
    } else if(cb){
      cb(null)
    }

    return self
  }

  //JSON function to provide a clean JSON representation of what's in a packer file
  PackerFile.prototype.json = function(){
    var self = this
    return {
      variables: self.variables,
      builders: self.builders,
      provisioners: self.provisioners,
      "post-processors": self['post-Processors']
    }
  }

  //BUILDERS
  //Generic Builder
  //No validation, easy function, etc.
  PackerFile.prototype.addBuilder = function(builderType, opts){
    var self = this
    if(typeof builderType == 'object'){
      self.builders.push(builderType)
    } else {
      var builder = {
        type: builderType
      }
      if(opts){
        Object.keys(opts).forEach(function(key){
          builder[key] = opts[key]
        })
      }

      self.builders.push(builder)
    }


    return self
  }

  //Amazon helper function
  PackerFile.prototype.addAmazonEBS = function(access_key, secret_key, instance_type, region, source_ami, ssh_username, opts){
    var self = this
    if(typeof access_key == 'object'){
      return self.addBuilder('amazon-ebs', access_key)
    } else {
      opts = opts || {}
      opts.ami_name = opts.ami_name || 'Packer.io generated instance - ' + (new Date()).getTime()
      opts.access_key = access_key
      opts.secret_key = secret_key
      opts.instance_type = instance_type
      opts.region = region
      opts.source_ami = source_ami
      opts.ssh_username = ssh_username
      return self.addBuilder('amazon-ebs', opts)
    }
  }


  //PROVISIONERS

  PackerFile.prototype.addProvisioner = function(provisionerType, opts){
    var self = this
    if(typeof provisionerType == 'object'){
      self.provisioners.push(provisionerType)
    } else {
      if(!opts){
        opts = {}
      }
      opts.type = provisionerType

      self.provisioners.push(opts)
    }

    return self
  }

  //If the last provisioner added was a shell command, add it to that.
  //Since this is not thread/asynchronous safe, if you believe that it may
  //be an issue with a single PackerFile called by multiple functions simultaneously,
  //then force = true prevents this behavior.
  PackerFile.prototype.shellCmd = function(cmds, force){
    var self = this
    //If the input is a string, make it an array to avoid rewriting code here
    if(typeof cmds == 'string'){
      cmds = [cmds]
    }

    //If the last provisioner is currently a shell script, add to it
    if(!force &&
      self.provisioners.length > 0 &&
      self.provisioners[this.provisioners.length - 1].type == 'shell'){
        cmds.forEach(function(cmd){
          self.provisioners[self.provisioners.length - 1].inline.push(cmd)
        })
        return self
    } else {
      return self.provisioners.push({
        type: 'shell',
        inline: cmds
      })
    }
  }

  PackerFile.prototype.uploadFile = function(source, destination){
    var self = this
    self.provisioners.push({
      type: 'file',
      source: source,
      destination: destination
    })

    return self
  }

  return PackerFile

}
