var exec = require('child_process').exec

module.exports = function(){

  var packerCmd = {}

  //Build the command, pass the options appropriately, return the feedback
  packerCmd.command = function(command, file, options){
    if(typeof file == 'object'){
      options = file
      file = null
    }

    var cmd = 'packer ' + command + ' -machine-readable '
    if(file){
      cmd += file + ' '
    }

    if(options){
      Object.keys(options).forEach(function(option){
          var value = '-' + options[option]
          if(options[option] instanceof 'array'){
            value = '=' + options[option].join(',') + ' '
          } else if(options[option] !== true){
            value = '=' + options[option] + ' '
          } else {
            cmd += '-' + option + '=' + options[option]
          }
      })
    }

    return cmd

  }

  packerCmd.build = function(file, options, cb){
    var self = this,
      outputType
    //If options aren't passed in, use default options
    if(typeof options == 'function'){
      cb = options
      options = {}
      outputType = 'results'
    } else {
      outputType = options.outputType
      delete options.outputType
    }

    exec(self.command('build', file, options), function(err, stdout, stderr){
      if(err || stderr){
        cb(err || stderr)
      } else {
        if(outputType == 'raw'){
          cb(null, stdout)
          return
        }

        //Format the output
        outputArr = stdout.split('\n')
        //Go through each, formatting it into a more workable format
        outputArr.forEach(function(result, index){
          //Split each result item into an array using the comma delimiter
          outputArr[index] = result.split(',')

          //Replace all instances of %!(PACKER_COMMA) with a ,
          //Yes, the innerIndex is ugly, I'm sorry.
          outputArr[index].forEach(function(item, innerIndex){
              outputArr[index][innerIndex] = outputArr[index][innerIndex].replace('%!(PACKER_COMMA)', ',')
          })
        })

        if(outputType == 'delimited'){
          cb(null, outputArr)
          return
        }

        var results = {},
          errors

        //Now go through the output, line by line, and build the results object
        outputArr.forEach(function(line){
          var builder = line[1],
            type = line[2],
            data = line.length > 4 ? line.slice(3, line.length) : line[3]

          //We only care about lines length 4 or more
          if(line.length < 4){
            return
          }
          //We also only care about messages for builders, not packer
          if(builder == ''){
            return
          }
          if(!results[builder]){
            results[builder] = { }
          }
          if(type == 'error-count'){
            if(!errors){
              errors = {}
            }
            if(!errors[builder]){
              errors[builder] = {}
            }
            errors[builder]['error-count'] = data
          } else if(type == 'error'){
            if(!errors){
              errors = {}
            }
            if(!errors[builder]){
              errors[builder] = {}
            }
            if(!errors[builder].error){
              errors[builder].error = data
            } else {
              if(!(results[builder].error instanceof Array)){
                results[builder].error = [results[builder].error]
              }
              results[builder].error.push(data)
            }
          } else if(type =='artifact-count'){
            results[builder]['artifact-count'] = data
          } else if(type == 'artifact'){
            var artifactIndex = data[0],
              dataDescriptor = data[1]

            if(!results[builder].artifacts){
              results[builder].artifacts = {}
            }
            if(!results[builder].artifacts[artifactIndex]){
              results[builder].artifacts[artifactIndex] = {}
            }
            if(data.length > 2){
                results[builder].artifacts[artifactIndex][dataDescriptor] = data.length > 4 ? data.splice(2, data.length) : data[2]
            }
            if(dataDescriptor == 'id'){
              results[builder].artifacts[artifactIndex].image = data[2].split(':')[1]
              results[builder].artifacts[artifactIndex].region = data[2].split(':')[0]
            }
          }
        })

        Object.keys(results).forEach(function(builder){
          var artifacts = []
          Object.keys(results[builder].artifacts).forEach(function(artifactIndex){
            artifacts.push(results[builder].artifacts[artifactIndex])
          })
          results[builder].artifacts = artifacts
        })

        if(outputType == 'all'){
          cb(null, {
            raw: stdout,
            delimited: outputArr,
            results: results
          })
        } else {
          cb(null, results)
        }
      }
    })
  }



  return packerCmd

}
