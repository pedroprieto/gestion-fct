module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
	files: ['Gruntfile.js', 'fct.js', 'models/*.js', 'resources/*.js']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['jshint']);

};
