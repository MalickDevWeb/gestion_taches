// generate-structure.js
import fs from 'fs';
import path from 'path';

const baseDir = path.join(process.cwd(), 'project-root');

const structure = {
  src: {
    modules: {
      users: [
        'user.controller.ts',
        'user.service.ts',
        'user.repository.ts',
        'user.model.ts',
        'user.routes.ts',
        'index.ts'
      ],
      auth: [
        'auth.controller.ts',
        'auth.service.ts',
        'auth.routes.ts',
        'index.ts'
      ],
      tasks: [
        'task.controller.ts',
        'task.service.ts',
        'task.routes.ts'
      ]
    },
    core: {
      entities: [
        'user.entity.ts',
        'task.entity.ts'
      ],
      interfaces: [
        'user.repository.interface.ts',
        'task.repository.interface.ts'
      ],
      utils: [
        'responseHandler.ts',
        'errorHandler.ts',
        'logger.ts'
      ]
    },
    infrastructure: {
      database: [
        'prisma.service.ts',
        'prisma.module.ts',
        'index.ts'
      ],
      config: [
        'env.ts',
        'constants.ts'
      ]
    },
    api: [
      'users.ts',
      'auth.ts',
      'tasks.ts'
    ],
    'server.ts': null,
    'app.ts': null
  }
};

function createStructure(base, obj) {
  for (const [key, value] of Object.entries(obj)) {
    const newPath = path.join(base, key);
    if (Array.isArray(value)) {
      fs.mkdirSync(newPath, { recursive: true });
      value.forEach(file => {
        const filePath = path.join(newPath, file);
        if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, `// ${file}\n`);
      });
    } else if (value === null) {
      fs.writeFileSync(newPath, `// ${key}\n`);
    } else if (typeof value === 'object') {
      fs.mkdirSync(newPath, { recursive: true });
      createStructure(newPath, value);
    }
  }
}

createStructure(baseDir, structure);

console.log('Structure générée avec succès !');
