/// <binding AfterBuild='default' />
module.exports = function (grunt) {

    grunt.initConfig({
        uglify: {
            options: {
                compress: {
                    global_defs: {
                        'DEBUG': false
                    },
                    dead_code: true
                }
            },
            my_target: {
                files: {
                    'public/javascripts/flashtease.min.js': ['public/javascripts/flashtease.js'],
                    'public/javascripts/main.min.js': ['public/javascripts/main.js']
                }
            }
        },
        cssmin: {
            target: {
                files: {
                    'public/stylesheets/main.min.css': ['public/stylesheets/main.css'],
                    'public/stylesheets/tease.min.css': ['public/stylesheets/tease.css'],
                    'public/stylesheets/tease.default.min.css': ['public/stylesheets/tease.default.css'],
                    'public/stylesheets/tease.plain.min.css': ['public/stylesheets/tease.plain.css']
                }
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    
    grunt.registerTask('default', ['uglify', 'cssmin']);
};