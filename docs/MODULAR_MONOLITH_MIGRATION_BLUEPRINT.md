# 🏗️ Modular Monolith Migration Blueprint

**From:** Monolithic Architecture (1001-line `server_fixed.js`)  
**To:** Modular Monolith (organized domain modules with clear boundaries)  
**Timeline:** 7-8 weeks  
**Risk Level:** Low (incremental, no deployment changes)

---

## 🎯 Why Modular Monolith?

### Current Pain Points
- ❌ 1001 lines in one file (`server_fixed.js`)
- ❌ Hard to navigate and maintain
- ❌ Difficult to test (must mock entire server)
- ❌ Merge conflicts when multiple developers work on same file
- ❌ Business logic mixed with HTTP handlers
- ❌ No clear separation of concerns

### After Migration
- ✅ Each domain in its own folder (~100-200 lines per file)
- ✅ Easy to navigate (predictable structure)
- ✅ Testable units (mock repositories, test services)
- ✅ Team can work on different modules without conflicts
- ✅ Clear layering: Routes → Controllers → Services → Repositories
- ✅ Maintainable and scalable

---

## 📐 Target Architecture

```
src/
├── server.ts                    # Entry point (~50 lines)
├── app.ts                       # Express app setup (~100 lines)
├── config/                      # Configuration
│   ├── database.ts
│   ├── firebase.ts
│   └── environment.ts
│
├── modules/                     # 🆕 Domain modules
│   ├── auth/
│   │   ├── auth.routes.ts       # Express router
│   │   ├── auth.controller.ts   # HTTP handlers
│   │   ├── auth.service.ts      # Business logic
│   │   ├── auth.repository.ts   # Database queries
│   │   ├── auth.middleware.ts   # Auth middleware
│   │   └── auth.types.ts        # TypeScript interfaces
│   │
│   ├── lessons/
│   │   ├── lessons.routes.ts
│   │   ├── lessons.controller.ts
│   │   ├── lessons.service.ts
│   │   ├── lessons.repository.ts
│   │   └── lessons.types.ts
│   │
│   ├── progress/
│   │   ├── progress.routes.ts
│   │   ├── progress.controller.ts
│   │   ├── progress.service.ts
│   │   └── progress.repository.ts
│   │
│   ├── gamification/           # XP, badges, achievements
│   │   ├── gamification.routes.ts
│   │   ├── xp.service.ts
│   │   ├── badges.service.ts
│   │   ├── achievements.service.ts
│   │   ├── gamification.repository.ts
│   │   └── gamification.types.ts
│   │
│   ├── challenges/
│   │   └── ... (similar structure)
│   │
│   ├── notifications/
│   │   └── ... (similar structure)
│   │
│   └── analytics/
│       └── ... (similar structure)
│
├── shared/                      # 🆕 Shared utilities
│   ├── middleware/
│   │   ├── error-handler.ts     # Centralized error handling
│   │   ├── async-handler.ts     # Wrap async routes
│   │   ├── validate-request.ts  # Request validation
│   │   └── role-guard.ts        # Role-based access control
│   │
│   ├── utils/
│   │   ├── logger.ts            # Winston/Pino logger
│   │   ├── response.ts          # Standardized responses
│   │   └── db-helpers.ts        # DB utility functions
│   │
│   └── types/
│       └── common.ts            # Shared TypeScript types
│
└── database/
    ├── db.ts                    # Database connection
    ├── migrations/              # Schema versioning
    │   ├── 001_initial_schema.sql
    │   └── 002_add_achievements.sql
    └── seeds/
        └── seed_mvp_fixed.js
```

---

## 📋 Module Structure Pattern

**Each module follows this consistent pattern:**

```typescript
// Example: modules/lessons/

// 1. Routes Layer (HTTP routing)
// lessons.routes.ts
import { Router } from 'express';
import * as controller from './lessons.controller';
import { verifyFirebaseToken } from '@/shared/middleware';

const router = Router();

router.get('/', verifyFirebaseToken, controller.getAllLessons);
router.get('/:id', verifyFirebaseToken, controller.getLessonById);
router.get('/:id/pages', verifyFirebaseToken, controller.getLessonPages);

export default router;

// 2. Controller Layer (HTTP request/response handling)
// lessons.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as service from './lessons.service';
import { asyncHandler } from '@/shared/middleware/async-handler';

export const getAllLessons = asyncHandler(async (req: Request, res: Response) => {
  const lessons = await service.getAllLessons();
  res.json({ success: true, data: lessons });
});

export const getLessonById = asyncHandler(async (req: Request, res: Response) => {
  const lesson = await service.getLessonById(Number(req.params.id));
  res.json({ success: true, data: lesson });
});

// 3. Service Layer (Business logic)
// lessons.service.ts
import * as repository from './lessons.repository';
import { Lesson } from './lessons.types';

export const getAllLessons = async (): Promise<Lesson[]> => {
  const lessons = await repository.findAll();
  // Apply business logic: filtering, enrichment, etc.
  return lessons.filter(lesson => lesson.published === true);
};

export const getLessonById = async (id: number): Promise<Lesson | null> => {
  const lesson = await repository.findById(id);
  if (!lesson) {
    throw new Error('Lesson not found');
  }
  // Enrich with additional data if needed
  return lesson;
};

// 4. Repository Layer (Database access)
// lessons.repository.ts
import db from '@/database/db';
import { Lesson } from './lessons.types';

export const findAll = (): Promise<Lesson[]> => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM lessons ORDER BY id', (err, rows) => {
      if (err) reject(err);
      else resolve(rows as Lesson[]);
    });
  });
};

export const findById = (id: number): Promise<Lesson | null> => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM lessons WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row ? (row as Lesson) : null);
    });
  });
};

// 5. Types Layer (TypeScript interfaces)
// lessons.types.ts
export interface Lesson {
  id: number;
  title: string;
  description: string;
  content?: string;
  asset_url?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface LessonPage {
  id: number;
  lesson_id: number;
  page_number: number;
  content: string;
}
```

---

## 🗓️ 8-Week Migration Plan

### **Week 1: Preparation & Setup**

**Goals:**
- Set up TypeScript
- Create folder structure
- Set up testing framework

**Tasks:**
1. ✅ Install TypeScript dependencies
   ```bash
   npm install --save-dev typescript @types/node @types/express ts-node nodemon
   npm install --save-dev @types/cors @types/body-parser
   ```

2. ✅ Create `tsconfig.json`
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "commonjs",
       "lib": ["ES2020"],
       "outDir": "./dist",
       "rootDir": "./src",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true,
       "resolveJsonModule": true,
       "moduleResolution": "node",
       "baseUrl": ".",
       "paths": {
         "@/*": ["src/*"],
         "@modules/*": ["src/modules/*"],
         "@shared/*": ["src/shared/*"]
       }
     },
     "include": ["src/**/*"],
     "exclude": ["node_modules", "dist"]
   }
   ```

3. ✅ Update `package.json` scripts
   ```json
   {
     "scripts": {
       "dev": "nodemon --watch src --exec ts-node src/server.ts",
       "build": "tsc",
       "start": "node dist/server.js",
       "test": "jest",
       "lint": "eslint src --ext .ts"
     }
   }
   ```

4. ✅ Create folder structure
   ```bash
   mkdir -p src/modules/{auth,lessons,progress,gamification,challenges,notifications,analytics}
   mkdir -p src/shared/{middleware,utils,types}
   mkdir -p src/config
   ```

5. ✅ Set up Jest
   ```bash
   npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
   npx ts-jest config:init
   ```

**Deliverable:** TypeScript setup complete, folder structure ready

---

### **Week 2: Extract Lessons Module**

**Goals:**
- Move lesson-related endpoints to `modules/lessons/`
- Set up route/controller/service/repository pattern

**Endpoints to Migrate:**
- `GET /lessons`
- `GET /lesson-pages/:lesson_id`
- `GET /test/lessons`
- `GET /test/lesson-pages/:lesson_id`

**Tasks:**

1. ✅ Create lessons module files
   ```bash
   touch src/modules/lessons/lessons.routes.ts
   touch src/modules/lessons/lessons.controller.ts
   touch src/modules/lessons/lessons.service.ts
   touch src/modules/lessons/lessons.repository.ts
   touch src/modules/lessons/lessons.types.ts
   ```

2. ✅ Define types (`lessons.types.ts`)
   ```typescript
   export interface Lesson {
     id: number;
     title: string;
     description: string;
     content?: string;
     asset_url?: string;
   }

   export interface LessonPage {
     id: number;
     lesson_id: number;
     page_number: number;
     content: string;
   }
   ```

3. ✅ Implement repository (`lessons.repository.ts`)
   ```typescript
   import db from '@/database/db';
   import { Lesson, LessonPage } from './lessons.types';

   export const findAll = (): Promise<Lesson[]> => {
     return new Promise((resolve, reject) => {
       db.all('SELECT * FROM lessons', (err, rows) => {
         if (err) reject(err);
         else resolve(rows as Lesson[]);
       });
     });
   };

   export const findPagesByLessonId = (lessonId: number): Promise<LessonPage[]> => {
     return new Promise((resolve, reject) => {
       db.all(
         'SELECT * FROM lesson_pages WHERE lesson_id = ? ORDER BY page_number',
         [lessonId],
         (err, rows) => {
           if (err) reject(err);
           else resolve(rows as LessonPage[]);
         }
       );
     });
   };
   ```

4. ✅ Implement service (`lessons.service.ts`)
   ```typescript
   import * as repository from './lessons.repository';
   import { Lesson, LessonPage } from './lessons.types';

   export const getAllLessons = async (): Promise<Lesson[]> => {
     return repository.findAll();
   };

   export const getLessonPages = async (lessonId: number): Promise<LessonPage[]> => {
     return repository.findPagesByLessonId(lessonId);
   };
   ```

5. ✅ Implement controller (`lessons.controller.ts`)
   ```typescript
   import { Request, Response } from 'express';
   import * as service from './lessons.service';

   export const getAllLessons = async (req: Request, res: Response) => {
     try {
       const lessons = await service.getAllLessons();
       res.json(lessons);
     } catch (error) {
       res.status(500).json({ error: 'Failed to fetch lessons' });
     }
   };

   export const getLessonPages = async (req: Request, res: Response) => {
     try {
       const lessonId = Number(req.params.lesson_id);
       const pages = await service.getLessonPages(lessonId);
       res.json(pages);
     } catch (error) {
       res.status(500).json({ error: 'Failed to fetch lesson pages' });
     }
   };
   ```

6. ✅ Set up routes (`lessons.routes.ts`)
   ```typescript
   import { Router } from 'express';
   import * as controller from './lessons.controller';
   import { verifyFirebaseToken } from '@/shared/middleware/auth';

   const router = Router();

   router.get('/', verifyFirebaseToken, controller.getAllLessons);
   router.get('/:lesson_id/pages', verifyFirebaseToken, controller.getLessonPages);

   export default router;
   ```

7. ✅ Register routes in main app (`app.ts`)
   ```typescript
   import lessonsRoutes from './modules/lessons/lessons.routes';
   
   app.use('/lessons', lessonsRoutes);
   app.use('/lesson-pages', lessonsRoutes); // Redirect old endpoint
   ```

8. ✅ Write tests (`lessons.service.test.ts`)
   ```typescript
   import * as service from './lessons.service';
   import * as repository from './lessons.repository';

   jest.mock('./lessons.repository');

   describe('Lessons Service', () => {
     it('should return all lessons', async () => {
       const mockLessons = [
         { id: 1, title: 'Test Lesson', description: 'Test' }
       ];
       (repository.findAll as jest.Mock).mockResolvedValue(mockLessons);

       const result = await service.getAllLessons();
       expect(result).toEqual(mockLessons);
     });
   });
   ```

**Deliverable:** Lessons module complete and tested

---

### **Week 3: Extract Progress Module**

**Endpoints to Migrate:**
- `GET /progress/:user_id`
- `POST /progress`
- `POST /complete-lesson`
- `POST /complete-quiz`

**Tasks:** Follow same pattern as Week 2 for `modules/progress/`

**Deliverable:** Progress module complete

---

### **Week 4: Extract Gamification Module**

**Endpoints to Migrate:**
- `GET /user/profile/:user_id`
- `POST /user/daily-login`
- `GET /badges`
- `GET /user/badges/:user_id`
- `GET /user/achievements/:user_id`
- `POST /award-badge`
- `POST /check-achievements`

**Tasks:**
- Combine `xpController`, `achievementController` into `modules/gamification/`
- Create `xp.service.ts`, `badges.service.ts`, `achievements.service.ts`

**Deliverable:** Gamification module complete

---

### **Week 5: Extract Auth Module**

**Endpoints to Migrate:**
- `GET /users/:uid`
- `POST /users`
- `PUT /users/:user_id/profile-picture`
- `GET /whoami`

**Tasks:**
- Move `middleware/auth_fixed.js` → `modules/auth/auth.middleware.ts`
- Move `middleware/roleGuard.js` → `modules/auth/role-guard.middleware.ts`

**Deliverable:** Auth module complete

---

### **Week 6: Extract Remaining Modules**

**Challenges Module:**
- `GET /leaderboard/:class_id`
- `GET /challenges/:class_id`
- `POST /challenges`
- `GET /challenges/progress/:challenge_id`
- `POST /challenges/join`
- `PUT /challenges/progress`
- `POST /teacher/award-badge`
- `GET /analytics/:class_id`

**Notifications Module:**
- `GET /notifications`
- `POST /notifications`
- `DELETE /notifications`
- `PUT /notifications/read`
- `GET /notifications/settings`
- `PUT /notifications/settings`
- `POST /notifications/system`

**Deliverable:** All modules extracted

---

### **Week 7: Shared Infrastructure**

**Tasks:**

1. ✅ Centralized error handling (`shared/middleware/error-handler.ts`)
   ```typescript
   import { Request, Response, NextFunction } from 'express';
   import logger from '@/shared/utils/logger';

   export const errorHandler = (
     err: Error,
     req: Request,
     res: Response,
     next: NextFunction
   ) => {
     logger.error('Unhandled error:', err);
     
     res.status(500).json({
       success: false,
       error: 'Internal Server Error',
       message: process.env.NODE_ENV === 'development' ? err.message : undefined
     });
   };
   ```

2. ✅ Async handler wrapper (`shared/middleware/async-handler.ts`)
   ```typescript
   import { Request, Response, NextFunction } from 'express';

   export const asyncHandler = (
     fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
   ) => {
     return (req: Request, res: Response, next: NextFunction) => {
       Promise.resolve(fn(req, res, next)).catch(next);
     };
   };
   ```

3. ✅ Logger setup (`shared/utils/logger.ts`)
   ```bash
   npm install winston
   ```
   ```typescript
   import winston from 'winston';

   const logger = winston.createLogger({
     level: 'info',
     format: winston.format.combine(
       winston.format.timestamp(),
       winston.format.json()
     ),
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' }),
     ],
   });

   if (process.env.NODE_ENV !== 'production') {
     logger.add(new winston.transports.Console({
       format: winston.format.simple(),
     }));
   }

   export default logger;
   ```

4. ✅ Request validation (`shared/middleware/validate-request.ts`)
   ```bash
   npm install joi
   ```
   ```typescript
   import Joi from 'joi';
   import { Request, Response, NextFunction } from 'express';

   export const validateRequest = (schema: Joi.ObjectSchema) => {
     return (req: Request, res: Response, next: NextFunction) => {
       const { error } = schema.validate(req.body);
       if (error) {
         return res.status(400).json({
           success: false,
           error: 'Validation error',
           details: error.details
         });
       }
       next();
     };
   };
   ```

5. ✅ Standardized responses (`shared/utils/response.ts`)
   ```typescript
   import { Response } from 'express';

   export const sendSuccess = (res: Response, data: any, message?: string) => {
     res.json({
       success: true,
       message,
       data
     });
   };

   export const sendError = (res: Response, error: string, status: number = 500) => {
     res.status(status).json({
       success: false,
       error
     });
   };
   ```

**Deliverable:** Shared utilities complete

---

### **Week 8: Testing, Documentation & Cleanup**

**Tasks:**

1. ✅ Write integration tests
   ```typescript
   import request from 'supertest';
   import app from '@/app';

   describe('Lessons API', () => {
     it('GET /lessons should return all lessons', async () => {
       const res = await request(app)
         .get('/lessons')
         .set('Authorization', 'Bearer fake-token');
       
       expect(res.status).toBe(200);
       expect(Array.isArray(res.body)).toBe(true);
     });
   });
   ```

2. ✅ Add API documentation (Swagger)
   ```bash
   npm install swagger-ui-express swagger-jsdoc
   ```
   ```typescript
   // app.ts
   import swaggerUi from 'swagger-ui-express';
   import swaggerJsdoc from 'swagger-jsdoc';

   const swaggerOptions = {
     definition: {
       openapi: '3.0.0',
       info: {
         title: 'LearnIT API',
         version: '1.0.0',
         description: 'Educational platform API'
       },
       servers: [{ url: 'http://localhost:3000' }]
     },
     apis: ['./src/modules/**/*.routes.ts']
   };

   const swaggerDocs = swaggerJsdoc(swaggerOptions);
   app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
   ```

3. ✅ Remove old `server_fixed.js`
   ```bash
   git rm src/server_fixed.js
   git commit -m "Remove old monolithic server file"
   ```

4. ✅ Update documentation
   - Update README.md with new structure
   - Document each module's purpose
   - Add development guide

5. ✅ Deploy to staging
   ```bash
   npm run build
   npm start
   # Test all endpoints
   ```

**Deliverable:** Migration complete, documented, deployed

---

## 🧪 Testing Strategy

### Unit Tests (Service Layer)
```typescript
// Example: lessons.service.test.ts
import * as service from './lessons.service';
import * as repository from './lessons.repository';

jest.mock('./lessons.repository');

describe('Lessons Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllLessons', () => {
    it('should return all lessons', async () => {
      const mockLessons = [
        { id: 1, title: 'Lesson 1', description: 'Test' }
      ];
      (repository.findAll as jest.Mock).mockResolvedValue(mockLessons);

      const result = await service.getAllLessons();

      expect(repository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockLessons);
    });

    it('should handle repository errors', async () => {
      (repository.findAll as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(service.getAllLessons()).rejects.toThrow('DB error');
    });
  });
});
```

### Integration Tests (API Endpoints)
```typescript
// Example: lessons.routes.test.ts
import request from 'supertest';
import app from '@/app';
import db from '@/database/db';

describe('Lessons API Integration', () => {
  beforeAll(async () => {
    // Set up test database
  });

  afterAll(async () => {
    // Clean up test database
  });

  describe('GET /lessons', () => {
    it('should return 200 and list of lessons', async () => {
      const res = await request(app)
        .get('/lessons')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return 401 without auth token', async () => {
      const res = await request(app).get('/lessons');

      expect(res.status).toBe(401);
    });
  });
});
```

---

## 📊 Progress Tracking Checklist

### Week 1: Preparation
- [ ] Install TypeScript dependencies
- [ ] Create `tsconfig.json`
- [ ] Update `package.json` scripts
- [ ] Create folder structure
- [ ] Set up Jest
- [ ] Rename `server_fixed.js` → `server.ts` (temp)

### Week 2: Lessons Module
- [ ] Create `modules/lessons/` files
- [ ] Define types
- [ ] Implement repository
- [ ] Implement service
- [ ] Implement controller
- [ ] Set up routes
- [ ] Write tests
- [ ] Register routes in app

### Week 3: Progress Module
- [ ] Create `modules/progress/` files
- [ ] Migrate endpoints
- [ ] Write tests

### Week 4: Gamification Module
- [ ] Create `modules/gamification/` files
- [ ] Merge XP + Achievements + Badges
- [ ] Write tests

### Week 5: Auth Module
- [ ] Create `modules/auth/` files
- [ ] Move middleware
- [ ] Write tests

### Week 6: Remaining Modules
- [ ] Challenges module
- [ ] Notifications module
- [ ] Analytics module

### Week 7: Shared Infrastructure
- [ ] Error handler middleware
- [ ] Async handler wrapper
- [ ] Logger setup
- [ ] Request validation
- [ ] Standardized responses

### Week 8: Finalization
- [ ] Integration tests
- [ ] API documentation (Swagger)
- [ ] Remove old files
- [ ] Update documentation
- [ ] Deploy to staging
- [ ] Performance testing

---

## 🚀 Deployment

### Development
```bash
npm run dev  # Uses ts-node + nodemon for hot reload
```

### Production
```bash
npm run build  # Compile TypeScript to JavaScript
npm start      # Run compiled code
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

---

## 📚 Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Swagger/OpenAPI](https://swagger.io/specification/)

---

## ✅ Success Criteria

- ✅ All 43 endpoints migrated and working
- ✅ No breaking changes for frontend
- ✅ Test coverage > 70%
- ✅ All modules documented
- ✅ API documentation generated (Swagger)
- ✅ CI/CD pipeline set up
- ✅ Staging deployment successful

---

**End of Blueprint**  
*Follow this plan week by week. Track progress with checkboxes. Update as needed.*
