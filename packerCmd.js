var exec = require('child_process').exec

module.exports = function(){

  var packerCmd = {}

  //Build the command, pass the options appropriately, return the feedback
  packerCmd.command = function(command, file, options){
    if(typeof file == 'object'){
      options = file
      file = null
    }

    var cmd = 'packer ' + command + ' '
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

  packerCmd.formatOutput = function(output){
    //Split the text into an array, delimited by new lines
    var outputArr = output.split('\n')

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

    //Now that we have outputArr as an array of arrays, let's build an easier
    //results object
    var results = []
    outputArr.forEach(function(line){
      if(line.length < 3){
        results.push({ error: 'Could not parse output', output: line })
      } else {
        results.push({
          timestamp: line[0],
          target: line[1],
          type: line[2],
          data: line.length >= 4 ? line.length > 4 ? line.slice(3, line.length) : line[3] : null
        })
      }
    })
    return results
  }

  packerCmd.build = function(file, options, cb){
    var self = this
    //If options aren't passed in, use default options
    if(typeof options == 'function'){
      cb = options
      options = {}
    }

    exec(self.command('build', file, options), function(err, stdout, stderr){
      if(err){
        cb(err)
      } else if(stderr){
        cb(self.formatOutput(stderr))
      } else {
        cb(null, self.formatOutput(stdout))
      }
    })
  }



  return packerCmd

}
