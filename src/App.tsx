import './App.css'

const courses = [
  {
    title: 'Foundations',
    description: 'Core concepts explained from first principles, with guided exercises.',
  },
  {
    title: 'Hands-on Practice',
    description: 'Interactive lessons and projects to apply what you learn.',
  },
  {
    title: 'Track Progress',
    description: 'See your growth over time with quizzes and milestones.',
  },
]

function App() {
  return (
    <>
      <header id="site-header">
        <div className="logo">Tilad</div>
        <nav>
          <a href="#courses">Courses</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <section id="hero">
        <h1>Learn something new today</h1>
        <p>An educational platform built to make learning clear, guided, and engaging.</p>
        <a className="cta" href="#courses">
          Explore courses
        </a>
      </section>

      <section id="courses">
        <h2>What you'll find here</h2>
        <div className="course-grid">
          {courses.map((course) => (
            <div className="course-card" key={course.title}>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer id="contact">
        <p>&copy; {new Date().getFullYear()} Tilad. All rights reserved.</p>
      </footer>
    </>
  )
}

export default App
