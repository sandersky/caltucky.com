module.exports = {
  plugins: [
    require('postcss-import')(),
    require('postcss-for')(),
    require('postcss-cssnext')({
      browsers: ['last 2 versions', '> 5%'],
    }),
  ],
}
