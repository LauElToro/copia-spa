/**
 * Sequenciador básico para Jest.
 * Evita la dependencia de `@jest/test-sequencer`, que provoca errores de resolución
 * en entornos con restricciones de filesystem.
 */

class SimpleSequencer {
  sort(tests) {
    return [...tests].sort((a, b) => a.path.localeCompare(b.path));
  }

  shard(tests, options) {
    if (!options || options.shardCount <= 1) {
      return this.sort(tests);
    }

    const orderedTests = this.sort(tests);
    const shardSize = Math.ceil(orderedTests.length / options.shardCount);
    const shardIndex = Math.max(0, Math.min(options.shardIndex - 1, options.shardCount - 1));
    const start = shardSize * shardIndex;
    const end = start + shardSize;

    return orderedTests.slice(start, end);
  }

  cacheResults() {
    // Intencionalmente vacío: no almacenamos resultados en caché en este entorno.
  }

  allFailedTests(tests) {
    return this.sort(tests);
  }

  hasFailed() {
    return false;
  }

  time() {
    return undefined;
  }
}

module.exports = SimpleSequencer;

