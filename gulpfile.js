const gulp = require('gulp');
const gulpSass = require('gulp-sass')(require('sass'));
const gulpBabel = require('gulp-babel');
const gulpRename = require('gulp-rename');
const gulpReplace = require('gulp-replace');
const gulpCleanCSS = require('gulp-clean-css');
const gulpBabelMinify = require('gulp-babel-minify');

gulp.task('styles:scss', () => {
    return gulp.src('./src/assets/styles/*.scss').pipe(gulpSass()).pipe(gulpRename((file) => {
        file.basename += '.min';
    })).pipe(gulp.dest('./dist/styles'));
});

gulp.task('styles:minify', async () => {
    const { default: gulpAutoprefixer } = await import('gulp-autoprefixer');
    return gulp.src('./src/assets/styles/*.css').pipe(gulpAutoprefixer({
        cascade: false
    })).pipe(gulpCleanCSS({
        level: {
            1: {
                specialComments: 0,
                tidySelectors: false
            },
            2: {
                restructureRules: false,
                mergeSemantically: false
            }
        },
        compatibility: {
            properties: {
                variables: false
            }
        }
    })).pipe(gulpReplace('--tw-', '--elcreative-')).pipe(gulp.dest('./dist/assets/styles'));
});

gulp.task('scripts:minify', () => {
    return gulp.src([
        './dist/assets/scripts/*.js',
    ]).pipe(gulpBabel({
        configFile: './.babelrc'
    })).pipe(gulpBabelMinify({
        mangle: {
            keepClassName: true,
        },
        builtIns: false,
        evaluate: false,
        removeConsole: true,
        removeDebugger: true
    })).pipe(gulp.dest('./dist/assets/scripts'));
});

gulp.task('watch', gulp.series(
    'styles:scss',
    'styles:minify',
    'scripts:minify',
));

gulp.task('build', gulp.series(
    'styles:scss',
    'styles:minify',
    'scripts:minify',
));