import { useState } from 'react'
import { useT } from '../i18n'
import './BoardMembers.css'

/** Structural only — id and portrait are language-independent; name, title and
 *  word come from the message dictionary, keyed by id.
 *
 *  Portraits live in `public/assets/board/`. A missing file falls back to the
 *  dotted avatar below rather than a broken-image icon, so the section stays
 *  presentable until the real portraits land. */
const board: { id: string; photo: string }[] = [
  { id: 'abdullah-alrashid', photo: '/assets/board/Abdullah.png' },
  { id: 'bilal-zaki', photo: '/assets/board/Bilal.png' },
  { id: 'jomannah-bilal', photo: '/assets/board/Jomannah.png' },
]

function BoardMembers() {
  const t = useT()
  const [missing, setMissing] = useState<string[]>([])

  return (
    <section className="tld-section tld-board" id="board">
<div className="tld-section__heading">
        <h2>{t.board.heading}</h2>
      </div>
<br />


      <div className="tld-board__grid">
        {board.map((member) => {
          const hasPhoto = !missing.includes(member.id)
          const info = t.board.members[member.id]

          return (
            <article className="tld-board__card" key={member.id}>
              <div className="tld-board__avatar">
                {hasPhoto ? (
                  <img
                    src={member.photo}
                    alt={info.name}
                    loading="lazy"
                    draggable={false}
                    onError={() => setMissing((ids) => [...ids, member.id])}
                  />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <circle cx="12" cy="8.5" r="3.75" />
                    <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
                  </svg>
                )}
              </div>

              <div className="tld-board__body">
                <h3>{info.name}</h3>
                <p className="tld-board__title">{info.title}</p>
                <p className="tld-board__word">{info.word}</p>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default BoardMembers
