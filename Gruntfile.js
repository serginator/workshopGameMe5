'use strict';

/**
 * @param {Object} grunt
 */
module.exports = function (grunt) {

    var SRC_DIR = 'src/',
        REPORTS_DIR = 'reports/';

    // This will load all packages instead of loading here one by one
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                jshintignore: '.jshintignore',
                reporter: require('jshint-stylish')
            },
            src: {
                options: {
                    globals: {
                        module: true,
                        setTimeout: true,
                        localStorage: true
                    }
                },
                files: {
                    src: [SRC_DIR + '**/*.js']
                }
            },
            gruntfile: {
                files: {
                    src: 'Gruntfile.js'
                }
            }
        },
        gjslint: {
            options: {
                flags: [
                    '--disable 220' //ignore error code 220 from gjslint
                    ],
                reporter: {
                    name: 'console'
                },
                force: true
            },
            src: {
                src: [SRC_DIR + '**/*.js']
            }
        },
        watch: {
            gruntfile: {
                files: ['Gruntfile.js'],
                tasks: ['jshint:gruntfile']
            },
            src: {
                files: [SRC_DIR + '**/*.js'],
                tasks: ['jshint:src', 'gjslint:src']
            }
        },
        connect: {
            server: {
                options: {
                    port: 8000,
                    base: 'src',
                    open: 'http://localhost:8000/index.html',
                    keepalive: true
                }
            }
        }
    });

    grunt.registerTask('default', [
        'connect'
    ]);

    grunt.registerTask('lint', [
        'jshint', 'gjslint'
    ]);

};
