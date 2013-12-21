'use strict';

/**
 * @param {Object} grunt
 */
module.exports = function (grunt) {

    var SRC_DIR = 'src/',
        REPORTS_DIR = 'reports/',
        OUTPUT_DIR = 'dist/';

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
                    '--disable 220', //ignore error code 220 from gjslint
                    '--disable 110' // ignore line too long
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
        },
        clean: [OUTPUT_DIR + '**(!.git)'],
        copy: {
            main: {
                files: [
                    {expand: true, cwd: SRC_DIR, src: ['images/**'], dest: OUTPUT_DIR},
                    {expand: true, cwd: SRC_DIR, src: ['music/**'], dest: OUTPUT_DIR},
                    {expand: true, cwd: SRC_DIR, src: ['css/**'], dest: OUTPUT_DIR},
                    {expand: true, cwd: SRC_DIR, src: ['index.html'], dest: OUTPUT_DIR}
                ]
            }
        },
        requirejs: {
            options: {
                baseUrl: SRC_DIR + 'js/',
                cjsTranslate: true,
                useStrict: true,
                preserveLicenseComments: false,
                generateSourceMaps: true,
                optimize: 'uglify2',
                include: ['almond.js'] // runtime de requirejs
            },
            core: {
                options: {
                    name: 'main',
                    out: 'dist/js/main.js',
                    uglify2: {
                        report: 'gzip'
                    }
                }
            }
        },
        compress: {
            core: {
                options: {
                    archive: 'dist/<%= pkg.name %>-<%= pkg.version %>.zip'
                },
                files: [
                    {expand: true, cwd: 'dist/', src: ['**'], dest: ''}
                ]
            }
        },
        githubPages: {
            target: {
                options: {
                    commitMessage: 'Pushed version <%= pkg.version %>'
                },
                src: OUTPUT_DIR
            }
        }
    });

    grunt.registerTask('default', [
        'connect'
    ]);

    grunt.registerTask('lint', [
        'jshint', 'gjslint'
    ]);

    grunt.registerTask('dist', [
        'clean', 'requirejs', 'copy'
    ]);

    grunt.registerTask('build', [
        'lint', 'dist', 'compress'
    ]);

    grunt.registerTask('deploy', [
        'lint', 'dist', 'githubPages'
    ]);

};
