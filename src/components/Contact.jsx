import { useId, useRef, useState } from 'react'
import { CONTACT, RANGE } from '../content.js'
import LightText from './LightText.jsx'
import { useTitleReveal } from '../lib/light.js'
import './Contact.css'

/*
 * Formulaire de DÉMO (CLAUDE.md) : aucun action, aucun fetch.
 * La validation native (required, type=email) passe avant onSubmit ;
 * ensuite on affiche seulement le message, rien ne quitte la page.
 */
export default function Contact() {
  const uid = useId()
  const [sent, setSent] = useState(false)
  const rootRef = useRef(null)
  useTitleReveal(rootRef)
  const f = CONTACT.fields

  const onSubmit = (e) => {
    e.preventDefault()
    e.currentTarget.reset()
    setSent(true)
  }

  const field = (name, label, control) => (
    <div className="field">
      {control}
      <label className="field-label" htmlFor={`${uid}-${name}`}>
        {label}
      </label>
      <span className="field-line" aria-hidden="true" />
    </div>
  )

  return (
    <section className="section grid-5-7 contact" id="contact" ref={rootRef} aria-labelledby={`${uid}-title`}>
      <header className="contact-head">
        <h2 className="section-title contact-title" id={`${uid}-title`}>
          <LightText text={CONTACT.title} />
          <span className="led" />
        </h2>
        <p className="contact-intro">{CONTACT.intro}</p>
      </header>

      <form className="contact-form" onSubmit={onSubmit} onInput={() => sent && setSent(false)}>
        <div className="contact-row">
          {field(
            'name',
            f.name,
            <input id={`${uid}-name`} name="name" type="text" autoComplete="name" placeholder=" " required />,
          )}
          {field(
            'email',
            f.email,
            <input id={`${uid}-email`} name="email" type="email" autoComplete="email" placeholder=" " required />,
          )}
        </div>
        {field(
          'model',
          f.model,
          <select id={`${uid}-model`} name="model" defaultValue="" required>
            <option value="" disabled hidden />
            {RANGE.cards.map((c) => (
              <option key={c.name}>{c.name}</option>
            ))}
          </select>,
        )}
        {field(
          'message',
          f.message,
          <textarea id={`${uid}-message`} name="message" rows="4" placeholder=" " required />,
        )}

        <div className="contact-actions">
          <button type="submit" className="btn-outline">
            {CONTACT.submit}
            <span className="btn-arrow" aria-hidden="true">
              →
            </span>
          </button>
          <p className={`contact-status${sent ? ' is-on' : ''}`} role="status">
            {sent ? CONTACT.sent : ''}
          </p>
        </div>
      </form>
    </section>
  )
}
