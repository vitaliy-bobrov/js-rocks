module.exports = ctx => ({
  plugins: {
    autoprefixer: true,
    cssnano: {
      preset: [
        'default',
        {
          discardComments: {
            removeAll: true
          },
          reduceIdents: true,
          cssDeclarationSorter: true
        }
      ]
    }
  }
});
