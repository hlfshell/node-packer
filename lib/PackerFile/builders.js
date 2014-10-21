//All of the builder functions for the PackerFile class
module.exports = function(PackerFile){

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

}
