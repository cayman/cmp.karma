cmp.builder
===========

grunt plugin

# grunt-cmp-builder
Plugin for build and run multi-single page portal

> Prepare several modules (mod.*) for build (bower component with "type":"mod")

> Prepare several application (app.*) for build (bower component with "type":"app")

> Prepare template (template.*) for build (bower component with "type":"template")

> Prepare portal (portal.*) for build (bower component with "type":"portal")

## Getting Started
This plugin requires Grunt `~0.4.2`

To use an cmp() object, you must load lib cmpUtil and use a function named 'getCmp'  in Gruntfile.js

    var cmpUtil = require('./temp/cmp.builder/lib/cmp').init(grunt);

and add in taskConfig fields components as {} and cmp as cmpUtil.getCmp function name

    var taskConfig = {
        ..
        cmp: cmpUtil.getCmp,
        ...
    }

## Tasks

### cmpBower

load _bower.json, overrade dependencies from root _bower.json and generate bower.json
after load dependencies or update for bower.json

    var taskConfig = {
        ..
        cmpBower: {
            options: {
                sourceFile: '_bower.json'
            }
        },
        ...
    }

run task

    cmpBower:{path}

For example
> grunt cmpBower

> grunt cmpBower:./app.index

_bower.json example:

	{
		"name": "portal.xx",
		"dependencies": {
			"jquery": "~2.0.3",
			"angular": "~1.2.1",
			"angular-ui-router": "~0.2.0",
			"angular-bootstrap": "~0.8.0",
			"template.new": "git+https://git.xxxxx.net:8443/git/template.new.git#~0.0.8",
			"app.index": "./app.index",
			"app.services": "./app.services",
			"app.catalogs": "./app.catalogs"
		}
	}

In _bower.json file	you can use local file dependencies ./app.index
After cmpBower task run created bower.json

	{
		"name": "portal.xx",
		"dependencies": {
			"jquery": "~2.0.3",
			"angular": "~1.2.1",
			"angular-ui-router": "~0.2.0",
			"angular-bootstrap": "~0.8.0",
			"template.new": "git+https://git.xxxxx.net:8443/git/template.new.git#~0.0.8"

		},
		"localDependencies": {
            "app.index": "./app.index",
            "app.services": "./app.services",
            "app.catalogs": "./app.catalogs"
		}
	}

### cmpBuild
create cmp() object and his dependencies.

The root component may be a mod, app, template or portal,
depending on the passed parameter: the directory path components.

run task

    grunt cmpBuild:{param}:{path}:{parent cmpId}

For example
> grunt cmpBuild:dev:.

> grunt cmpBuild:prod:./app.index

> grunt cmpBuild:test:app.index

> grunt cmpBuild:dev:template.base

> grunt cmpBuild:dev:mode.sidebar


    var taskConfig = {
        ..
        cmpBuild: {
            options: {
                app: {
                    tasks: [
                        'cmpSet:app','jshint:cmp','jsonlint:app',
                        'clean:cmp', 'copy:cmp', 'concat:cmp',
                        'html2js:cmp', 'cmpConfig:app',
                        'assemble:app'
                    ]
                },
                mod: {
                    tasks: [
                        'cmpSet:mod', 'jshint:cmp', 'clean:cmp',
                        'copy:cmp', 'concat:cmp', 'html2js:cmp'
                    ]
                },
                lib: {
                    tasks: [
                        'cmpSet:lib', 'clean:cmp', 'copy:lib'
                    ]
                },
                template: {
                    tasks: [
                        'cmpSet:template', 'clean:cmp', 'copy:cmp'
                    ]
                },
                portal: {
                    tasks: [
                        'jshint:portal'
                    ]
                }
            },
            dev: {
            },
            test: {
                options: {
                    app: {
                        tasks: [
                            'cmpSet:app', 'jshint:cmp', 'jsonlint:app',
                            'clean:cmp', 'copy:cmp', 'concat:cmp',
                            'html2js:cmp', 'cmpConfig:app', 'cmpKarma:unit'
                        ]
                    }
                }
            },
            prod: {
                options: {
                    app: {
                        tasks: [
                            'cmpSet:app', 'jshint:cmp', 'jsonlint:app',
                            'clean:cmp', 'copy:cmp', 'concat:cmp',
                            'ngAnnotate:cmp', 'html2js:cmp','cmpConfig:app', 'uglify:cmp',
                            'assemble:appMin'
                        ]
                    },
                    mod: {
                        tasks: [
                            'cmpSet:mod', 'jshint:cmp',
                            'clean:cmp', 'copy:cmp', 'concat:cmp',
                            'ngAnnotate:cmp', 'html2js:cmp', 'uglify:cmp'
                        ]
                    }
                }
            }
        },
        ...
    }

Task cmpBuild creates objects cmp() object which contains the following fields:

	cmp().dir: component dir
	cmp().type: type (lib,mod,app,template) - taken from "type" param from bower.json (mod | app | template) else 'lib'
	cmp().name: component name (from {bower.json}.name without prefix mod,app,template if exist)
	cmp().version: component version (from {bower.json}.version),
	cmp().id: unique component id (for example {cmp().type}_{cmp().name}_{cmp().version} )
	cmp().main: scripts (from {bower.json}.main),
	cmp().authors: автор (from {bower.json}.authors),
	cmp().dependencies: array identifiers dependent component
	cmp().dependenciesDir: root directory (generally {dir}/bower_components) which contain dependent components
	cmp().template: identifier template component (If the pattern is specified in dependencies)

###  cmpSet:
dynamically set additional fields to cmp() object

    var taskConfig = {
        ..
        cmpSet: {
            options: {
                src: '<%=cmp().dir %>/src',
                path: '/<%=cmp().type %>/<%=cmp().name %>/<%=cmp().version %>',
                dest: '<%=build %>/<%=cmp().type %>/<%=cmp().name %>/<%=cmp().version %>'
            },
            app: {
                options: {
                    config: '<%=cmp().dir %>/src/config.yml',
                    main: [
                        'scripts/app-config.js',
                        'scripts/app.js',
                        'scripts/app-views.js'
                    ]
                }
            },
            mod: {
                options: {
                    config: '<%=cmp().dir %>/src/config.yml',
                    main: [
                        'scripts/mod.js',
                        'scripts/mod-views.js'
                    ]
                }
            },
            lib:{
                options:{
                    src: '<%=cmp().dir %>'
                }
            },
            template: {
                options: {
                    config: '<%=cmp().dir %>/src/config.yml',
                    main: []
                }
            },
            portal: {
            }
        },
        ...
    }

###  cmpConfig:
dynamically generate config object,
stored in the field specified in the 'options.set'. (For example cmp().config )
and save as js file.

    var taskConfig = {
        ..
        cmpConfig: {
            app: {
                options: {
                    baseConfig: './config.yml',
                    configField: 'config',
                    pathField: 'path',
                    write: {
                        jsVariable: '_<%=cmp().name %>AppConfig', //global javascript variable for jsFile
                        jsFile: '<%=cmp().dest %>/scripts/app-config.js',
                        yamlFile: '<%=cmp().dest %>/scripts/app-config.yml'
                    }

                }
            }
        },
        ...
    }

###  cmp().getScripts(), cmp().getLinks() methods
dynamically collect html scripts or html link from current and dependency cmp() objects

        cmpUtil.getCmp().getScripts('/','path','main',true);

        cmpUtil.getCmp().getLinks('/','path','main',true);


and for example use cmp fields in assemble.io

        assemble: {
            options: {
                layoutdir: '<%=cmp(cmp().template).src %>/_layouts',
                layout: 'default.hbs',
                partials: '<%=cmp(cmp().template).src %>/_includes/*.hbs',
                flatten: true,
                hbs:{
                    assets: '/<%=cmp(cmp().template).path %>',
                    name: '<%=cmp().name %>App',
                    title: '<%=cmp().config.app.title %>',
                    scripts: function(){
                        return cmpUtil.getCmp().getScripts('/','path','main');
                    },
                    links: function(){
                        return cmpUtil.getCmp().getLinks('/','path','main');
                    }
                }
            },
            app: {
                src: ['<%=cmp().src %>/<%=cmp().name %>.hbs'],
                dest: '<%=params.build %>'
            },
            appMin: {
                options: {
                    hbs: {
                        scripts: function () {
                            return cmpUtil.getCmp().getScripts('/', 'path', 'main',true);
                        }
                    }
                },
                src: ['<%=cmp().src %>/<%=cmp().name %>.hbs'],
                dest: '<%=params.build %>'
            }
        },
