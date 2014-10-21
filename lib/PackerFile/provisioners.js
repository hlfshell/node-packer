//All of the provisioners functions for the PackerFile class
module.exports = function(PackerFile){

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

}
