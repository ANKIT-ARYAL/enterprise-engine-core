export const CMS_BLOCKS = [
  { 
    type: 'HERO', 
    label: 'Hero Section', 
    frontendComponent: '<Hero />',
    defaultContent: { title: 'Welcome', subtitle: 'New Section' } 
  },
  { 
    type: 'FEATURED_GRID', 
    label: 'Features Grid', 
    frontendComponent: '<FeaturedSection />',
    defaultContent: { heading: 'Features', features: [] } 
  },
  { 
    type: 'FAQ_ACCORDION', 
    label: 'FAQ Accordion', 
    frontendComponent: '<FaqAccordion />',
    defaultContent: { heading: 'FAQs', faqs: [] } 
  },
  { 
    type: 'BLOG_ROLL', 
    label: 'Blog Section', 
    frontendComponent: '<BlogRoll />',
    defaultContent: { title: 'Latest News' } 
  },
  { 
    type: 'RICH_TEXT_CONTENT', 
    label: 'Rich Text', 
    frontendComponent: '<RichText />',
    defaultContent: { content: 'Start typing here...' } 
  },
];
