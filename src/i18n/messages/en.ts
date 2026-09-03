import { ar } from './ar'

// English UI copy. Annotated `: typeof ar` so TypeScript flags any key that is
// present in Arabic but missing (or mistyped) here.
export const en: typeof ar = {
  header: {
    brandAria: 'Tilad',
    signIn: 'Sign in',
    register: 'Build with us',
    langLabel: 'ع',
    langAria: 'Switch to Arabic',
  },

  hero: {
    title: 'An elite partnership to inspire the next generation',
    subtitle:
      'A student-led platform that prepares you to compete on the world stage — from your project’s first idea to the moment you stand before the judging panel.',
    ctaStudent: 'I’m a student',
    ctaParent: 'I’m a parent',
  },

  why: {
    heading: 'Why is Tilad the right fit for you?',
  },

  about: {
    heading: 'What is Tilad?',
    paragraphs: [
      'Tilad didn’t start in an office. It started with students who entered the competitions themselves — who lived the pressure of judging, struggled through the research, and learned from their own mistakes.',
      'And when they were done, one question wouldn’t let go: why should the next student have to start from zero all over again? That’s where Tilad came from — to shorten the road we walked the hard way.',
      'Every lesson and every file here is built on real experience: what worked, what wasted our time, and what we wish someone had told us from the start.',
    ],
    quote: 'From student to student',
    quoteBy: 'Tilad’s motto, and our approach to everything we do',
  },

  board: {
    heading: 'Board of Directors',
    members: {
      'abdullah-alrashid': {
        name: 'Abdullah Alrashid',
        title: 'Executive Director',
        word:
          'We started Tilad because we walked the road ourselves, and we know how hard it is to begin from nothing with no one to guide you. Our goal is clear: every student with an idea deserves a platform that takes them by the hand all the way to the international stage. We don’t want you to repeat our mistakes — we want you to start where we stopped, and go further.',
      },
      'bilal-zaki': {
        name: 'Bilal Zaki',
        title: 'Operations Director',
        word:
          'Everything you see here — the lessons, the files, the mentors — should reach you without any friction. My job is to make sure no student wastes time wondering where to start or what comes next. We build Tilad organized on the inside so it feels simple on the outside, and you can focus on your project and nothing else.',
      },
      'jomannah-bilal': {
        name: 'Jomannah Bilal',
        title: 'Research Program Director',
        word:
          'Research isn’t just a paper you write and finish — it’s a way of thinking that stays with you for life. My job is to take your curiosity and turn it into a clear research question you can actually work on, and to stand with you step by step from the idea to the result. I want every student to leave Tilad knowing how to research and ask questions on their own, not just how to repeat what others have said.',
      },
    },
  },

  mentors: {
    heading: 'Our Mentors',
    lead: 'Students who competed before you, ready to walk with you step by step — from the first idea to the final presentation.',
    regionAria: 'Tilad mentors',
  },

  aboutPage: {
    eyebrow: 'About Tilad',
    title: 'What is Tilad?',
    lead: 'A Saudi student-led platform preparing students to compete at international science fairs — built by students who competed themselves.',
    impactHeading: 'Tilad in numbers',
    storyEyebrow: 'The beginning',
    storyHeading: 'How it started',
    story: [
      'Tilad didn’t start in an office. It started with students who entered the competitions themselves — who lived the pressure of judging, struggled through the research, and learned from their own mistakes.',
      'And when they were done, one question wouldn’t let go: why should the next student have to start from zero all over again? That’s where Tilad came from — to shorten the road we walked the hard way.',
      'Every lesson and every file here is built on real experience: what worked, what wasted our time, and what we wish someone had told us from the start. No filler content, and nothing generic you could find anywhere else.',
    ],
    missionEyebrow: 'Our mission',
    mission:
      'That every Saudi student with an idea finds the road drawn out ahead of them — until they stand before an international judging panel, ready.',
    missionNote: 'Knowing where to start, who to ask, and what each stage asks of them.',
    valuesHeading: 'What sets us apart',
    values: [
      {
        title: 'From student to student',
        body: 'We don’t talk down to you. Everything here is written in the language of a student who lived the same stage and knows exactly where it gets hard.',
      },
      {
        title: 'Experience before theory',
        body: 'We only add a lesson if it came from a real situation — something that worked for us, or a mistake we paid for and want you to avoid.',
      },
      {
        title: 'Clarity without clutter',
        body: 'One step at a time, each with an output you can tell you’ve finished. We won’t drown you in options and leave you stuck.',
      },
      {
        title: 'Impact beyond you',
        body: 'The student we prepare today is tomorrow’s mentor. Tilad is built to grow through the people who pass through it.',
      },
    ],
    ctaHeading: 'Ready to start?',
    ctaBody: 'Create your account, pick the program that fits your stage, and we’ll walk with you from the first idea.',
  },

  whyPage: {
    eyebrow: 'Why Tilad',
    title: 'Why is Tilad the right fit for you?',
    lead: 'Three things make the difference: content that comes from real experience, a clear path to follow, and support that’s there when you need it.',
    includedHeading: 'Exactly what you get',
    includedLead: 'Everything here has a plain name — come back to this list in a month and check we delivered on it.',
    included: [
      'Recorded lessons ordered by project stage, from the idea to the final presentation',
      'A library of papers, posters, presentations and research plans from projects that went far',
      'Live sessions where you get feedback on your project — not on a generic example',
      'Ready-made templates that save you the formatting so you can focus on the content',
      'Progress tracking, so you know where you’ve got to and what’s left',
    ],
    mythsHeading: 'Things a lot of people assume — and get wrong',
    mythsLead: 'The three most common reasons a student doesn’t sign up. All three rest on a mistaken idea.',
    mythLabel: 'The common assumption',
    truthLabel: 'The reality',
    misconceptions: [
      {
        myth: 'I have to be a top student to join',
        truth:
          'What we need from you is an idea and commitment. Most of the students who got far started with a simple idea and steady work — not with a particular GPA.',
      },
      {
        myth: 'I need a lab and expensive equipment',
        truth:
          'Most strong projects ran on simple tools or on openly available data. The difference comes from the research question and how it’s carried out, not from the price of the equipment.',
      },
      {
        myth: 'I don’t have time alongside school',
        truth:
          'The program is broken into small steps you can move through in a few hours a week, and everything is recorded so you can come back to it whenever suits you.',
      },
    ],
    ctaHeading: 'Start where we left off',
    ctaBody: 'Create your account and pick the program that fits your stage.',
  },

  mentorsPage: {
    eyebrow: 'The team',
    title: 'Our Mentors',
    lead: 'Students who competed before you, ready to walk with you step by step — from the first idea to the final presentation.',
    filterAria: 'Filter mentors by track',
    filterAll: 'All',
    count: (n: number) => (n === 1 ? '1 mentor' : `${n} mentors`),
    loading: 'Loading profiles…',
    failed: 'We couldn’t load the mentor list. Refresh the page and try again.',
    empty: 'No mentors are listed right now. Check back soon.',
    emptyTrack: 'No mentors in this track right now.',
    ctaHeading: 'Want one of them walking with you?',
    ctaBody: 'Create your account and pick your program — the live sessions come with it.',
  },

  quiz: {
    heading: 'Which program fits you?',
    intro: 'Answer 3 quick questions and we’ll tell you where you belong — and send the details to your inbox.',
    step: (n: number, total: number) => `Question ${n} of ${total}`,
    next: 'Next',
    showResult: 'Show result',
    back: 'Back',
    bestForYou: 'Best for you',
    formIntro: 'Enter your name and email and we’ll send you the full details.',
    nameLabel: 'Name',
    namePlaceholder: 'Your full name',
    emailLabel: 'Email',
    submit: 'Send me the details',
    restart: 'Start over',
    errorName: 'Enter your name so we know how to address you.',
    errorEmail: 'Check your email address — something looks off.',
    errorSubmit: 'We couldn’t receive your details right now. Please try again in a moment.',
    doneTitle: (firstName: string) => `We got your request, thanks ${firstName} 👋`,
    doneBodyPrefix: 'We’ve noted your interest in ',
    doneBodySuffix: '. We’ll send the program details and how to take part to your inbox soon.',
    doneHint: 'If the message doesn’t arrive, check your spam folder.',
    doneRestart: 'Take the quiz again',
  },

  footer: {
    tagline: 'From student to student',
    navAria: 'Site links',
    cols: {
      platform: 'Platform',
      tilad: 'Tilad',
      account: 'Your account',
    },
    links: {
      programs: 'Programs',
      files: 'Files & resources',
      signIn: 'Sign in',
      register: 'Create account',
      about: 'About Tilad',
      why: 'Why Tilad',
      mentors: 'Our mentors',
      activate: 'Activate account',
      reset: 'Reset password',
      profile: 'My profile',
    },
    rights: (year: number) => `© ${year} Tilad. All rights reserved.`,
    terms: 'Terms & Conditions',
    privacy: 'Privacy Policy',
  },
}
