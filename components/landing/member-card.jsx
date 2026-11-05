'use client';
import { SocialLinks } from './site-links.jsx';
export function MemberCard({ member, onUnavailable, preload = false }) {
  const focus = member.photoFocus ?? {
    x: 50,
    y: 50,
    zoom: 1,
    aspectRatio: 1,
    rotation: 0,
  };
  const nameParts = member.name.trim().split(/\s+/);
  const initials = `${nameParts[0]?.[0] ?? ''}${nameParts.length > 1 ? (nameParts.at(-1)?.[0] ?? '') : ''}`;
  return (
    <article
      className="member-card"
      aria-label={`${member.fullName}, ${member.role}`}
    >
      <div className="member-photo">
        {member.image ? (
          <img
            className="member-photo-image"
            src={member.image}
            alt={member.name}
            loading={preload ? 'eager' : 'lazy'}
            fetchPriority="low"
            decoding="async"
            style={{
              width: `${100 * Math.max(1, focus.aspectRatio) * focus.zoom}%`,
              transformOrigin: '0 0',
              transform: `rotate(${focus.rotation ?? 0}deg) translate(-${focus.x}%, -${focus.y}%)`,
            }}
          />
        ) : (
          <span className="member-initials" aria-hidden="true">
            {initials}
          </span>
        )}
      </div>
      <h4>{member.name}</h4>
      <p>{member.role}</p>
      <SocialLinks member={member} onUnavailable={onUnavailable} />
    </article>
  );
}
