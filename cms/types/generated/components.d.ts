import type { Schema, Struct } from '@strapi/strapi';

export interface ElementCard extends Struct.ComponentSchema {
  collectionName: 'components_element_cards';
  info: {
    displayName: 'Card';
    icon: 'layout';
  };
  attributes: {
    anchor: Schema.Attribute.String;
    body: Schema.Attribute.RichText;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementCheckList extends Struct.ComponentSchema {
  collectionName: 'components_element_check_lists';
  info: {
    displayName: 'Check List';
    icon: 'bulletList';
  };
  attributes: {
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    items: Schema.Attribute.Component<'element.text-item', true>;
  };
}

export interface ElementHero extends Struct.ComponentSchema {
  collectionName: 'components_element_heroes';
  info: {
    displayName: 'Hero';
    icon: 'landscape';
  };
  attributes: {
    body: Schema.Attribute.RichText;
    ctaPrimaryHref: Schema.Attribute.String;
    ctaPrimaryLabel: Schema.Attribute.String;
    ctaSecondaryHref: Schema.Attribute.String;
    ctaSecondaryLabel: Schema.Attribute.String;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    sideCard: Schema.Attribute.Component<'element.info-card', false>;
  };
}

export interface ElementInfoCard extends Struct.ComponentSchema {
  collectionName: 'components_element_info_cards';
  info: {
    displayName: 'Info Card';
    icon: 'information';
  };
  attributes: {
    body: Schema.Attribute.RichText;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    items: Schema.Attribute.Component<'element.text-item', true>;
  };
}

export interface ElementMemberCountry extends Struct.ComponentSchema {
  collectionName: 'components_element_member_countries';
  info: {
    displayName: 'Member Country';
    icon: 'globe';
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
    note: Schema.Attribute.String;
  };
}

export interface ElementTextBlock extends Struct.ComponentSchema {
  collectionName: 'components_element_text_blocks';
  info: {
    displayName: 'Text Block';
    icon: 'align-left';
  };
  attributes: {
    body: Schema.Attribute.RichText & Schema.Attribute.Required;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String;
  };
}

export interface ElementTextItem extends Struct.ComponentSchema {
  collectionName: 'components_element_text_items';
  info: {
    displayName: 'Text Item';
    icon: 'align-left';
  };
  attributes: {
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionCardGrid extends Struct.ComponentSchema {
  collectionName: 'components_section_card_grids';
  info: {
    displayName: 'Card Grid';
    icon: 'grid';
  };
  attributes: {
    alt: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    anchor: Schema.Attribute.String;
    cards: Schema.Attribute.Component<'element.card', true>;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String;
  };
}

export interface SectionPostCarousel extends Struct.ComponentSchema {
  collectionName: 'components_section_post_carousels';
  info: {
    displayName: 'Post Carousel';
    icon: 'arrowRight';
  };
  attributes: {
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String;
  };
}

export interface SectionPostSpotlight extends Struct.ComponentSchema {
  collectionName: 'components_section_post_spotlights';
  info: {
    displayName: 'Post Spotlight';
    icon: 'star';
  };
  attributes: {
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String;
  };
}

export interface SectionPostTimeline extends Struct.ComponentSchema {
  collectionName: 'components_section_post_timelines';
  info: {
    displayName: 'Post Timeline';
    icon: 'clock';
  };
  attributes: {
    alt: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String;
  };
}

export interface SectionTwoColumn extends Struct.ComponentSchema {
  collectionName: 'components_section_two_columns';
  info: {
    displayName: 'Two Column';
    icon: 'layout';
  };
  attributes: {
    alt: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    anchor: Schema.Attribute.String;
    columnLeft: Schema.Attribute.DynamicZone<
      ['element.text-block', 'element.check-list', 'element.info-card']
    >;
    columnRight: Schema.Attribute.DynamicZone<
      ['element.text-block', 'element.check-list', 'element.info-card']
    >;
    eyebrow: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'element.card': ElementCard;
      'element.check-list': ElementCheckList;
      'element.hero': ElementHero;
      'element.info-card': ElementInfoCard;
      'element.member-country': ElementMemberCountry;
      'element.text-block': ElementTextBlock;
      'element.text-item': ElementTextItem;
      'section.card-grid': SectionCardGrid;
      'section.post-carousel': SectionPostCarousel;
      'section.post-spotlight': SectionPostSpotlight;
      'section.post-timeline': SectionPostTimeline;
      'section.two-column': SectionTwoColumn;
    }
  }
}
