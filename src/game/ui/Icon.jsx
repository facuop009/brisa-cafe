// Small flat icons drawn for the game, so they look the same on every phone (no emoji fonts).
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }

const ICONS = {
  espresso: (
    <>
      <path d="M5 10h11v3a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z" fill="#f4efe6" stroke="#3a2a20" strokeWidth="1.4" />
      <path d="M6 11h9" stroke="#5a3a24" strokeWidth="2.2" />
      <path d="M16 11.5h1.5a2 2 0 0 1 0 4H16" fill="none" stroke="#3a2a20" strokeWidth="1.4" />
      <path d="M9 7c0-1 1-1 1-2M12 7c0-1 1-1 1-2" fill="none" stroke="#b9a99a" strokeWidth="1.3" strokeLinecap="round" />
    </>
  ),
  leche: (
    <>
      <path d="M8 3h8v3l2 3v12H6V9l2-3z" fill="#f7f4ee" stroke="#3b4a5c" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M6 13h12v4H6z" fill="#7fb2d9" />
      <path d="M8 6h8" stroke="#3b4a5c" strokeWidth="1.4" />
    </>
  ),
  espuma: (
    <path d="M7 18a4 4 0 0 1-.6-8 5 5 0 0 1 9.5-1.4A4.2 4.2 0 0 1 17.5 18z" fill="#fbf7ef" stroke="#a89a88" strokeWidth="1.4" strokeLinejoin="round" />
  ),
  agua: <path d="M12 3c3.5 4.6 6 7.8 6 11a6 6 0 0 1-12 0c0-3.2 2.5-6.4 6-11z" fill="#9fd0ec" stroke="#3d7ea6" strokeWidth="1.4" />,
  hielo: (
    <>
      <path d="M5 8l7-4 7 4v8l-7 4-7-4z" fill="#e3f4fb" stroke="#5aa3c4" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M5 8l7 4 7-4M12 12v8" fill="none" stroke="#5aa3c4" strokeWidth="1.2" />
    </>
  ),
  matcha: (
    <>
      <path d="M3 11h18a9 7 0 0 1-18 0z" fill="#e9e1d2" stroke="#4b5a33" strokeWidth="1.4" />
      <ellipse cx="12" cy="11" rx="8.4" ry="2" fill="#8fae4f" />
    </>
  ),
  granos: (
    <>
      <ellipse cx="12" cy="12" rx="5.5" ry="7.5" transform="rotate(30 12 12)" fill="#6b4024" stroke="#3a2214" strokeWidth="1.2" />
      <path d="M9 7c3 3 3 7 6 10" fill="none" stroke="#c9a27a" strokeWidth="1.3" strokeLinecap="round" />
    </>
  ),
  tazas: (
    <>
      <path d="M5 8h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z" fill="#f4efe6" stroke="#3a2a20" strokeWidth="1.4" />
      <path d="M16 9.5h1.5a2 2 0 0 1 0 4H16" fill="none" stroke="#3a2a20" strokeWidth="1.4" />
      <path d="M3 20h16" stroke="#3a2a20" strokeWidth="1.4" strokeLinecap="round" />
    </>
  ),
  chica: (
    <>
      <path d="M7 11h8v2.5a4 4 0 0 1-4 4h0a4 4 0 0 1-4-4z" fill="#f4efe6" stroke="#3a2a20" strokeWidth="1.4" />
      <path d="M15 12h1.2a1.6 1.6 0 0 1 0 3.2H15" fill="none" stroke="#3a2a20" strokeWidth="1.3" />
      <path d="M5 19.5h12" stroke="#3a2a20" strokeWidth="1.4" strokeLinecap="round" />
    </>
  ),
  grande: (
    <>
      <path d="M5 6h12v8a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z" fill="#f4efe6" stroke="#3a2a20" strokeWidth="1.4" />
      <path d="M17 8h1.6a2.2 2.2 0 0 1 0 4.4H17" fill="none" stroke="#3a2a20" strokeWidth="1.4" />
    </>
  ),
  vaso: (
    <>
      <path d="M7 3h10l-1.5 18h-7z" fill="#e8f3f7" fillOpacity="0.7" stroke="#4b7f95" strokeWidth="1.4" strokeLinejoin="round" />
      <rect x="9" y="8" width="3" height="3" rx="0.6" fill="#ffffff" stroke="#8cc1d6" strokeWidth="0.8" />
      <rect x="12" y="11" width="3" height="3" rx="0.6" fill="#ffffff" stroke="#8cc1d6" strokeWidth="0.8" />
    </>
  ),
  vasos: (
    <path d="M7 3h10l-1.5 18h-7z" fill="#e8f3f7" stroke="#4b7f95" strokeWidth="1.4" strokeLinejoin="round" />
  ),
  lazo: (
    <>
      <path d="M12 4c4.4 0 8 3 8 7s-3.6 8-8 8-8-4-8-8 3.6-7 8-7z" fill="#d79a52" stroke="#8a5424" strokeWidth="1.4" />
      <path d="M8 9c2 3 6 3 8 0M7.5 13.5c2.5 2.5 6.5 2.5 9 0" fill="none" stroke="#8a5424" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="10" cy="7.5" r="0.7" fill="#fff" />
      <circle cx="14.5" cy="11.5" r="0.7" fill="#fff" />
    </>
  ),
  coin: (
    <>
      <circle cx="12" cy="12" r="8" fill="#f2c53d" stroke="#a5781c" strokeWidth="1.4" />
      <path d="M12 7.5v9" stroke="#a5781c" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  star: <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z" fill="currentColor" />,
  bag: (
    <g {...S}>
      <path d="M5 8h14l-1 12H6z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </g>
  ),
  book: (
    <g {...S}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
      <path d="M4 20.5A2.5 2.5 0 0 0 6.5 21H20" />
    </g>
  ),
  pause: (
    <g {...S}>
      <path d="M9 5v14M15 5v14" strokeWidth="2.6" />
    </g>
  ),
  close: (
    <g {...S}>
      <path d="M6 6l12 12M18 6L6 18" strokeWidth="2.2" />
    </g>
  ),
  trash: (
    <g {...S}>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
    </g>
  ),
  hand: (
    <g {...S}>
      <path d="M8 13V6a1.5 1.5 0 0 1 3 0v5M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V5.5a1.5 1.5 0 0 1 3 0V14a6 6 0 0 1-6 6h-.5a6 6 0 0 1-4.6-2.2L3.5 15a1.6 1.6 0 0 1 2.4-2.1L8 15" />
    </g>
  ),
  order: (
    <g {...S}>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
      <path d="M9 8h6M9 12h6" />
    </g>
  ),
  cup: (
    <g {...S}>
      <path d="M5 9h11v4a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z" />
      <path d="M16 10h1.5a2 2 0 0 1 0 4H16" />
    </g>
  ),
}

export function Icon({ name, size = 24, className, title }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden={title ? undefined : true} role={title ? 'img' : undefined}>
      {title && <title>{title}</title>}
      {ICONS[name] || ICONS.cup}
    </svg>
  )
}
