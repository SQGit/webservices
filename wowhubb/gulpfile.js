const gulp = require('gulp');

gulp.task('watch', () => gulp.watch('app/**/*.js', (event) => {
  console.log(`File ${event.path} was ${event.type}, running tasks...`);
}));


gulp.task('default', ['watch']);
