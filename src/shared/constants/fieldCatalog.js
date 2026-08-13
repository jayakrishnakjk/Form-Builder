export const FIELD_CATALOG = [
  {
    category: 'Layout',
    items: [
      { type: 'row', label: 'Row', icon: 'bi-layout-three-columns', container: true },
      { type: 'column', label: '3Column', icon: 'bi-columns-gap', container: true, columnCount: 3 },
      { type: 'column', label: '2Column', icon: 'bi-columns-gap', container: true, columnCount: 2 },
      { type: 'column', label: 'Column', icon: 'bi-columns-gap', container: true },
      // { type: 'section', label: 'Section', icon: 'bi-grid-1x2' , container: true},
      // { type: 'card', label: 'Card', icon: 'bi-card-heading', container: true },
      // { type: 'accordion', label: 'Accordion', icon: 'bi-chevron-expand', container: true },
      // { type: 'tabs', label: 'Tabs', icon: 'bi-folder2-open', container: true },
      // { type: 'group', label: 'Group', icon: 'bi-collection', container: true },
    ],
  },
   {
    category: 'Basic Fields',
    items: [
      { type: 'heading', label: 'H1', icon: 'bi-card-heading', headingLevel: 'h1' },
      { type: 'heading', label: 'H2', icon: 'bi-card-heading', headingLevel: 'h2' },
      { type: 'heading', label: 'H3', icon: 'bi-card-heading', headingLevel: 'h3' },
      { type: 'heading', label: 'H4', icon: 'bi-card-heading', headingLevel: 'h4' },
      { type: 'heading', label: 'H5', icon: 'bi-card-heading', headingLevel: 'h5' },
      { type: 'heading', label: 'H6', icon: 'bi-card-heading', headingLevel: 'h6' },
      { type: 'paragraph', label: 'Paragraph', icon: 'bi-text-paragraph' },
      { type: 'text', label: 'Text', icon: 'bi-input-cursor-text' },
      { type: 'textarea', label: 'Textarea', icon: 'bi-textarea-t' },
      { type: 'number', label: 'Number', icon: 'bi-123' },
      { type: 'email', label: 'Email', icon: 'bi-envelope' },
      { type: 'password', label: 'Password', icon: 'bi-key' },
      { type: 'phone', label: 'Phone', icon: 'bi-telephone' },
      { type: 'date', label: 'Date', icon: 'bi-calendar-date' },
      { type: 'datetime', label: 'Date Time', icon: 'bi-calendar2-week' },
      { type: 'time', label: 'Time', icon: 'bi-clock' },
      { type: 'checkbox', label: 'Checkbox', icon: 'bi-check-square' },
      { type: 'radio', label: 'Radio', icon: 'bi-ui-radios' },
      { type: 'switch', label: 'Switch', icon: 'bi-toggles' },
      { type: 'select', label: 'Select', icon: 'bi-menu-button-wide' },
      { type: 'multiselect', label: 'Multi Select', icon: 'bi-list-check' },
      { type: 'file', label: 'File Upload', icon: 'bi-upload' },
      { type: 'button', label: 'Button', icon: 'bi-hand-index' }
    ],
  }
];

export const CONTAINER_TYPES = ['root', 'row', 'column', 'section', 'card', 'accordion', 'tabs', 'group'];

