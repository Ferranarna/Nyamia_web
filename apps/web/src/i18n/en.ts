/**
 * English copy — an adaptation of `es.ts`, not a literal translation.
 * Keys must match `es.ts` exactly (enforced by `typeof es` + parity test).
 * The app itself is in Spanish: the hero note and the demo section say so,
 * and the demo section adds that demos can be held in English.
 */
import type { es } from './es'

export const en: typeof es = {
  meta: {
    lang: 'en',
    siteName: 'Nyamia',
    title: 'Nyamia · Meal plans fitted to each client’s macros',
    description:
      'AI assistant for dietitians: build a weekly menu from your recipes, with grams fitted to ±10% of kcal and macros. App in Spanish. Request a demo.',
    ogAlt: 'Nyamia window showing a fictitious client’s weekly menu with every day in green.',
    privacyTitle: 'Privacy · Nyamia',
    privacyDescription: 'How Nyamia handles the data sent through the demo request form. This site uses no cookies.',
    legalTitle: 'Legal notice · Nyamia',
    legalDescription: 'Owner details for nyamia.com and terms of use of the website.',
    notFoundTitle: 'Page not found · Nyamia',
  },

  a11y: {
    skipToContent: 'Skip to content',
    mainNav: 'Main navigation',
    languageSwitch: 'Change language',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    homeLink: 'Nyamia, go to home page',
    mockupLabel: 'Illustrative animation of the app with fictitious data',
    externalLink: '(opens in a new tab)',
    tableOfContents: 'Contents',
  },

  nav: {
    howItWorks: 'How it works',
    features: 'Features',
    faq: 'FAQ',
    login: 'Log in',
    cta: 'Request a demo',
    languageLabel: 'Language',
    languageCurrent: 'EN',
    languageOther: 'ES',
    languageOtherName: 'Español',
  },

  hero: {
    eyebrow: 'AI assistant for dietitians',
    headline: 'Stop balancing meal plans by hand.',
    tagline: 'AI proposes, macros are calculated, you decide.',
    sub: 'Nyamia builds each client’s weekly menu from your favourite recipes and fits the grams to within ±10% of their kcal, protein, carbs and fat.',
    ctaPrimary: 'Request a demo',
    ctaSecondary: 'See how it works',
    note: 'Available in Spanish · Live demo with fictitious data',
  },

  problem: {
    eyebrow: 'The problem',
    headline: 'Every client, another spreadsheet.',
    sub: 'Fitting a menu to one person’s macros takes hours. And next week it starts again.',
    points: [
      {
        title: 'Gram by gram',
        body: 'You tweak every ingredient until kcal, protein, carbs and fat add up.',
      },
      {
        title: 'One swap breaks the day',
        body: 'Change one recipe and the whole day is off again.',
      },
      {
        title: 'Again, for every client',
        body: 'Different targets, allergies and tastes. The same maths, multiplied.',
      },
      {
        title: 'Then make it presentable',
        body: 'Copying the menu into a clean document is one more job.',
      },
    ],
    closing: 'Your job is deciding the plan, not doing the sums.',
  },

  howItWorks: {
    eyebrow: 'How it works',
    headline: 'From client profile to PDF, in one window.',
    sub: 'This is how a week comes together for one client.',
    steps: [
      {
        kicker: '01 · The profile',
        title: 'Start with the targets',
        body: 'Daily kcal and macros, allergens, disliked foods and meals per day, saved in the client’s profile.',
      },
      {
        kicker: '02 · The request',
        title: 'Ask the way you’d say it',
        body: 'Type “create Laura’s menu for the week” in the command bar. No menus, no forms.',
      },
      {
        kicker: '03 · AI proposes',
        title: 'Picks from your Favourites',
        body: 'The AI selects recipes from your library that suit that client: none of their allergens, nothing they dislike.',
      },
      {
        kicker: '04 · Macros are calculated',
        title: 'Grams that add up',
        body: 'A deterministic calculation, not the AI, fits each ingredient’s grams to ±10% on kcal, protein, carbs and fat. Each day turns green, orange or red.',
      },
      {
        kicker: '05 · You decide',
        title: 'Adjust anything',
        body: 'Drag another recipe into a slot, edit grams with live macros, or hit “Recalculate” on a day that’s off.',
      },
      {
        kicker: '06 · The deliverable',
        title: 'A PDF with your logo',
        body: 'Weekly calendar, summary against targets and one page per recipe with every step. Pick the sections and download.',
      },
    ],
    legend: {
      title: 'Compliance colours',
      green: 'Green: everything fits',
      orange: 'Orange: calories fine, macros off',
      red: 'Red: calories off',
    },
  },

  features: {
    eyebrow: 'Features',
    headline: 'What Nyamia does today.',
    sub: 'Everything shown here already works in the app.',
    items: [
      {
        title: 'Client profile',
        body: 'Daily kcal and macro targets, allergens, disliked foods and meal structure.',
      },
      {
        title: 'Your recipes, in Favourites',
        body: 'Search recipes or save one from a link. Before saving, you see whether it clashes with a client’s allergens or dislikes.',
      },
      {
        title: 'Colour-coded weekly menu',
        body: 'The whole week at a glance. Each day shows whether it fits, macros are off, or calories are off.',
      },
      {
        title: 'Same grams all week',
        body: 'When a recipe repeats in a client’s week, it always has the same quantities.',
      },
      {
        title: 'Recipes adjusted per client',
        body: 'Edit quantities with live macros and save that client’s version without touching the original recipe.',
      },
      {
        title: 'PDF with your branding',
        body: 'Your logo, the calendar, the weekly summary and step-by-step recipes. You choose the sections.',
      },
      {
        title: 'Many clients at once',
        body: 'Each client in its own window. Minimise, switch, and pick up again from your request history.',
      },
      {
        title: 'Built in Spanish',
        body: 'Interface, recipes and PDF are in Spanish. If a translation fails, the recipe is flagged as untranslated.',
      },
    ],
  },

  control: {
    eyebrow: 'Control',
    headline: 'You decide. Always.',
    sub: 'Nyamia does the maths. Professional judgement stays with you.',
    items: [
      {
        title: 'A proposal, not a verdict',
        body: 'A generated menu can be changed, recalculated or discarded. Your client only gets the PDF you export.',
      },
      {
        title: 'The AI doesn’t invent the numbers',
        body: 'The AI picks recipes. Quantities and macros come from a calculation on each ingredient’s nutrition data.',
      },
      {
        title: 'No client names',
        body: 'To build the menu, the AI model receives targets, restrictions and recipes. It does not receive the client’s name or email.',
      },
      {
        title: 'A planning tool',
        body: 'Nyamia helps you plan menus. It is not a medical device, does not diagnose or treat, and does not replace your judgement.',
      },
    ],
    fictitiousNote: 'All data shown on this page is fictitious.',
  },

  demo: {
    eyebrow: 'Demo',
    headline: 'Watch a week fall into place.',
    sub: 'A live demo with fictitious clients, from profile to PDF. Then decide whether it fits your practice.',
    languageNote: 'The app and its PDFs are in Spanish. Demos can be held in English.',
    form: {
      title: 'Request a demo',
      requiredLegend: 'Fields marked * are required.',
      requiredMark: '*',
      optionalMark: '(optional)',
      name: {
        label: 'Full name',
        placeholder: 'e.g. Laura Martin',
        help: '',
      },
      email: {
        label: 'Email',
        placeholder: 'you@yourpractice.com',
        help: 'Only used to reply to your request.',
      },
      role: {
        label: 'What best describes you?',
        placeholder: 'Choose an option',
        help: '',
        options: {
          dietitian_private: 'Dietitian in private practice',
          dietitian_clinical: 'Generalist dietitian',
          clinic: 'Practice or centre with several professionals',
          coach: 'Trainer or coach',
          other: 'Other',
        },
      },
      practiceName: {
        label: 'Practice or centre',
        placeholder: 'Your practice name',
        help: '',
      },
      clientVolume: {
        label: 'Active clients per month',
        placeholder: 'Not specified',
        help: 'Helps tailor the demo to you.',
        options: {
          '1-15': '1–15',
          '16-40': '16–40',
          '41-80': '41–80',
          '80+': 'More than 80',
        },
      },
      message: {
        label: 'What would you like to see?',
        placeholder: 'e.g. how a week with five meals a day is planned',
        help: 'Up to {max} characters.',
        counter: '{count}/{max}',
      },
      honeypot: {
        label: 'Leave this field empty',
      },
      consent: {
        label: 'I have read the {privacyLink} and agree that Nyamia may use this data to reply to my demo request and contact me about Nyamia.',
        linkLabel: 'privacy information',
      },
      submit: 'Request a demo',
      submitting: 'Sending…',
      noScript: 'This form needs JavaScript to send. Enable it in your browser and reload the page.',
    },
    validation: {
      nameRequired: 'Enter your name.',
      nameLength: 'Name must be 2 to 100 characters.',
      emailRequired: 'Enter your email.',
      emailInvalid: 'Check the email: it doesn’t look valid.',
      emailTooLong: 'The email is too long.',
      roleRequired: 'Choose what best describes you.',
      practiceNameTooLong: 'Up to 120 characters.',
      messageTooLong: 'Up to 1000 characters.',
      consentRequired: 'To send the request, accept the privacy information.',
      summary: 'Check the highlighted fields.',
    },
    success: {
      title: 'Request received. Next up: setting a date.',
      body: 'An email is on its way to the address you entered to fix the day and time of the demo with you. Reply with the slot that suits you best and it’s booked.',
      again: 'Send another request',
    },
    errors: {
      invalid: 'Some fields need fixing. Correct them and send again.',
      tooLarge: 'The message is too long. Shorten it and send again.',
      tooManyRequests: 'Several requests were sent from here in a row. Please try again later.',
      tooManyRequestsRetry: 'Several requests were sent from here in a row. Please try again in {minutes} min.',
      server: 'The request couldn’t be sent. Please try again in a few minutes.',
      network: 'Can’t reach the server. Check your connection and try again.',
      retry: 'Try again',
    },
    next: {
      title: 'What happens next',
      steps: [
        {
          title: 'An email to set the date',
          body: 'An email arrives at the address you enter to arrange the demo directly with you.',
        },
        {
          title: 'You pick the day and time',
          body: 'Reply with the slot that suits you best and the demo is booked.',
        },
        {
          title: 'Live demo',
          body: 'Client profile, weekly menu, macro fitting and PDF, with fictitious clients.',
        },
      ],
    },
  },

  faq: {
    eyebrow: 'FAQ',
    headline: 'Frequently asked questions.',
    items: [
      {
        q: 'Who is Nyamia for?',
        a: 'Dietitians who plan macro-based menus, especially in private practice with a sports or body-composition focus. Also generalist practices and small centres. It is not a consumer app.',
      },
      {
        q: 'What does the AI do, and what doesn’t it?',
        a: 'The AI picks recipes from your Favourites that suit the client. It doesn’t calculate quantities: grams and macros come from a deterministic calculation. It doesn’t diagnose, treat or decide for you.',
      },
      {
        q: 'How precise is the fit?',
        a: 'Each day is fitted to within ±10% of the kcal, protein, carbs and fat targets. If a day can’t fit with the available recipes, it’s flagged orange or red so you can review it, recalculate or swap a recipe.',
      },
      {
        q: 'Can I use my own recipes?',
        a: 'Yes. Save recipes from a link or from the search into your Favourites library, and menus are built from them.',
      },
      {
        q: 'What about my clients’ data?',
        a: 'Each account’s data is kept separate from every other account. To build the menu, the AI model receives targets, restrictions and recipes, not the client’s name or email. Demos use fictitious data only.',
      },
      {
        q: 'What language is it in, and what do I need?',
        a: 'Nyamia is in Spanish: interface, recipes and PDF. It runs in the browser with nothing to install, and is designed for use on a computer.',
      },
    ],
  },

  finalCta: {
    headline: 'Your next week of menus, already balanced.',
    cta: 'Request a demo',
  },

  footer: {
    tagline: 'AI meal-planning assistant for dietitians.',
    disclaimer: 'Nyamia is a planning tool. It is not a medical device and does not replace professional judgement.',
    privacy: 'Privacy',
    legal: 'Legal notice',
    login: 'Log in',
    language: 'Español',
    copyright: '© {year} Nyamia',
    noCookies: 'This site uses no cookies.',
  },

  privacy: {
    title: 'Privacy information',
    version: '2026-10-30',
    updatedLabel: 'Last updated: 30 October 2026',
    intro: 'This page explains how the data you send through the demo request form on nyamia.com is processed, in line with Article 13 of the General Data Protection Regulation (GDPR).',
    sections: [
      {
        heading: 'Data controller',
        paragraphs: [
          'Controller: Nyamia',
          'Privacy contact email: farnausgar@gmail.com',
        ],
      },
      {
        heading: 'What data is processed',
        paragraphs: [
          'What you enter in the form: full name, email, professional profile and, if provided, your practice name, approximate number of clients and message. Also the page language, the date of your consent and the version of this information you accepted.',
          'To protect the form from abuse, a pseudonymous code derived from your IP address with a secret key (a keyed hash, which does not reveal the address without that key) and your browser identifier, cut to 200 characters, are also stored. The IP address itself is not stored with your request.',
        ],
      },
      {
        heading: 'What it is used for',
        paragraphs: [
          'To reply to your demo request, arrange it and contact you about Nyamia.',
          'The IP code and the browser identifier are used only to limit the number of submissions and prevent abuse.',
          'No automated decisions or profiling are carried out with this data.',
        ],
      },
      {
        heading: 'Legal basis',
        paragraphs: [
          'Your consent (Art. 6(1)(a) GDPR), given by ticking the form checkbox. You can withdraw it at any time; this does not affect processing carried out before withdrawal.',
          'Protecting the form from abuse is based on the legitimate interest in keeping the service secure (Art. 6(1)(f) GDPR).',
        ],
      },
      {
        heading: 'How long it is kept',
        paragraphs: [
          '12 months from when the request is sent, then deleted. If you withdraw consent or ask for erasure earlier, it is deleted then.',
        ],
      },
      {
        heading: 'Who else has access',
        paragraphs: [
          'The data is not shared with third parties.',
          'Only the hosting providers that process the data on Nyamia’s behalf have access, as data processors, and solely to provide that service.',
          'If any of these providers processes data outside the European Economic Area, it does so with the safeguards required by the GDPR, such as the standard contractual clauses approved by the European Commission.',
        ],
      },
      {
        heading: 'Your rights',
        paragraphs: [
          'You can request access, rectification, erasure, objection, restriction of processing and portability of your data, and withdraw your consent, by emailing farnausgar@gmail.com.',
          'If you believe your data has not been handled properly, you can lodge a complaint with the Spanish Data Protection Agency (www.aepd.es).',
        ],
      },
      {
        heading: 'Required data',
        paragraphs: [
          'Name, email, professional profile and consent are needed to process the request. All other fields are optional.',
        ],
      },
      {
        heading: 'Cookies',
        paragraphs: [
          'This website uses no cookies and no third-party analytics, advertising or tracking tools.',
        ],
      },
      {
        heading: 'Changes to this information',
        paragraphs: [
          'If this information changes, a new dated version will be published. Each request stores the version that was accepted.',
        ],
      },
    ],
  },

  legal: {
    title: 'Legal notice',
    updatedLabel: 'Last updated: 30 October 2026',
    sections: [
      {
        heading: 'Website owner',
        paragraphs: [
          'In compliance with Article 10 of Spanish Law 34/2002 on information society services and e-commerce (LSSI-CE):',
          'Owner: Nyamia',
          'Contact email: farnausgar@gmail.com',
        ],
      },
      {
        heading: 'Purpose',
        paragraphs: [
          'nyamia.com presents Nyamia, a meal-planning assistant for dietitians, and lets visitors request a demo. The application lives at app.nyamia.com and is governed by its own terms.',
        ],
      },
      {
        heading: 'Use of the website',
        paragraphs: [
          'Visitors agree to use the website lawfully and not to submit unlawful content or third-party data without authorisation through the form.',
        ],
      },
      {
        heading: 'Informational content',
        paragraphs: [
          'The content of this website describes a planning tool for professionals. It is not health or nutrition advice, and Nyamia is not a medical device.',
          'The data, names and menus shown in the illustrations are fictitious.',
        ],
      },
      {
        heading: 'Intellectual property',
        paragraphs: [
          'The Nyamia brand, logo, texts, design and code of this website belong to its owner. Reproduction without permission is not allowed.',
        ],
      },
      {
        heading: 'Liability',
        paragraphs: [
          'The owner aims to keep the information on this website accurate and up to date, but does not guarantee it is error-free or that the website will be continuously available.',
        ],
      },
      {
        heading: 'Applicable law',
        paragraphs: [
          'This notice is governed by Spanish law.',
        ],
      },
    ],
    privacyLinkLabel: 'Privacy information',
  },

  notFound: {
    code: '404',
    headline: 'This page doesn’t exist.',
    body: 'The link may be mistyped, or the page may have moved.',
    home: 'Back to home',
    cta: 'Request a demo',
  },

  /** Mockup strings adapted to English. The real app is in Spanish (see languageNote). */
  mockup: {
    appName: 'Nyamia',
    illustrativeCaption: 'Illustration with fictitious data',
    sidebar: {
      newSession: '+ New session',
      historyTitle: 'History',
      history: [
        { label: 'create Laura’s menu for the week' },
        { label: 'recipes for Laura' },
        { label: 'Laura M.' },
      ],
      settings: 'Settings',
    },
    commandBar: {
      placeholder: 'Ask me something: find a client, review a menu…',
      prompt: 'create Laura’s menu for the week',
      send: 'Send',
    },
    windows: {
      client: 'Client profile',
      calendar: 'Calendar',
      recipes: 'Recipes',
      favourites: 'Favourites',
      menuPdf: 'Menu PDF',
      minimize: 'Minimise window',
      close: 'Close window',
    },
    client: {
      name: 'Laura M.',
      sections: {
        identity: 'Identity',
        targets: 'Daily targets',
        restrictions: 'Allergens and favourite foods',
        planning: 'Planning',
      },
      targets: [
        { label: 'Calories', value: '2100', unit: 'kcal' },
        { label: 'Protein', value: '140', unit: 'g' },
        { label: 'Carbs', value: '230', unit: 'g' },
        { label: 'Fat', value: '70', unit: 'g' },
      ],
      allergensLabel: 'Allergens',
      allergens: [{ label: 'Tree nuts' }],
      dislikedLabel: 'Disliked foods',
      disliked: [{ label: 'coriander' }, { label: 'cauliflower' }],
      mealsLabel: 'Meals',
      meals: 'Breakfast · Lunch · Snack · Dinner',
      save: 'Save client',
      edit: 'Edit',
    },
    menu: {
      weekLabel: 'Week of Mon, 2 Nov',
      prevWeek: 'Previous week',
      nextWeek: 'Next week',
      createWeek: 'Create week menu',
      today: 'Today’s menu',
      exportPdf: 'Export PDF',
      recalculate: 'Recalculate',
      favouritesTitle: 'Suitable Favourites · drag a recipe into a slot',
      generating: 'Picking recipes from Favourites…',
      fitting: 'Fitting grams…',
      done: 'Here’s your plan.',
      illustrative: 'Illustrative',
      days: [
        { short: 'Mon', date: '2 Nov' },
        { short: 'Tue', date: '3 Nov' },
        { short: 'Wed', date: '4 Nov' },
        { short: 'Thu', date: '5 Nov' },
        { short: 'Fri', date: '6 Nov' },
        { short: 'Sat', date: '7 Nov' },
        { short: 'Sun', date: '8 Nov' },
      ],
      slots: {
        breakfast: 'Breakfast',
        lunch: 'Lunch',
        merienda: 'Snack',
        dinner: 'Dinner',
      },
      status: {
        green: 'Fits',
        orange: 'Macros off',
        red: 'Calories off',
        none: 'No menu',
      },
      dayTotal: '{kcal}/2100 kcal · P {protein}/140',
      legend: {
        red: 'Red = Macros and calories don’t fit',
        orange: 'Orange = Calories OK but macros don’t fit',
        green: 'Green = Everything fits',
      },
    },
    recipes: [
      { title: 'Greek yoghurt with oats and berries', slot: 'breakfast' },
      { title: 'Wholegrain toast with avocado and egg', slot: 'breakfast' },
      { title: 'Chicken curry with basmati rice', slot: 'lunch' },
      { title: 'Lentil and vegetable stew', slot: 'lunch' },
      { title: 'Baked salmon with potato and green beans', slot: 'lunch' },
      { title: 'Grilled turkey with quinoa', slot: 'lunch' },
      { title: 'Ricotta with banana and cinnamon', slot: 'merienda' },
      { title: 'Spinach omelette with wholegrain bread', slot: 'dinner' },
      { title: 'Hake in green sauce with rice', slot: 'dinner' },
      { title: 'Chickpea and tuna salad', slot: 'dinner' },
    ],
    recipeModal: {
      title: 'Chicken curry with basmati rice',
      ingredientsLabel: 'Ingredients',
      ingredients: [
        { name: 'Chicken breast', grams: '165 g' },
        { name: 'Basmati rice', grams: '80 g' },
        { name: 'Light coconut milk', grams: '60 g' },
        { name: 'Onion', grams: '70 g' },
        { name: 'Extra virgin olive oil', grams: '8 g' },
      ],
      macros: [
        { label: 'Kcal', value: '615' },
        { label: 'Protein', value: '45 g' },
        { label: 'Carbs', value: '70 g' },
        { label: 'Fat', value: '17 g' },
      ],
      save: 'Save',
      cancel: 'Cancel',
    },
    refit: {
      title: 'Recalculate Thu, 5 Nov',
      confirm: 'Recalculate',
    },
    pdf: {
      windowTitle: 'Menu PDF',
      preview: 'PDF preview',
      logoTitle: 'Logo',
      logoPlaceholder: 'Your logo',
      changeLogo: 'Change logo',
      noLogo: 'No logo in this PDF',
      sections: [
        { label: 'Weekly calendar' },
        { label: 'Summary' },
        { label: 'Recipes' },
      ],
      download: 'Download',
      fileName: 'menu-laura-2026-11-02.pdf',
      docTitle: 'Weekly menu · Laura M.',
      docSubtitle: 'Week of 2–8 November',
      summaryTitle: 'Daily average vs targets',
    },
    problemSheet: {
      fileName: 'laura_menu_v7_FINAL.xlsx',
      columns: [
        { label: 'Food' },
        { label: 'g' },
        { label: 'kcal' },
        { label: 'P' },
        { label: 'C' },
        { label: 'F' },
      ],
      rows: [
        { food: 'Chicken breast', grams: '150', kcal: '165', p: '35', hc: '0', g: '2' },
        { food: 'Basmati rice', grams: '90', kcal: '315', p: '7', hc: '70', g: '1' },
        { food: 'Olive oil', grams: '10', kcal: '90', p: '0', hc: '0', g: '10' },
      ],
      totalLabel: 'Day total',
      targetLabel: 'Target',
      offLabel: 'Off',
    },
  },
}
