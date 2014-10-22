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
    if(typeof access_key != 'object'){
      opts = opts || {}
      opts.ami_name = opts.ami_name || 'Packer.io generated instance - ' + (new Date()).getTime()
      opts.access_key = access_key
      opts.secret_key = secret_key
      opts.instance_type = instance_type
      opts.region = region
      opts.source_ami = source_ami
      opts.ssh_username = ssh_username
    } else {
      opts = access_key
    }

    return self.addBuilder('amazon-ebs', opts)
  }

  PackerFile.prototype.addAmazonInstance = function(access_key, secret_key, account_id, source_ami, ssh_username, region, instance_type, ami_name, s3_bucket, x509_cert_path, x509_key_path, opts){
    var self = this
    if(typeof access_key != 'object'){
      opts = opts || {}
      opts.access_key = access_key
      opts.secret_key = secret_key
      opts.account_id = account_id
      opts.source_ami = source_ami
      opts.ssh_username = ssh_username
      opts.region = region
      opts.instance_type = instance_type
      opts.ami_name = ami_name
      opts.s3_bucket = s3_bucket
      opts.x509_cert_path = x509_cert_path
      opts.x509_key_path = x509_key_path
    } else {
      opts = access_key
    }

    return self.addBuilder('amazon-instance', opts)
  }

  PackerFile.prototype.addAmazonChroot = function(access_key, secret_key, source_ami, ami_name, opts){
    var self = this
    if(typeof access_key != 'object'){
      opts = opts || {}
      opts.access_key = access_key
      opts.secret_key = secret_key
      opts.source_ami = source_ami
      opts.ami_name = ami_name
    } else {
      opts = access_key
    }

    return self.addBuilder('amazon-chroot', opts)
  }

  PackerFile.prototype.addDigitalOcean = function(api_key, client_id, opts){
      var self = this
      if(typeof api_key != 'object'){
        opts = opts || {}
        opts.api_key = api_key
        opts.client_id = client_id
      } else {
        opts = api_key
      }

      return self.addBuilder('digitalocean', opts)
  }

  PackerFile.prototype.addDocker = function(commit, export_path, image, opts){
    var self = this
    if(typeof commit != 'object'){
      opts = opts || {}
      opts.commit = commit
      opts.export_path = export_path
      opts.image = image
    } else {
      opts = commit
    }

    return self.addBuilder('docker', opts)
  }

  PackerFile.prototype.addGoogleComputeEngine = function(account_file, client_secrets_file, private_key_file, project_id, source_image, bucket_name, zone, opts){
    var self = this
    if(typeof account_file != 'object'){
      opts = opts || {}
      opts.account_file = account_file
      opts.client_secrets_file = client_secrets_file
      opts.private_key_file = private_key_file
      opts.project_id = project_id
      opts.source_image = source_image
      opts.bucket_name = bucket_name
      opts.zone  = zone
    } else {
      opts = account_file
    }

    return self.addBuilder('googlecompute', opts)
  }

  PackerFile.prototype.addNullBuilder = function(host, ssh_username, ssh_password, ssh_private_key_file, opts){
    var self = this
    if(typeof host != 'object'){
      opts = opts || {}
      opts.host = host
      opts.ssh_username = ssh_username
      if(ssh_password){
        opt.ssh_password = ssh_password
      } else {
        opts.ssh_private_key_file = ssh_private_key_file
      }
    } else {
      opts = host
    }

    return self.addBuilder('null', opts)
  }

  PackerFile.prototype.addOpenStack = function(username, password, flavor, provider, image_name, source_image, opts){
    var self = this
    if(typeof username != 'object'){
      opts = opts || {}
      opts.username = username
      opts.password = password
      opts.flavor = flavor
      opts.provider = provider
      opts.image_name = image_name
      opts.source_image = source_image
    } else {
      opts = username
    }

    return self.addBuilder('openstack', opts)
  }

  PackerFile.prototype.addParallelsISO = function(parallels_tools_flavor, ssh_username, iso_url, iso_checksum, iso_checksum_type, opts){
    var self = this
    if(typeof parallels_tools_flavor != 'object'){
      opts = opts || {}
      opts.parallels_tools_flavor = parallels_tools_flavor
      opts.ssh_username = ssh_username
      opts.iso_url = iso_url
      opts.iso_checksum = iso_checksum
      opts.iso_checksum_type = iso_checksum_type
    } else {
      opts = parallels_tools_flavor
    }

    return self.addBuilder('parallels-iso', opts)
  }

  PackerFile.prototype.addParallelsPVM = function(parallels_tools_flavor, ssh_username, source_path, opts){
    var self = this
    if(typeof parallels_tools_flavor != 'object'){
      opts = opts || {}
      opts.parallels_tools_flavor = parallels_tools_flavor
      opts.ssh_username = ssh_username
      opts.source_path = source_path
    } else {
      opts = parallels_tools_flavor
    }

    return self.addBuilder('parallels-pvm', opts)
  }

  PackerFile.prototype.addQEMU = function(ssh_username, iso_url, iso_checksum, iso_checksum_type, opts){
    var self = this
    if(typeof ssh_username != 'object'){
      opts = opt || {}
      opts.ssh_username = ssh_username
      opts.iso_url = iso_url
      opts.iso_checksum = iso_checksum
      opts.iso_checksum_type = iso_checksum_type
    } else {
      opts = ssh_username
    }

    return self.addBuilder('qemu', opts)
  }

  PackerFile.prototype.addVirtualBoxISO = function(ssh_username, iso_url, iso_checksum, iso_checksum_type, opts){
    var self = this
    if(typeof ssh_username != 'object'){
      opts = opts || {}
      opts.ssh_username = ssh_username
      opts.iso_url = iso_url
      opts.iso_checksum = iso_checksum
      opts.iso_checksum_type = iso_checksum_type
    } else {
      opts = ssh_username
    }

    return self.addBuilder('virtualbox-iso', opts)
  }

  PackerFile.prototype.addVirtualBoxOVF = function(ssh_username, source_path, opts){
    var self = this
    if(typeof ssh_username != 'object'){
      opts = opts || {}
      opts.ssh_username = ssh_username
      opts.source_path = source_path
    } else {
      opts = ssh_username
    }

    return self.addBuilder('virtualbox-ovf', opts)
  }

  PackerFile.prototype.addVMWareISO = function(ssh_username, iso_url, iso_checksum, iso_checksum_type, opts){
    var self = this
    if(typeof ssh_username != 'object'){
      opts = opts || {}
      opts.ssh_username = ssh_username
      opts.iso_url = iso_url
      opts.iso_checksum = iso_checksum
      opts.iso_checksum_type = iso_checksum_type
    } else {
      opts = ssh_username
    }

    return self.addBuilder('vmware-iso', opts)
  }

  PackerFile.prototype.addVMWareVMX = function(ssh_username, source_path, opts){
    var self = this
    if(typeof ssh_username != 'object'){
      opts = opts || {}
      opts.ssh_username = ssh_username
      opts.source_path = source_path
    } else {
      opts = ssh_username
    }

    return self.addBuilder('vmware-vmx', opts)
  }


}
