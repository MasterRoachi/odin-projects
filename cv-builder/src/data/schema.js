/* =========================================================
   What a CV is made of.

   Education and experience differ only in which fields they
   have, so they are described here as data rather than
   written twice as components. One SectionEditor reads this
   and can edit any of them, which is why adding a section is
   an entry in this array and nothing else.
   ========================================================= */

export const SECTIONS = [
  {
    key: "experience",
    title: "Experience",
    singular: "role",
    fields: [
      { name: "role", label: "Role", type: "text", placeholder: "Junior Developer" },
      { name: "company", label: "Company", type: "text", placeholder: "Northwind Ltd" },
      { name: "location", label: "Location", type: "text", placeholder: "Manchester" },
      { name: "start", label: "From", type: "month" },
      { name: "end", label: "To", type: "month", hint: "Leave blank if this is current" },
      {
        name: "description",
        label: "What you did",
        type: "textarea",
        hint: "One line per point",
        placeholder: "Rebuilt the checkout flow\nCut page weight by half",
      },
    ],
    // how an entry is labelled in the editor list when collapsed
    summarise: (entry) => [entry.role, entry.company].filter(Boolean).join(" · ") || "Untitled role",
  },
  {
    key: "education",
    title: "Education",
    singular: "qualification",
    fields: [
      { name: "qualification", label: "Qualification", type: "text", placeholder: "BSc Computer Science" },
      { name: "school", label: "Institution", type: "text", placeholder: "University of Leeds" },
      { name: "location", label: "Location", type: "text", placeholder: "Leeds" },
      { name: "start", label: "From", type: "month" },
      { name: "end", label: "To", type: "month", hint: "Leave blank if ongoing" },
      { name: "description", label: "Notes", type: "textarea", hint: "Grade, dissertation, anything worth saying" },
    ],
    summarise: (entry) =>
      [entry.qualification, entry.school].filter(Boolean).join(" · ") || "Untitled qualification",
  },
  {
    key: "skills",
    title: "Skills",
    singular: "group",
    fields: [
      { name: "name", label: "Group", type: "text", placeholder: "Languages" },
      { name: "description", label: "Items", type: "textarea", hint: "Comma separated", placeholder: "JavaScript, HTML, CSS" },
    ],
    summarise: (entry) => entry.name || "Untitled group",
  },
];

export const DETAIL_FIELDS = [
  { name: "name", label: "Full name", type: "text", placeholder: "Sid Phanus" },
  { name: "title", label: "Headline", type: "text", placeholder: "Front-end developer" },
  { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
  { name: "phone", label: "Phone", type: "tel", placeholder: "07700 900000" },
  { name: "location", label: "Location", type: "text", placeholder: "Manchester, UK" },
  { name: "website", label: "Website", type: "text", placeholder: "github.com/MasterRoachi" },
  {
    name: "summary",
    label: "Summary",
    type: "textarea",
    hint: "Two or three sentences at most",
    placeholder: "What you do, and what you are looking for.",
  },
];

const blankDetails = () =>
  Object.fromEntries(DETAIL_FIELDS.map((field) => [field.name, ""]));

/** A brand new, entirely empty CV. */
export const emptyCv = () => ({
  details: blankDetails(),
  ...Object.fromEntries(SECTIONS.map((section) => [section.key, []])),
});

/**
 * Something to look at on a first visit.
 *
 * An empty form teaches nobody what the thing does — the preview would be a
 * blank sheet and the layout impossible to judge.
 */
export const sampleCv = () => ({
  details: {
    name: "Ada Okonkwo",
    title: "Front-end developer",
    email: "ada@example.com",
    phone: "07700 900142",
    location: "Manchester, UK",
    website: "github.com/example",
    summary:
      "Front-end developer with a background in accessibility auditing. I like small, fast pages and I test the things I ship.",
  },
  experience: [
    {
      id: crypto.randomUUID(),
      role: "Front-end Developer",
      company: "Northwind Digital",
      location: "Manchester",
      start: "2023-04",
      end: "",
      description:
        "Rebuilt the booking flow in React, cutting drop-off by a fifth\nIntroduced automated accessibility checks to the deploy pipeline\nMentored two junior developers through their first year",
    },
    {
      id: crypto.randomUUID(),
      role: "Junior Developer",
      company: "Pemberton & Co",
      location: "Leeds",
      start: "2021-09",
      end: "2023-03",
      description:
        "Maintained a large legacy jQuery codebase and migrated it piecemeal\nBuilt the internal component library still in use today",
    },
  ],
  education: [
    {
      id: crypto.randomUUID(),
      qualification: "BSc Computer Science",
      school: "University of Leeds",
      location: "Leeds",
      start: "2018-09",
      end: "2021-06",
      description: "First class honours. Dissertation on screen reader behaviour in single-page apps.",
    },
  ],
  skills: [
    {
      id: crypto.randomUUID(),
      name: "Languages",
      description: "JavaScript, HTML, CSS, SQL",
    },
    {
      id: crypto.randomUUID(),
      name: "Tools",
      description: "React, Vite, Vitest, Git, Figma",
    },
  ],
});

/** A new blank entry for a section, with an id already attached. */
export const blankEntry = (section) => ({
  id: crypto.randomUUID(),
  ...Object.fromEntries(section.fields.map((field) => [field.name, ""])),
});
