// Centralized permissions and role mappings

const PERMISSIONS = {
  ARTICLE_CREATE: "article:create",
  ARTICLE_READ_ANY: "article:read:any",
  ARTICLE_READ_OWN: "article:read:own",
  ARTICLE_UPDATE_ANY: "article:update:any",
  ARTICLE_UPDATE_OWN: "article:update:own",
  ARTICLE_DELETE_ANY: "article:delete:any",
  ARTICLE_DELETE_OWN: "article:delete:own",

  COMMENT_CREATE: "comment:create",
  COMMENT_UPDATE_ANY: "comment:update:any",
  COMMENT_UPDATE_OWN: "comment:update:own",
  COMMENT_DELETE_ANY: "comment:delete:any",
  COMMENT_DELETE_OWN: "comment:delete:own",

  NOTIFICATION_READ: "notification:read",

  USER_READ_ANY: "user:read:any",
  USER_UPDATE_ANY: "user:update:any",
  USER_DELETE_ANY: "user:delete:any",
};

const ROLE_PERMISSIONS = {
  ADMIN: Object.values(PERMISSIONS),
  EDITOR: [
    PERMISSIONS.ARTICLE_CREATE,
    PERMISSIONS.ARTICLE_READ_ANY,
    PERMISSIONS.ARTICLE_UPDATE_ANY,
    PERMISSIONS.COMMENT_CREATE,
    PERMISSIONS.COMMENT_UPDATE_ANY,
    PERMISSIONS.NOTIFICATION_READ,
    PERMISSIONS.USER_READ_ANY,
  ],
  AUTHOR: [
    PERMISSIONS.ARTICLE_CREATE,
    PERMISSIONS.ARTICLE_READ_ANY,
    PERMISSIONS.ARTICLE_READ_OWN,
    PERMISSIONS.ARTICLE_UPDATE_OWN,
    PERMISSIONS.COMMENT_CREATE,
    PERMISSIONS.COMMENT_UPDATE_OWN,
    PERMISSIONS.COMMENT_DELETE_OWN,
    PERMISSIONS.NOTIFICATION_READ,
  ],
  READER: [
    PERMISSIONS.ARTICLE_READ_ANY,
    PERMISSIONS.COMMENT_CREATE,
    PERMISSIONS.COMMENT_UPDATE_OWN,
    PERMISSIONS.COMMENT_DELETE_OWN,
    PERMISSIONS.NOTIFICATION_READ,
  ],
};

function roleHasPermission(role, permission) {
  if (!role) return false;
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes(permission);
}

module.exports = { PERMISSIONS, ROLE_PERMISSIONS, roleHasPermission };
