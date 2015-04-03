'use strict';
var runner = require('karma').runner;
var server = require('karma').server;
var path = require('path');
var _ = require('lodash');

module.exports = function (grunt) {
    console.log('Grunt cmp karma ranner is loaded!');

    function finished(code){
        return this(code === 0);
    }

    grunt.registerMultiTask('cmpKarma', 'run karma.', function() {
        var done = this.async();
        var options = this.options({
            background: false,
            client: {}
        });

        // Allow for passing cli arguments to `client.args` using  `--grep=x`
        var args = _.filter(process.argv.slice(2), function(arg) {
            return arg.match(/^--?/);
        });
        //grunt.log.writeln('  args:',args);

        if (_.isArray(options.client.args)) {
            options.client.args = options.client.args.concat(args);
        } else {
            options.client.args = args;
        }

        // Merge karma default options
        _.defaults(options.client, {
            args: [],
            useIframe: true,
            captureConsole: true
        });

        var opts = _.cloneDeep(options);
        // Merge options onto data, with data taking precedence.
        var data = _.merge(opts, this.data);

        // But override the browsers array.
        if (data.browsers && this.data.browsers) {
            data.browsers = this.data.browsers;
        }

        // Merge client.args
        if (this.data.client && _.isArray(this.data.client.args)) {
            data.client.args = this.data.client.args.concat(options.client.args);
        }


        if (data.configFile) {
            data.configFile = path.resolve(data.configFile);
        }


        var files = [];

        if (data.files) {
            data.files.map(function(file){
                if(_.isString(file)){
                    files = files.concat(file.split(',').map(function(src){
                        return {
                            pattern: src
                        };
                    }));

                }else if(file.pattern){
                    files = files.concat(file.pattern.split(',').map(function(src){
                        var obj = {
                            pattern: src
                        };
                        ['watched', 'served', 'included'].forEach(function(opt) {
                            if (opt in file) {
                                obj[opt] = file[opt];
                            }
                        });
                        return obj;
                    }));
                }

            });

        }
        data.files = files;
        grunt.verbose.writeln('>> data:',data);

        // Allow the use of templates in preprocessors
        if (_.isPlainObject(data.preprocessors)) {
            var preprocessors = {};
            Object.keys(data.preprocessors).forEach(function(key) {
                var value = data.preprocessors[key];
                key = path.resolve(key);
                key = grunt.template.process(key);
                preprocessors[key] = value;
            });
            data.preprocessors = preprocessors;
        }

        //support `karma run`, useful for grunt watch
        if (this.flags.run){
            runner.run(data, finished.bind(done));
            return;
        }

        //allow karma to be run in the background so it doesn't block grunt
        if (data.background){
            var backgroundArgs = {
                cmd: 'node',
                args: process.execArgv.concat([
                    path.join(__dirname, '..', 'lib', 'background.js'),
                    JSON.stringify(data)
                ])
            };
            var backgroundProcess = grunt.util.spawn(backgroundArgs, function(error) {
                if (error) {
                    grunt.log.error(error);
                }
            });
            process.on('exit', function() {
                backgroundProcess.kill();
            });

            done();
        } else {
            server.start(data, finished.bind(done));
        }
    });

};

