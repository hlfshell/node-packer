//All of the post-processor functions for the PackerFile class
module.exports = function(PackerFile){

  //Generic post-processor function
  PackerFile.prototype.addPostProcessor = function(processorType, opts){
    var self = this
    if(typeof processorType == 'object'){
      self['post-processors'].push(processorType)
    } else {
      if(!opts){
        opts = {}
      }
      opts.type = processorType

      self['post-processors'].push(opts)
    }

    return self
  }

  PackerFile.prototype.compress = function(path){
    return this.addPostProcessor('compress', { path: path })
  }

  PackerFile.prototype.dockerImport = function(repository, tag){
    var opts = tag ? { repository: repostiory, tag: tag } : { repository: repository }
    return this.addPostProcessor('docker-import', opts)
  }

  PackerFile.prototype.dockerPush = function(opts){
    return this.addPostProcessor('docker-push', opts)
  }

  PackerFile.prototype.dockerSave = function(path){
    return this.addPostProcessor('docker-save', { path: path })
  }

  PackerFile.prototype.dockerTag = function(repository, tag){
    var opts = tag ? { repository: repostiory, tag: tag } : { repository: repository }
    return this.addPostProcessor('docker-tag', opts)
  }

  PackerFile.prototype.vagrant = function(opts){
    return this.addPostProcessor('vagrant', opts)
  }

  PackerFile.prototype.vagrantCloud = function(access_token, box_tag, version, opts){
    if(typeof access_token == 'object'){
      return this.addPostProcessor('vagrant-cloud', access_token)
    } else {
      opts = opts || {}
      opts.access_token = access_token
      opts.box_tag = box_tag
      opts.version = version
      return this.addPostProcessor('vagrant-cloud', opts)
    }
  }

  PackerFile.prototype.vsphere = function(username, password, host, datacenter, cluster, resource_pool, vm_name, opts){
    if(typeof username == 'object'){
      return this.addPostProcessor('vsphere', username)
    } else {
      opts = opts || {}
      opts.username = username
      opts.password = password
      opts.host = host
      opts.datacenter = datacenter
      opts.cluster = cluster
      opts.resource_pool = resource_pool
      opts.vm_name = vm_name
      return this.addPostProcessor('vsphere', opts)
    }
  }

}
