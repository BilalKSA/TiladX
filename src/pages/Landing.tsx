import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import Footer from '../components/Footer'
import ProgramQuiz from '../components/ProgramQuiz'
import GalleryStrip from '../components/GalleryStrip'
import MentorStrip from '../components/MentorStrip'
import { socials } from '../data/social'
import './Home.css'
import './Landing.css'

const icon = (path: ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    {path}
  </svg>
)

const benefits = [
  
  {
    icon: icon(
      <>
        <path d="M12 3 3 8l9 5 9-5-9-5Z" />
        <path d="M6.5 10.5V16c0 1.4 2.5 2.8 5.5 2.8s5.5-1.4 5.5-2.8v-5.5" />
      </>,
    ),
    title: 'من ناس جرّبوها فعلاً',
    description: 'المحتوى مبني على تجارب طلاب وصلوا للمنافسات الدولية، مو على كلام نظري.',
  },
  {
    icon: icon(
      <>
        <path d="M5 19V5a2 2 0 0 1 2-2h9l3 3v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z" />
        <path d="M9 8h6M9 12h6M9 16h4" />
      </>,
    ),
    title: 'مسار واضح خطوة بخطوة',
    description: 'تعرف وش تسوي هذي الأسبوع ووش الخطوة اللي بعدها، بدون ما تحتار من وين تبدأ.',
  },
  {
    icon: icon(
      <>
        <rect x="3" y="4" width="18" height="14" rx="2" />
        <path d="M8 21h8M12 18v3" />
      </>,
    ),
    title: 'جلسات مباشرة',
    description: 'تسأل مباشرة وتاخذ ملاحظات على مشروعك قبل لا يفوت وقت التعديل.',
  },
  {
    icon: icon(
      <>
        <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2v13a1.6 1.6 0 0 0-1.6-1.6H4Z" />
        <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2v13a1.6 1.6 0 0 1 1.6-1.6H20Z" />
      </>,
    ),
    title: 'مكتبة جاهزة تحت يدك',
    description: 'بوسترات وملفات ونماذج حقيقية من مشاريع سابقة تقدر تتعلم منها وتبني عليها.',
  },
  {
    icon: icon(
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>,
    ),
    title: 'معك وقت ما تبي',
    description: 'كل شي في مكان واحد، من جوالك أو لابتوبك، وتتابع على راحتك.',
  },
]

const faqs = [
  {
    question: 'كيف أنضم لتلاد؟',
    answer:
      'تقدر تنشئ حسابك بنفسك من صفحة التسجيل. بعدها تفعّل اشتراكك عشان توصل لمحتوى البرامج — الدروس، المكتبة، والجلسات.',
  },
  {
    question: 'وصلتني رسالة من تلاد، كيف أبدأ؟',
    answer:
      'روح لصفحة تفعيل الحساب، وأدخل بريدك الإلكتروني اللي وصلتك عليه الرسالة، واختر كلمة مرور. بعدها تقدر تسجّل دخولك ببريدك أو برقم حسابك.',
  },
  {
    question: 'نسيت كلمة المرور، كيف أستعيدها؟',
    answer:
      'من صفحة تسجيل الدخول اضغط «نسيت كلمة المرور؟» وأدخل بريدك الإلكتروني. بيوصلك رابط تقدر تغيّر منه كلمة المرور.',
  },
  {
    question: 'ما وصلتني أي رسالة على بريدي، وش السبب؟',
    answer:
      'أول شي تأكد من مجلد الرسائل غير المرغوب فيها (Spam أو Junk)، لأن رسائلنا أحياناً توصل هناك. لو ما لقيتها، تواصل معنا عبر حساباتنا وبنساعدك.',
  },
  {
    question: 'المحتوى للمبتدئين ولا يحتاج خبرة سابقة؟',
    answer:
      'البرامج مصمّمة تبدأ معك من الصفر. لو عندك خبرة سابقة تقدر تتخطى الأساسيات وتركّز على المراحل المتقدمة من المسار.',
  },
]

function Landing() {
  return (
    <div className="tld-marketing">
      <header className="tld-marketing__header">
        <div className="tld-marketing__header-inner">
          <Link to="/" className="tld-marketing__brand" aria-label="تلاد">
            <Logo />
          </Link>

          <nav className="tld-marketing__nav" aria-label="روابط الصفحة">
            <a href="#about">عن تلاد</a>
            <a href="#mentors">المرشدون</a>
            <a href="#why">ليش تلاد</a>
            <a href="#faq">الأسئلة الشائعة</a>
          </nav>

          <div className="tld-marketing__header-actions">
            <ThemeToggle />
            <Link to="/login" className="tld-button tld-button--primary tld-button--sm">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ---- hero ---- */}
        <section className="tld-hero tld-marketing__hero">
          <span className="tld-marketing__eyebrow">مؤسسة تلاد للعلم والتطوير</span>
          <h1>من الطالب وإلى الطالب</h1>
          <p>
            منصة طلابية تجهّزك للمنافسة في المحافل الدولية، من أول فكرة لمشروعك إلى لحظة ما توقف قدّام لجنة
            التحكيم.
          </p>
          <div className="tld-marketing__hero-actions">
            <Link to="/login" className="tld-button tld-button--on-primary tld-button--lg">
              تسجيل الدخول
            </Link>
            <a href="#quiz" className="tld-marketing__hero-link">
              مو متأكد وش يناسبك؟ جاوب ٣ أسئلة
            </a>
          </div>
        </section>

        {/* ---- photo strip ---- */}
        <GalleryStrip />

        {/* ---- about ---- */}
        <div className="tld-marketing__band" id="about">
        <section className="tld-section tld-marketing__about">
          <div className="tld-marketing__about-text">
            <div className="tld-section__heading">
              <h2>وش هي تلاد؟</h2>
            </div>
            <p>
              تلاد ما بدأت من مكتب. بدأت من طلاب عاشوا ودخلوا المنافسة بنفسهم، عاشوا ضغط التحكيم، وتعبوا في البحث،
              وتعلّموا من أخطائهم.
            </p>
            <p>
              وبعد ما خلصوا، كان في سؤال واحد يلحّ عليهم: ليش الطالب اللي بعدنا لازم يبدأ من الصفر مرة ثانية؟ من هنا
              طلعت تلاد — عشان نختصر عليك الطريق اللي مشيناه بالغلط.
            </p>
            <p>
              كل درس وكل ملف هنا مبني على تجربة حقيقية: وش اللي نفع، ووش اللي ضيّع وقتنا، ووش اللي كنّا نتمنى أحد
              يقوله لنا من البداية.
            </p>
          </div>

          <aside className="tld-marketing__quote">
            <span className="tld-marketing__quote-mark" aria-hidden="true">
              ”
            </span>
            <p>من الطالب وإلى الطالب</p>
            <span className="tld-marketing__quote-by">شعار تلاد، ومنهجنا في كل شي نسوّيه</span>
          </aside>
        </section>
        </div>

        {/* ---- mentors ---- */}
        <div id="mentors">
          <section className="tld-section tld-marketing__strip-head">
            <div className="tld-section__heading">
              <h2>مرشدونا</h2>
            </div>
            <p className="tld-section__lead">
              طلاب خاضوا المنافسة قبلك، وحاضرين يمشون معك خطوة بخطوة من أول فكرة لين آخر عرض.
            </p>
          </section>
          <MentorStrip />
        </div>

        {/* ---- why tilad ---- */}
        <section className="tld-section" id="why">
          <div className="tld-section__heading">
            <h2>ليش تلاد هي الأنسب لك؟</h2>
          </div>
          <p className="tld-section__lead">
            كل شي في المنصة مبني عشان يوصلك لنتيجة، مو عشان يزيد عدد الدروس اللي عندك.
          </p>

          <div className="tld-grid tld-marketing__benefits">
            {benefits.map((item) => (
              <article className="tld-card" key={item.title}>
                <span className="tld-marketing__benefit-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ---- quiz ---- */}
        <section className="tld-section tld-marketing__quiz-section" id="quiz">
          <div className="tld-marketing__quiz-intro">
            <h2>أي برنامج يناسبك؟</h2>
            <p>جاوب على ٣ أسئلة سريعة ونقول لك وين مكانك، ونرسل لك التفاصيل على بريدك.</p>
          </div>
          <ProgramQuiz />
        </section>

        {/* ---- faq ---- */}
        <section className="tld-section" id="faq">
          <div className="tld-section__heading">
            <h2>الأسئلة الشائعة</h2>
          </div>

          <div className="tld-faq">
            {faqs.map((item) => (
              <details className="tld-faq__item" key={item.question}>
                <summary>
                  {item.question}
                  <span className="tld-faq__chevron" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </span>
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ---- contact + final cta ---- */}
        <section className="tld-marketing__cta" id="contact">
          <h2>جاهز تبدأ رحلتك؟</h2>
          <p>سجّل الدخول برقم حسابك وتابع برامجك في تلاد.</p>
          <Link to="/login" className="tld-button tld-button--primary tld-button--lg">
            تسجيل الدخول
          </Link>

          <div className="tld-marketing__contact">
            <span>عندك سؤال ثاني؟ تواصل معنا</span>
            <div className="tld-marketing__contact-socials">
              {socials.map((social) => (
                <a key={social.label} href={social.href} aria-label={social.label}>
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Landing
