db = db.getSiblingDB('user_management');

db.createUser({
  user: 'admin',
  pwd: 'password',
  roles: [
    {
      role: 'readWrite',
      db: 'user_management',
    },
  ],
});
