import { task, src, dest } from 'gulp';
import inlinesource from 'gulp-inline-source';
import replace from 'gulp-replace';

task('default', () => {
  return src('./build/*.html')
    .pipe(replace('.js"></script>', '.js" inline></script>'))
    .pipe(replace('rel="stylesheet">', 'rel="stylesheet" inline>'))
    .pipe(
      inlinesource({
        compress: false,
        ignore: ['png', 'svg', 'jpg'],
      }),
    )
    .pipe(dest('./build'));
});
