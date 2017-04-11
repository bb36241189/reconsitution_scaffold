// Generated on 2017-03-22 using generator-angular 0.15.1
'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var openURL = require('open');
var lazypipe = require('lazypipe');
var rimraf = require('rimraf');
var transfob = require('transfob');
var promise = require("gulp-promise");
var wiredep = require('wiredep').stream;
var runSequence = require('run-sequence');
var replace = require('gulp-replace');
var gulpFunction = require('gulp-function');
var Q = require("q");

var yeoman = {
  app: require('./bower.json').appPath || 'app',
  dist: 'dist'
};

var paths = {
  scripts: [yeoman.app + '/scripts/**/*.js'],
  styles: [yeoman.app + '/styles/**/*.css'],
  test: ['test/spec/**/*.js'],
  testRequire: [
    yeoman.app + '/bower_components/angular/angular.js',
    yeoman.app + '/bower_components/angular-mocks/angular-mocks.js',
    yeoman.app + '/bower_components/angular-resource/angular-resource.js',
    yeoman.app + '/bower_components/angular-cookies/angular-cookies.js',
    yeoman.app + '/bower_components/angular-sanitize/angular-sanitize.js',
    yeoman.app + '/bower_components/angular-route/angular-route.js',
    'test/mock/**/*.js',
    'test/spec/**/*.js'
  ],
  karma: 'karma.conf.js',
  views: {
    main: yeoman.app + '/index.html',
    files: [yeoman.app + '/views/**/*.html']
  }
};

////////////////////////
// Reusable pipelines //
////////////////////////

var lintScripts = lazypipe()
  .pipe($.jshint, '.jshintrc')
  .pipe($.jshint.reporter, 'jshint-stylish');

var styles = lazypipe()
  .pipe($.autoprefixer, 'last 1 version')
  .pipe(gulp.dest, '.tmp/styles');

///////////
// Tasks //
///////////

gulp.task('styles', function () {
  return gulp.src(paths.styles)
    .pipe(styles());
});

gulp.task('lint:scripts', function () {
  return gulp.src(paths.scripts)
    .pipe(lintScripts());
});

gulp.task('clean:tmp', function (cb) {
  rimraf('./.tmp', cb);
});

gulp.task('start:client', ['start:server', 'styles'], function () {
  openURL('http://localhost:9000');
});

gulp.task('start:server', function() {
  $.connect.server({
    root: [yeoman.app, '.tmp'],
    livereload: true,
    // Change this to '0.0.0.0' to access the server from outside.
    port: 9000
  });
});

gulp.task('start:server:test', function() {
  $.connect.server({
    root: ['test', yeoman.app, '.tmp'],
    livereload: true,
    port: 9001
  });
});

gulp.task('watch', function () {
  $.watch(paths.styles)
    .pipe($.plumber())
    .pipe(styles())
    .pipe($.connect.reload());

  $.watch(paths.views.files)
    .pipe($.plumber())
    .pipe($.connect.reload());

  $.watch(paths.scripts)
    .pipe($.plumber())
    .pipe(lintScripts())
    .pipe($.connect.reload());

  $.watch(paths.test)
    .pipe($.plumber())
    .pipe(lintScripts());

  gulp.watch('bower.json', ['bower']);
});

gulp.task('serve', function (cb) {
  runSequence('clean:tmp',
    ['lint:scripts'],
    ['start:client'],
    'watch', cb);
});

gulp.task('serve:prod', function() {
  $.connect.server({
    root: [yeoman.dist],
    livereload: true,
    port: 9000
  });
});

gulp.task('test', ['start:server:test'], function () {
  var testToFiles = paths.testRequire.concat(paths.scripts, paths.test);
  return gulp.src(testToFiles)
    .pipe($.karma({
      configFile: paths.karma,
      action: 'watch'
    }));
});

// inject bower components
gulp.task('bower', function () {
  return gulp.src(paths.views.main)
    .pipe(wiredep({
      directory: yeoman.app + '/bower_components',
      ignorePath: '..'
    }))
  .pipe(gulp.dest(yeoman.app + '/views'));
});

///////////
// Build //
///////////

gulp.task('clean:dist', function (cb) {
  rimraf('./dist', cb);
});

gulp.task('client:build', ['html', 'styles'], function () {
  var jsFilter = $.filter('**/*.js');
  var cssFilter = $.filter('**/*.css');

  return gulp.src(paths.views.main)
    .pipe($.useref({searchPath: [yeoman.app, '.tmp']}))
    .pipe(jsFilter)
    .pipe($.ngAnnotate())
    .pipe($.uglify())
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    .pipe($.minifyCss({cache: true}))
    .pipe(cssFilter.restore())
    .pipe($.rev())
    .pipe($.revReplace())
    .pipe(gulp.dest(yeoman.dist));
});

gulp.task('html', function () {
  return gulp.src(yeoman.app + '/views/**/*')
    .pipe(gulp.dest(yeoman.dist + '/views'));
});

gulp.task('images', function () {
  return gulp.src(yeoman.app + '/images/**/*')
    .pipe($.cache($.imagemin({
        optimizationLevel: 5,
        progressive: true,
        interlaced: true
    })))
    .pipe(gulp.dest(yeoman.dist + '/images'));
});

gulp.task('copy:extras', function () {
  return gulp.src(yeoman.app + '/*/.*', { dot: true })
    .pipe(gulp.dest(yeoman.dist));
});

gulp.task('copy:fonts', function () {
  return gulp.src(yeoman.app + '/fonts/**/*')
    .pipe(gulp.dest(yeoman.dist + '/fonts'));
});

gulp.task('build', ['clean:dist'], function () {
  runSequence(['images', 'copy:extras', 'copy:fonts', 'client:build']);
});

gulp.task('default', ['build']);

/*****阿斯顿发生大法******/

function testPromise(){
  var myProm = new promise(function() {
    console.log('bbbb');
  });
  myProm.deliverPromise()
}

gulp.task('table_button$general_button', function(){
  gulp.src([yeoman.app+'/rc/static/reconsitution/views/**/*.html'])
    .pipe(replace(/(<button)((?!class).)*(class=\"table_button general_button\")/g, function (str,m1,m2,m3) {
          var ret = str.replace("table_button general_button","btn btn-padding btn-status-blueLake");
          console.log(ret);
          return ret;
      }))
    .pipe(gulp.dest(yeoman.app+'/rc/static/reconsitution/views_2'));
});

gulp.task('table_button$disabled_button', function(){
  gulp.src([yeoman.app+'/rc/static/reconsitution/views/**/*.html'])
    .pipe(replace(/(<button)((?!class).)*(class=\"table_button disabled_button\")/g, function (str,m1,m2,m3) {
          var ret = str.replace("table_button general_button","btn btn-padding btn-status-blueLake disabled");
          console.log(ret);
          return ret;
      }))
    .pipe(gulp.dest(yeoman.app+'/rc/static/reconsitution/views_2'));
});

gulp.task('toolbar_container', function(){
  gulp.src([yeoman.app+'/rc/static/reconsitution/views/**/*.html'])
    .pipe(replace(/(<div[\s]*class="row">)((?!id="toolbar_container)[\s\S])*(id="toolbar_container">)(((?!<\/div>)[\s\S])*(<\/div>))((?!<\/div>)[\s\S])*(<\/div>)((?!<\/div>)[\s\S])*(<\/div>)((?!<\/div>)[\s\S])*(<\/div>)/g, function (str,m1,m2,m3,m4,m5,m6,m7,m8,m9) {
          var retStr = '<div class="sim-fictiNave f-cb">\n'+m4+'</div>';
          return str;
      }))
    .pipe(gulp.dest(yeoman.app+'/rc/static/reconsitution/views_2'));
});

gulp.task('angular_scope_data', function(){
  gulp.src([yeoman.app+'/rc/static/reconsitution/controller/**/*.js'])
    .pipe(replace(/((\$scope.data)[\s]*[=][\s]*[\{])/g, function (str,m1,m2,m3,m4,m5,m6,m7,m8,m9) {
        console.log('m1:'+m1);
        return m1+"\nPermitStatus : PermitStatus\,";
      }))
    .pipe(gulp.dest(yeoman.app+'/rc/static/reconsitution/controller_2'));
});
gulp.task('angular_controller_inject', function(){
  gulp.src([yeoman.app+'/rc/static/reconsitution/controller/**/*.js'])
    .pipe(replace(/((app.controller)[\s]*[\(][\s]*[\'"][\w]*[\'"][\s]*[\,][\s]*[\[]((?!function)[\s\S])*)/g, function (str,m1,m2,m3,m4,m5,m6,m7,m8,m9) {
        console.log('m1:'+m1);
        return m1+"'PermitStatus',";
      }))
    .pipe(gulp.dest(yeoman.app+'/rc/static/reconsitution/controller_2'));
});

gulp.task('angular_controller_inject_extra', function(){
  gulp.src([yeoman.app+'/rc/static/reconsitution/controller/**/*.js'])
    .pipe(replace(/((app.controller)[\s]*[\(][\s]*[\'"][\w]*[\'"][\s]*[\,][\s]*[\[]((?!function)[\s\S])*(function)[\s]*[\(][^)]*)/g, function (str,m1,m2,m3,m4,m5,m6,m7,m8,m9) {
        console.log('m1:'+m1);
        return m1+",PermitStatus";
      }))
    .pipe(gulp.dest(yeoman.app+'/rc/static/reconsitution/controller_2'));
});


gulp.task('angular_controller_injectParam', function(){
  gulp.src([yeoman.app+'/rc/static/reconsitution/controller/**/*.js'])
    .pipe(replace(/((app\.controller)[\s]*(\()[\s]*["\'](\w)*["\'][\s]*[\,][\s]*(function)[^\)]*)/g, function (str,m1,m2,m3,m4,m5,m6,m7,m8,m9) {
          console.log('m1:'+m1);
          return m1+',PermitStatus';
      }))
    .pipe(gulp.dest(yeoman.app+'/rc/static/reconsitution/controller_2'));
});

gulp.task( 'jquery_ajax_getting_iterator', function() {
  return gulp.src([yeoman.app+'/rc/static/reconsitution/controller/**/*.js'])
    .pipe( transfob( function( file, enc, next ) {
        var filePath = file.history[0],targetServerName = file.history[0].split('\\').reverse()[0].split('.')[0]+'.server.js',
             serverUrlDefineName = file.history[0].split('\\').reverse()[0].split('.')[0]+'UrlSetting',
             serverDefinedName = file.history[0].split('\\').reverse()[0].split('.')[0]+'Server',
             factoryUrlStrArray = ['app.factory(\''+serverUrlDefineName+'\',[function () {',
                                  '    return {',
                                  '        changeUserPwd : project_url + \'/user/{user_id}/password\'',
                                  '    }',
                                  '}]);'],result;
        var contentUrl = jquery_url_getting(filePath, function (){
          result = insertArray(factoryUrlStrArray,contentUrl);
          console.log(result.join(""));
        });
      //next( null, file );
    }) );
});

function insertArray(array1,array2){
  var index = 2;
  array2.unshift(index, 0);Array.prototype.splice.apply(array1, array2);
  return array1;
}

function jquery_url_getting(filePath,callback){
  var urlArray = [],myProm = new promise(callback);
  gulp.src(filePath)
    .pipe(replace(/(\$.ajax[\s]*[\(][\s]*)([\{]((?!}[\s]*\))[\s\S])*})/g, function (str,m1,m2,m3,m4,m5,m6,m7,m8,m9) {
        var AjaxConfig = m2,url = getValueFromFadeJson('url',AjaxConfig),type = getValueFromFadeJson('type',AjaxConfig);
        type = type.substring(2,type.length - 1).toLowerCase();
        urlArray.push('        '+type+'bb : '+url+'');
        console.log('m1:'+ m1);
        //console.log('m2:'+ m2);
        //console.log('m3:'+ m3);
        //console.log('m4:'+ m4);
        //console.log('m5:'+ m5);
        //console.log('m6:'+ m6);
        //console.log('m7:'+ m7);
        //console.log('m8:'+ m8);

        return str;
    }))
    .pipe(gulpFunction.atEnd(function () {
        myProm.deliverPromise();
      }))
    .pipe(gulp.dest(yeoman.app+'/rc/static/reconsitution/controller_2'))
  return urlArray
}


function getValueFromFadeJson(key,json){
  var reg = new RegExp('('+key+')[\s]*[\:][^,]*','g'),ret;
  ret = reg.exec(json);
  if(ret&&ret[0]){
    return ret[0].split(':')[1];
  }else{
    return null;
  }
}

gulp.task('angular_controller_injectting', function(){
  gulp.src([yeoman.app+'/rc/static/reconsitution/controller/**/*.js'])
    .pipe(replace(/((app.controller)[\s]*[\(][\s]*[\'"][\w]*[\'"][\s]*[\,][\s]*[\[]((?!function)[\s\S])*)/g, function (str,m1,m2,m3,m4,m5,m6,m7,m8,m9) {
        console.log('m1:'+m1);
        return m1+"'PermitStatus',";
      }))
      .pipe(replace(/((app.controller)[\s]*[\(][\s]*[\'"][\w]*[\'"][\s]*[\,][\s]*[\[]((?!function)[\s\S])*(function)[\s]*[\(][^)]*)/g, function (str,m1,m2,m3,m4,m5,m6,m7,m8,m9) {
        console.log('m1:'+m1);
        return m1+",PermitStatus";
      }))
       .pipe(replace(/((app\.controller)[\s]*(\()[\s]*["\'](\w)*["\'][\s]*[\,][\s]*(function)[^\)]*)/g, function (str,m1,m2,m3,m4,m5,m6,m7,m8,m9) {
          console.log('m1:'+m1);
          return m1+',PermitStatus';
      }))
    .pipe(gulp.dest(yeoman.app+'/rc/static/reconsitution/controller_2'));
});
