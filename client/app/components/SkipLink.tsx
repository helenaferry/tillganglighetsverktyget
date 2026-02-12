import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function SkipLink() {
  const location = useLocation();
  const [skipTargets, setSkipTargets] = useState<{ id: string; text: string }[]>([]);

  useEffect(() => {
    let skipAttempts = 0;
    const maxAttempts = 20;

    function pollForSkipTargets() {
      const targets = Array.from(document.querySelectorAll('.skip-target')).map((el, i) => {
        if (!el.id) el.id = `skip-target-${i + 1}`;
        return {
          id: el.id,
          text: el.getAttribute('data-skip-link-text') || 'Hoppa till nästa sektion',
        };
      });
      if (targets.length > 0) {
        setSkipTargets(targets);
      } else if (skipAttempts < maxAttempts) {
        skipAttempts++;
        setTimeout(pollForSkipTargets, 50);
      } else {
        setSkipTargets([]);
      }
    }
    pollForSkipTargets();
  }, [location.pathname]);

  return (
    <div>
      <a
        href="#h1"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white focus:px-4 focus:py-2 focus:rounded-md focus:z-50 transition"
      >
        Hoppa till huvudinnehåll
      </a>

      {skipTargets.map((target) => (
        <a
          key={target.id}
          href={`#${target.id}`}
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white focus:px-4 focus:py-2 focus:rounded-md focus:z-50 transition"
        >
          {target.text}
        </a>
      ))}
    </div>
  );
}
