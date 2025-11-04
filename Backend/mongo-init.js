db = db.getSiblingDB('blog_platform');
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'email', 'password', 'role'],
      properties: {
        username: {
          bsonType: 'string',
          minLength: 3,
          maxLength: 50
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        password: {
          bsonType: 'string'
        },
        role: {
          enum: ['ADMIN', 'EDITOR', 'AUTHOR', 'READER']
        },
        avatar: {
          bsonType: 'string'
        },
        isActive: {
          bsonType: 'bool'
        },
        createdAt: {
          bsonType: 'date'
        },
        updatedAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

db.createCollection('articles');
db.createCollection('comments');
db.createCollection('notifications');
db.createCollection('refreshtokens');

// Créez les index pour optimisation
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });

db.articles.createIndex({ authorId: 1 });
db.articles.createIndex({ tags: 1 });
db.articles.createIndex({ createdAt: -1 });
db.articles.createIndex({ title: 'text', content: 'text' });

db.comments.createIndex({ articleId: 1 });
db.comments.createIndex({ authorId: 1 });
db.comments.createIndex({ parentCommentId: 1 });

db.notifications.createIndex({ userId: 1 });
db.notifications.createIndex({ isRead: 1 });
db.notifications.createIndex({ createdAt: -1 });

db.refreshtokens.createIndex({ userId: 1 });
db.refreshtokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

print('✅ Base de données blog_platform initialisée avec succès!');