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
      self.provisioners.push({
        type: 'shell',
        inline: cmds
      });
      return self;
    }
  }

  PackerFile.prototype.uploadFile = function(source, destination){
    if(typeof source == 'object'){
      return this.addProvisioner('file', source)
    }
    return this.addProvisioner('file', { source: source, destination: destination })
  }

  PackerFile.prototype.ansible = function(playbook_file, opts){
    if(typeof playbook_file == 'object'){
      opts = playbook_file
      return this.addProvisioner('ansible-local', playbook_file)
    } else {
      opts.playbook_file = playbook_file
      return this.addProvisioner('ansible-local', opts)
    }
  }

  PackerFile.prototype.chefClient = function(node_name, opts){
    if(typeof node_name == 'object'){
      opts = node_name
      return this.addProvisioner('chef-client', node_name)
    } else {
      opts.node_name = node_name
      return this.addProvisioner('chef-client', opts)
    }
  }

  PackerFile.prototype.chefSolo = function(run_list, opts){
    if(typeof run_list == 'object'){
      opts = run_list
      return this.addProvisioner('chef-solo', run_list)
    } else {
      opts.run_list = run_list
      return this.addProvisioner('chef-solo', opts)
    }
  }

  PackerFile.prototype.puppetMasterless = function(manifest_file, opts){
    if(typeof manifest_file == 'object'){
      opts = manifest_file
      return this.addProvisioner('puppet-masterless', manifest_file)
    } else {
      opts.manifest_file = manifest_file
      return this.addProvisioner('puppet-masterless', opts)
    }
  }

  PackerFile.prototype.puppetServer = function(opts){
    return this.addProvisioner('puppet-server', opts)
  }

  PackerFile.prototype.saltMasterless = function(local_state_tree, opts){
    if(typeof local_state_tree == 'object'){
      opts = local_state_tre
      return this.addProvisioner('salt-masterless', local_state_tree)
    } else {
      opts.local_state_tree = local_state_tree
      return this.addProvisioner('salt-masterless', opts)
    }
  }



}
