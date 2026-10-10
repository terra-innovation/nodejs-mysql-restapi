const { default: tsJest } = require("ts-jest");

// Prisma 7 genera ESM con import.meta. Conservar ese formato incluso cuando
// Jest inicia la carga desde una suite CommonJS mediante require(esm).
module.exports = {
  createTransformer(options) {
    const transformer = tsJest.createTransformer({ ...options, useESM: true });
    const esmOptions = options => ({ ...options, supportsStaticESM: true });

    return {
      getCacheKey(source, path, options) {
        return transformer.getCacheKey(source, path, esmOptions(options));
      },
      process(source, path, options) {
        return transformer.process(source, path, esmOptions(options));
      },
    };
  },
};
