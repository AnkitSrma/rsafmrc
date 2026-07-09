'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

// Strapi v5 requires explicit per-component-type populate for dynamic zones.
// This mirrors the section schema exactly (see src/components/**) so every
// nested field is fetched in one request instead of the frontend needing
// several round trips.
const columnComponentPopulate = {
  on: {
    'element.text-block': true,
    'element.check-list': { populate: { items: true } },
    'element.info-card': { populate: { items: true } },
  },
};

const sectionsPopulate = {
  on: {
    'element.hero': { populate: { sideCard: { populate: { items: true } } } },
    'section.two-column': {
      populate: {
        columnLeft: columnComponentPopulate,
        columnRight: columnComponentPopulate,
      },
    },
    'section.card-grid': { populate: { cards: true } },
    'section.post-spotlight': true,
    'section.post-carousel': true,
    'section.post-timeline': true,
  },
};

module.exports = createCoreController('api::page.page', () => ({
  async find(ctx) {
    ctx.query = { ...ctx.query, populate: { sections: sectionsPopulate } };
    return super.find(ctx);
  },
  async findOne(ctx) {
    ctx.query = { ...ctx.query, populate: { sections: sectionsPopulate } };
    return super.findOne(ctx);
  },
}));
