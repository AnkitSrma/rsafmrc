'use strict';

const PUBLIC_READ_ACTIONS = [
  'api::page.page.find',
  'api::page.page.findOne',
  'api::post.post.find',
  'api::post.post.findOne',
  'api::global-setting.global-setting.find',
];

module.exports = {
  register(/*{ strapi }*/) {},

  // Grants the Public role read access to the content the Eleventy build
  // fetches at build time. Idempotent — safe to run on every startup,
  // including against a freshly reseeded database.
  async bootstrap({ strapi }) {
    const publicRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    if (!publicRole) return;

    for (const action of PUBLIC_READ_ACTIONS) {
      const existing = await strapi.query('plugin::users-permissions.permission').findOne({
        where: { action, role: publicRole.id },
      });
      if (!existing) {
        await strapi.query('plugin::users-permissions.permission').create({
          data: { action, role: publicRole.id },
        });
      }
    }
  },
};
