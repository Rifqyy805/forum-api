exports.up = (pgm) => {
  pgm.createTable('user_comment_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true, // Diubah menjadi camelCase yang valid bagi JavaScript dan node-pg-migrate
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"',
      onDelete: 'cascade',
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"comments"',
      onDelete: 'cascade',
    },
  });

  // Membuat batasan unik agar satu user hanya bisa menyukai satu komentar satu kali saja
  pgm.addConstraint('user_comment_likes', 'unique_user_comment', {
    unique: ['user_id', 'comment_id'],
  });
};

exports.down = (pgm) => {
  pgm.dropTable('user_comment_likes');
};
