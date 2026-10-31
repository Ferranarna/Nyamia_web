/**
 * Spanish copy (original). Owner: @nyamia-web-business.
 * Rationale, claims review and open questions:
 * .claude/spec/features/001-landing-and-demo-request/copy-review.md
 *
 * Rules: plain nested object, string values (arrays of objects for lists).
 * `en.ts` must keep identical keys (`typeof es`).
 * Tokens in braces ({privacyLink}, {year}, {count}, {max}) are replaced by
 * the frontend. Email addresses inside privacy/legal paragraphs are rendered
 * as mailto links. NIF, address and legal-entity data are still pending
 * (go-live blocker, roadmap 003) and are deliberately not shown on the page.
 */
export const es = {
  meta: {
    lang: 'es',
    siteName: 'Nyamia',
    title: 'Nyamia · Menús ajustados a los macros de cada cliente',
    description:
      'Asistente IA para dietistas-nutricionistas: crea el menú semanal con tus recetas y ajusta los gramos a ±10 % de kcal y macros. Solicita una demo.',
    ogAlt: 'Ventana de Nyamia con el menú semanal de un cliente ficticio y los días en verde.',
    privacyTitle: 'Privacidad · Nyamia',
    privacyDescription: 'Cómo trata Nyamia los datos del formulario de solicitud de demo. Esta web no usa cookies.',
    legalTitle: 'Aviso legal · Nyamia',
    legalDescription: 'Datos del titular de nyamia.com y condiciones de uso de la web.',
    notFoundTitle: 'Página no encontrada · Nyamia',
  },

  a11y: {
    skipToContent: 'Saltar al contenido',
    mainNav: 'Navegación principal',
    languageSwitch: 'Cambiar idioma',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    homeLink: 'Nyamia, ir al inicio',
    mockupLabel: 'Animación ilustrativa de la app con datos ficticios',
    externalLink: '(se abre en otra pestaña)',
    tableOfContents: 'Índice',
  },

  nav: {
    howItWorks: 'Cómo funciona',
    features: 'Funciones',
    faq: 'Preguntas',
    login: 'Entrar',
    cta: 'Solicitar demo',
    languageLabel: 'Idioma',
    languageCurrent: 'ES',
    languageOther: 'EN',
    languageOtherName: 'English',
  },

  hero: {
    eyebrow: 'Asistente IA para dietistas-nutricionistas',
    headline: 'Deja de cuadrar menús a mano.',
    tagline: 'La IA propone, los macros se calculan, tú decides.',
    sub: 'Nyamia crea el menú semanal de cada cliente con tus recetas favoritas y ajusta los gramos hasta quedar a ±10 % de sus kcal, proteína, hidratos y grasa.',
    ctaPrimary: 'Solicitar demo',
    ctaSecondary: 'Ver cómo funciona',
    note: 'Demo en directo con datos ficticios',
  },

  problem: {
    eyebrow: 'El problema',
    headline: 'Cada cliente, una hoja de cálculo.',
    sub: 'Cuadrar un menú a los macros de una persona lleva horas. Y cada semana vuelve a empezar.',
    points: [
      {
        title: 'Gramo a gramo',
        body: 'Ajustas cada ingrediente hasta que cuadran kcal, proteína, hidratos y grasa.',
      },
      {
        title: 'Un cambio lo descuadra todo',
        body: 'Cambias una receta y el día entero vuelve a estar fuera.',
      },
      {
        title: 'Otra vez, para cada cliente',
        body: 'Objetivos distintos, alergias distintas, gustos distintos. El mismo cálculo, multiplicado.',
      },
      {
        title: 'Y luego, pasarlo a limpio',
        body: 'Copiar el menú a un documento presentable es otra tarea más.',
      },
    ],
    closing: 'Tu trabajo es decidir el plan, no hacer cuentas.',
  },

  howItWorks: {
    eyebrow: 'Cómo funciona',
    headline: 'De la ficha al PDF, en una ventana.',
    sub: 'Así se monta una semana para un cliente.',
    steps: [
      {
        kicker: '01 · La ficha',
        title: 'Empieza por los objetivos',
        body: 'Kcal y macros diarios, alérgenos, alimentos que no le gustan y cuántas comidas hace al día. Se guardan en la ficha del cliente.',
      },
      {
        kicker: '02 · La petición',
        title: 'Pídelo como lo dirías',
        body: 'Escribe «crea el menú de la semana para Laura» en la barra de comandos. Sin menús ni formularios.',
      },
      {
        kicker: '03 · La IA propone',
        title: 'Elige entre tus Favoritas',
        body: 'La IA selecciona recetas de tu biblioteca aptas para ese cliente: sin sus alérgenos ni lo que no le gusta.',
      },
      {
        kicker: '04 · Los macros se calculan',
        title: 'Gramos que cuadran',
        body: 'Un cálculo determinista, no la IA, ajusta los gramos de cada ingrediente a ±10 % en kcal, proteína, hidratos y grasa. Cada día se marca en verde, naranja o rojo.',
      },
      {
        kicker: '05 · Tú decides',
        title: 'Ajusta lo que quieras',
        body: 'Arrastra otra receta a un hueco, edita los gramos con los macros en vivo o pulsa «Recalcular» en un día que no encaja.',
      },
      {
        kicker: '06 · El entregable',
        title: 'PDF con tu logo',
        body: 'Calendario de la semana, resumen frente a objetivos y una página por receta con todos los pasos. Eliges las secciones y lo descargas.',
      },
    ],
    legend: {
      title: 'Colores de cumplimiento',
      green: 'Verde: todo encaja',
      orange: 'Naranja: calorías bien, macros fuera',
      red: 'Rojo: calorías fuera',
    },
  },

  features: {
    eyebrow: 'Funciones',
    headline: 'Lo que ya hace Nyamia.',
    sub: 'Todo lo que ves aquí ya funciona en la app.',
    items: [
      {
        title: 'Ficha de cliente',
        body: 'Objetivos diarios de kcal y macros, alérgenos, alimentos que no le gustan y estructura de comidas.',
      },
      {
        title: 'Tus recetas, en Favoritas',
        body: 'Busca recetas o guarda una desde un enlace. Antes de guardarla, ves si choca con alérgenos o gustos del cliente.',
      },
      {
        title: 'Menú semanal con colores',
        body: 'La semana entera de un vistazo. Cada día te dice si cumple, si fallan los macros o si fallan las calorías.',
      },
      {
        title: 'Mismos gramos toda la semana',
        body: 'Si una receta se repite en la semana de un cliente, lleva siempre las mismas cantidades.',
      },
      {
        title: 'Receta ajustada a cada cliente',
        body: 'Edita cantidades con los macros en vivo y guarda la versión de ese cliente sin tocar la receta original.',
      },
      {
        title: 'PDF con tu marca',
        body: 'Tu logo, el calendario, el resumen semanal y las recetas paso a paso. Eliges qué secciones incluir.',
      },
      {
        title: 'Varios clientes a la vez',
        body: 'Cada cliente en su ventana. Minimiza, cambia de uno a otro y retoma desde el historial de peticiones.',
      },
      {
        title: 'Todo en castellano',
        body: 'Interfaz, recetas y PDF. Si una traducción falla, la receta queda marcada como «Sin traducir».',
      },
    ],
  },

  control: {
    eyebrow: 'Control',
    headline: 'Tú decides. Siempre.',
    sub: 'Nyamia hace las cuentas. El criterio profesional es tuyo.',
    items: [
      {
        title: 'Una propuesta, no un veredicto',
        body: 'El menú generado se puede cambiar, recalcular o descartar. Al cliente solo llega el PDF que tú exportas.',
      },
      {
        title: 'La IA no inventa los números',
        body: 'La IA elige recetas. Las cantidades y los macros salen de un cálculo sobre los datos nutricionales de cada ingrediente.',
      },
      {
        title: 'Sin el nombre del cliente',
        body: 'Para generar el menú, el modelo de IA recibe objetivos, restricciones y recetas. No recibe el nombre ni el email del cliente.',
      },
      {
        title: 'Una herramienta de planificación',
        body: 'Nyamia te ayuda a planificar menús. No es un producto sanitario, no diagnostica ni trata, y no sustituye tu criterio.',
      },
    ],
    fictitiousNote: 'Todos los datos que aparecen en esta página son ficticios.',
  },

  demo: {
    eyebrow: 'Demo',
    headline: 'Mira cómo se cuadra una semana.',
    sub: 'Una demo en directo con clientes ficticios: de la ficha al PDF. Después decides si encaja en tu consulta.',
    languageNote: 'La app está en castellano.',
    form: {
      title: 'Solicitar demo',
      requiredLegend: 'Los campos marcados con * son obligatorios.',
      requiredMark: '*',
      optionalMark: '(opcional)',
      name: {
        label: 'Nombre y apellidos',
        placeholder: 'Ej. Laura Martín',
        help: '',
      },
      email: {
        label: 'Email',
        placeholder: 'tu@consulta.com',
        help: 'Solo se usa para responder a tu solicitud.',
      },
      role: {
        label: '¿Cuál es tu perfil?',
        placeholder: 'Elige una opción',
        help: '',
        options: {
          dietitian_private: 'Dietista-nutricionista en consulta privada',
          dietitian_clinical: 'Dietista-nutricionista generalista',
          clinic: 'Centro o clínica con varios profesionales',
          coach: 'Entrenador/a o coach',
          other: 'Otro perfil',
        },
      },
      practiceName: {
        label: 'Consulta o centro',
        placeholder: 'Nombre de tu consulta',
        help: '',
      },
      clientVolume: {
        label: 'Clientes activos al mes',
        placeholder: 'Sin especificar',
        help: 'Ayuda a preparar una demo a tu medida.',
        options: {
          '1-15': '1–15',
          '16-40': '16–40',
          '41-80': '41–80',
          '80+': 'Más de 80',
        },
      },
      message: {
        label: '¿Qué te gustaría ver?',
        placeholder: 'Ej. cómo se planifica una semana con cinco comidas al día',
        help: 'Máximo {max} caracteres.',
        counter: '{count}/{max}',
      },
      honeypot: {
        label: 'Deja este campo vacío',
      },
      consent: {
        label: 'He leído la {privacyLink} y acepto que Nyamia use estos datos para responder a mi solicitud de demo y contactarme sobre Nyamia.',
        linkLabel: 'información sobre privacidad',
      },
      submit: 'Solicitar demo',
      submitting: 'Enviando…',
      noScript: 'Para enviar el formulario hace falta JavaScript. Actívalo en tu navegador y recarga la página.',
    },
    validation: {
      nameRequired: 'Escribe tu nombre.',
      nameLength: 'El nombre debe tener entre 2 y 100 caracteres.',
      emailRequired: 'Escribe tu email.',
      emailInvalid: 'Revisa el email: no parece válido.',
      emailTooLong: 'El email es demasiado largo.',
      roleRequired: 'Elige tu perfil.',
      practiceNameTooLong: 'Máximo 120 caracteres.',
      messageTooLong: 'Máximo 1000 caracteres.',
      consentRequired: 'Para enviar la solicitud, acepta la información sobre privacidad.',
      summary: 'Revisa los campos marcados.',
    },
    success: {
      title: 'Solicitud recibida. Ahora, a ponerle fecha.',
      body: 'Te llegará un email a la dirección que has indicado para cerrar contigo el día y la hora de la demo. Responde con el hueco que mejor te venga y queda agendada.',
      again: 'Enviar otra solicitud',
    },
    errors: {
      invalid: 'Hay campos que revisar. Corrígelos y vuelve a enviar.',
      tooLarge: 'El mensaje es demasiado largo. Acórtalo y vuelve a enviar.',
      tooManyRequests: 'Se han enviado varias solicitudes seguidas desde aquí. Inténtalo de nuevo más tarde.',
      tooManyRequestsRetry: 'Se han enviado varias solicitudes seguidas desde aquí. Inténtalo de nuevo en {minutes} min.',
      server: 'No se ha podido enviar la solicitud. Inténtalo de nuevo en unos minutos.',
      network: 'No hay conexión con el servidor. Comprueba tu conexión y vuelve a intentarlo.',
      retry: 'Reintentar',
    },
    next: {
      title: 'Qué pasa después',
      steps: [
        {
          title: 'Un email para ponerle fecha',
          body: 'Te llega un email a la dirección que indiques para cerrar la demo directamente contigo.',
        },
        {
          title: 'Eliges día y hora',
          body: 'Respondes con el hueco que mejor te venga y la demo queda agendada.',
        },
        {
          title: 'Demo en directo',
          body: 'Ficha, menú semanal, ajuste de macros y PDF, con clientes ficticios.',
        },
      ],
    },
  },

  faq: {
    eyebrow: 'Preguntas',
    headline: 'Preguntas frecuentes.',
    items: [
      {
        q: '¿Para quién es Nyamia?',
        a: 'Para dietistas-nutricionistas que planifican menús ajustados a macros, sobre todo en consulta privada con foco deportivo o de composición corporal. También para consultas generalistas y centros pequeños. No es una app para el consumidor final.',
      },
      {
        q: '¿Qué hace la IA y qué no?',
        a: 'La IA elige recetas de tus Favoritas que encajan con el cliente. No calcula las cantidades: los gramos y los macros salen de un cálculo determinista. Tampoco diagnostica, ni trata, ni decide por ti.',
      },
      {
        q: '¿Cómo de preciso es el ajuste?',
        a: 'Cada día se ajusta para quedar a ±10 % de los objetivos de kcal, proteína, hidratos y grasa. Si con las recetas disponibles un día no encaja, queda marcado en naranja o rojo para que lo revises, lo recalcules o cambies una receta.',
      },
      {
        q: '¿Puedo usar mis propias recetas?',
        a: 'Sí. Guardas recetas desde un enlace o desde el buscador en tu biblioteca de Favoritas, y el menú se construye con ellas.',
      },
      {
        q: '¿Qué pasa con los datos de mis clientes?',
        a: 'Los datos de cada cuenta están separados de los de las demás. Para generar el menú, el modelo de IA recibe objetivos, restricciones y recetas, no el nombre ni el email del cliente. La demo se hace solo con datos ficticios.',
      },
      {
        q: '¿En qué idioma está y qué necesito?',
        a: 'Nyamia está en castellano: interfaz, recetas y PDF. Funciona en el navegador, sin instalar nada, y está pensada para usarse en ordenador.',
      },
    ],
  },

  finalCta: {
    headline: 'Tu próxima semana de menús, ya cuadrada.',
    cta: 'Solicitar demo',
  },

  footer: {
    tagline: 'Asistente IA de planificación de menús para dietistas-nutricionistas.',
    disclaimer: 'Nyamia es una herramienta de planificación. No es un producto sanitario y no sustituye el criterio profesional.',
    privacy: 'Privacidad',
    legal: 'Aviso legal',
    login: 'Entrar',
    language: 'English',
    copyright: '© {year} Nyamia',
    noCookies: 'Esta web no usa cookies.',
  },

  privacy: {
    title: 'Información sobre privacidad',
    version: '2026-10-30',
    updatedLabel: 'Última actualización: 30 de octubre de 2026',
    intro: 'Esta información explica cómo se tratan los datos que envías con el formulario de solicitud de demo de nyamia.com, conforme al artículo 13 del Reglamento General de Protección de Datos (RGPD).',
    sections: [
      {
        heading: 'Responsable del tratamiento',
        paragraphs: [
          'Responsable: Nyamia',
          'Email de contacto para privacidad: farnausgar@gmail.com',
        ],
      },
      {
        heading: 'Qué datos se tratan',
        paragraphs: [
          'Los que escribes en el formulario: nombre y apellidos, email, perfil profesional y, si los indicas, nombre de tu consulta o centro, número aproximado de clientes y mensaje. También el idioma de la página, la fecha de tu consentimiento y la versión de esta información que aceptaste.',
          'Para proteger el formulario frente a abusos se guardan además un código seudónimo calculado a partir de tu dirección IP con una clave secreta (hash), que no permite conocer la dirección sin esa clave, y el identificador de tu navegador recortado a 200 caracteres. La dirección IP como tal no se guarda con tu solicitud.',
        ],
      },
      {
        heading: 'Para qué se usan',
        paragraphs: [
          'Para responder a tu solicitud de demo, organizarla y contactarte sobre Nyamia.',
          'Ese código de la IP y el identificador del navegador se usan solo para limitar el número de envíos y evitar abusos.',
          'No se toman decisiones automatizadas ni se elaboran perfiles con estos datos.',
        ],
      },
      {
        heading: 'Base jurídica',
        paragraphs: [
          'Tu consentimiento (art. 6.1.a RGPD), que das al marcar la casilla del formulario. Puedes retirarlo en cualquier momento, sin que afecte a lo tratado antes de retirarlo.',
          'La protección del formulario frente a abusos se basa en el interés legítimo en mantener el servicio seguro (art. 6.1.f RGPD).',
        ],
      },
      {
        heading: 'Cuánto tiempo se conservan',
        paragraphs: [
          '12 meses desde el envío de la solicitud. Después se eliminan. Si retiras tu consentimiento o pides la supresión antes, se eliminan entonces.',
        ],
      },
      {
        heading: 'Quién más accede a ellos',
        paragraphs: [
          'Los datos no se ceden a terceros.',
          'Solo acceden los proveedores de alojamiento que tratan los datos por cuenta de Nyamia, como encargados del tratamiento, y únicamente para prestar ese servicio.',
          'Si alguno de estos proveedores trata datos fuera del Espacio Económico Europeo, se hace con las garantías que exige el RGPD, como las cláusulas contractuales tipo aprobadas por la Comisión Europea.',
        ],
      },
      {
        heading: 'Tus derechos',
        paragraphs: [
          'Puedes pedir acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad de tus datos, y retirar tu consentimiento, enviando un email a farnausgar@gmail.com.',
          'Si crees que tus datos no se han tratado correctamente, puedes presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).',
        ],
      },
      {
        heading: 'Datos obligatorios',
        paragraphs: [
          'Nombre, email, perfil profesional y consentimiento son necesarios para tramitar la solicitud. El resto de campos son opcionales.',
        ],
      },
      {
        heading: 'Cookies',
        paragraphs: [
          'Esta web no usa cookies ni herramientas de analítica, publicidad o seguimiento de terceros.',
        ],
      },
      {
        heading: 'Cambios en esta información',
        paragraphs: [
          'Si esta información cambia, se publicará una nueva versión con su fecha. Cada solicitud guarda la versión que se aceptó.',
        ],
      },
    ],
  },

  legal: {
    title: 'Aviso legal',
    updatedLabel: 'Última actualización: 30 de octubre de 2026',
    sections: [
      {
        heading: 'Titular de la web',
        paragraphs: [
          'En cumplimiento del artículo 10 de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE):',
          'Titular: Nyamia',
          'Email de contacto: farnausgar@gmail.com',
        ],
      },
      {
        heading: 'Objeto',
        paragraphs: [
          'nyamia.com presenta Nyamia, un asistente de planificación de menús para dietistas-nutricionistas, y permite solicitar una demo. La aplicación está en app.nyamia.com y se rige por sus propias condiciones.',
        ],
      },
      {
        heading: 'Uso de la web',
        paragraphs: [
          'Quien visita la web se compromete a usarla de forma lícita y a no enviar a través del formulario contenidos ilícitos o datos de terceros sin autorización.',
        ],
      },
      {
        heading: 'Contenido informativo',
        paragraphs: [
          'El contenido de esta web describe una herramienta de planificación para profesionales. No es consejo sanitario ni nutricional, y Nyamia no es un producto sanitario.',
          'Los datos, nombres y menús que aparecen en las ilustraciones son ficticios.',
        ],
      },
      {
        heading: 'Propiedad intelectual',
        paragraphs: [
          'La marca Nyamia, el logotipo, los textos, el diseño y el código de esta web pertenecen a su titular. No se permite su reproducción sin autorización.',
        ],
      },
      {
        heading: 'Responsabilidad',
        paragraphs: [
          'El titular procura que la información de la web sea correcta y esté actualizada, pero no garantiza la ausencia de errores ni la disponibilidad continua de la web.',
        ],
      },
      {
        heading: 'Legislación aplicable',
        paragraphs: [
          'Este aviso se rige por la legislación española.',
        ],
      },
    ],
    privacyLinkLabel: 'Información sobre privacidad',
  },

  notFound: {
    code: '404',
    headline: 'Esta página no existe.',
    body: 'Puede que el enlace esté mal escrito o que la página se haya movido.',
    home: 'Volver al inicio',
    cta: 'Solicitar demo',
  },

  /** Strings shown inside the animated app mockups. Fictitious data only. Mirrors app.nyamia.com wording where it exists. */
  mockup: {
    appName: 'Nyamia',
    illustrativeCaption: 'Ilustración con datos ficticios',
    sidebar: {
      newSession: '+ Nueva sesión',
      historyTitle: 'Historial',
      history: [
        { label: 'crea el menú de la semana para Laura' },
        { label: 'recetas para Laura' },
        { label: 'Laura M.' },
      ],
      settings: 'Ajustes',
    },
    commandBar: {
      placeholder: 'Pídeme algo: busca a un cliente, revisa un menú…',
      prompt: 'crea el menú de la semana para Laura',
      send: 'Enviar',
    },
    windows: {
      client: 'Ficha de cliente',
      calendar: 'Calendario',
      recipes: 'Recetas',
      favourites: 'Favoritas',
      menuPdf: 'PDF del menú',
      minimize: 'Minimizar ventana',
      close: 'Cerrar ventana',
    },
    client: {
      name: 'Laura M.',
      sections: {
        identity: 'Identidad',
        targets: 'Objetivos diarios',
        restrictions: 'Alérgenos y comidas favoritas',
        planning: 'Planificación',
      },
      targets: [
        { label: 'Calorías', value: '2100', unit: 'kcal' },
        { label: 'Proteína', value: '140', unit: 'g' },
        { label: 'Carbohidratos', value: '230', unit: 'g' },
        { label: 'Grasas', value: '70', unit: 'g' },
      ],
      allergensLabel: 'Alérgenos',
      allergens: [{ label: 'Frutos secos' }],
      dislikedLabel: 'Alimentos que no le gustan',
      disliked: [{ label: 'cilantro' }, { label: 'coliflor' }],
      mealsLabel: 'Comidas',
      meals: 'Desayuno · Comida · Merienda · Cena',
      save: 'Guardar cliente',
      edit: 'Editar',
    },
    menu: {
      weekLabel: 'Semana del lun, 2 nov',
      prevWeek: 'Semana anterior',
      nextWeek: 'Semana siguiente',
      createWeek: 'Crear menú de la semana',
      today: 'Menú de hoy',
      exportPdf: 'Exportar PDF',
      recalculate: 'Recalcular',
      favouritesTitle: 'Favoritas aptas · arrastra una receta a un hueco',
      generating: 'Eligiendo recetas de Favoritas…',
      fitting: 'Ajustando gramos…',
      done: 'Aquí tienes tu plan.',
      illustrative: 'Ilustrativo',
      days: [
        { short: 'lun', date: '2 nov' },
        { short: 'mar', date: '3 nov' },
        { short: 'mié', date: '4 nov' },
        { short: 'jue', date: '5 nov' },
        { short: 'vie', date: '6 nov' },
        { short: 'sáb', date: '7 nov' },
        { short: 'dom', date: '8 nov' },
      ],
      slots: {
        breakfast: 'Desayuno',
        lunch: 'Comida',
        merienda: 'Merienda',
        dinner: 'Cena',
      },
      status: {
        green: 'Cumple',
        orange: 'Macros fuera',
        red: 'Calorías fuera',
        none: 'Sin menú',
      },
      dayTotal: '{kcal}/2100 kcal · P {protein}/140',
      legend: {
        red: 'Rojo = Macros y calorías no encajan',
        orange: 'Naranja = Calorías OK pero macros no encajan',
        green: 'Verde = Todo encaja',
      },
    },
    recipes: [
      { title: 'Yogur griego con avena y frutos rojos', slot: 'breakfast' },
      { title: 'Tostada integral con aguacate y huevo', slot: 'breakfast' },
      { title: 'Pollo al curry con arroz basmati', slot: 'lunch' },
      { title: 'Lentejas estofadas con verduras', slot: 'lunch' },
      { title: 'Salmón al horno con patata y judías verdes', slot: 'lunch' },
      { title: 'Pavo a la plancha con quinoa', slot: 'lunch' },
      { title: 'Requesón con plátano y canela', slot: 'merienda' },
      { title: 'Tortilla de espinacas con pan integral', slot: 'dinner' },
      { title: 'Merluza en salsa verde con arroz', slot: 'dinner' },
      { title: 'Ensalada de garbanzos y atún', slot: 'dinner' },
    ],
    recipeModal: {
      title: 'Pollo al curry con arroz basmati',
      ingredientsLabel: 'Ingredientes',
      ingredients: [
        { name: 'Pechuga de pollo', grams: '165 g' },
        { name: 'Arroz basmati', grams: '80 g' },
        { name: 'Leche de coco ligera', grams: '60 g' },
        { name: 'Cebolla', grams: '70 g' },
        { name: 'Aceite de oliva virgen extra', grams: '8 g' },
      ],
      macros: [
        { label: 'Kcal', value: '615' },
        { label: 'Proteína', value: '45 g' },
        { label: 'Hidratos', value: '70 g' },
        { label: 'Grasa', value: '17 g' },
      ],
      save: 'Guardar',
      cancel: 'Cancelar',
    },
    refit: {
      title: 'Recalcular jue, 5 nov',
      confirm: 'Recalcular',
    },
    pdf: {
      windowTitle: 'PDF del menú',
      preview: 'Vista previa del PDF',
      logoTitle: 'Logo',
      logoPlaceholder: 'Tu logo',
      changeLogo: 'Cambiar logo',
      noLogo: 'Sin logo en este PDF',
      sections: [
        { label: 'Calendario de la semana' },
        { label: 'Resumen' },
        { label: 'Recetas' },
      ],
      download: 'Descargar',
      fileName: 'menu-laura-2026-11-02.pdf',
      docTitle: 'Menú semanal · Laura M.',
      docSubtitle: 'Semana del 2 al 8 de noviembre',
      summaryTitle: 'Media diaria frente a objetivos',
    },
    problemSheet: {
      fileName: 'menu_laura_v7_FINAL.xlsx',
      columns: [
        { label: 'Alimento' },
        { label: 'g' },
        { label: 'kcal' },
        { label: 'P' },
        { label: 'HC' },
        { label: 'G' },
      ],
      rows: [
        { food: 'Pechuga de pollo', grams: '150', kcal: '165', p: '35', hc: '0', g: '2' },
        { food: 'Arroz basmati', grams: '90', kcal: '315', p: '7', hc: '70', g: '1' },
        { food: 'Aceite de oliva', grams: '10', kcal: '90', p: '0', hc: '0', g: '10' },
      ],
      totalLabel: 'Total día',
      targetLabel: 'Objetivo',
      offLabel: 'Fuera',
    },
  },
}
