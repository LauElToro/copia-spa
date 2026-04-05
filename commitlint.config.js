module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nueva funcionalidad
        'fix',      // Corrección de bugs
        'docs',     // Cambios en documentación
        'style',    // Cambios de formato (espacios, punto y coma, etc.)
        'refactor', // Refactorización de código
        'perf',     // Mejoras de rendimiento
        'test',     // Añadir o corregir tests
        'build',    // Cambios en el sistema de build o dependencias
        'ci',       // Cambios en configuración de CI
        'chore',    // Otras tareas de mantenimiento
        'revert',   // Revertir commits anteriores
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'subject-case': [0],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 150],
  },
};

