export function clampValue(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function positionRatioToValue(ratio, min, max) {
  const raw = min + ratio * (max - min);
  return clampValue(Math.round(raw), min, max);
}

export function createNumberLine(container, { min, max, start }) {
  let value = clampValue(start, min, max);

  const wrapper = document.createElement('div');
  wrapper.className = 'number-line';

  const decButton = document.createElement('button');
  decButton.type = 'button';
  decButton.className = 'button secondary';
  decButton.textContent = '−1';
  decButton.setAttribute('aria-label', 'Step back one');

  const track = document.createElement('div');
  track.className = 'number-line-track';
  track.setAttribute('role', 'slider');
  track.setAttribute('aria-label', 'Number line');
  track.setAttribute('aria-valuemin', String(min));
  track.setAttribute('aria-valuemax', String(max));

  const marker = document.createElement('div');
  marker.className = 'number-line-marker';
  track.appendChild(marker);

  const incButton = document.createElement('button');
  incButton.type = 'button';
  incButton.className = 'button secondary';
  incButton.textContent = '+1';
  incButton.setAttribute('aria-label', 'Step forward one');

  const label = document.createElement('output');
  label.className = 'number-line-label';

  const minLabel = document.createElement('span');
  minLabel.className = 'number-line-endpoint number-line-endpoint-min';
  minLabel.textContent = min;
  const maxLabel = document.createElement('span');
  maxLabel.className = 'number-line-endpoint number-line-endpoint-max';
  maxLabel.textContent = max;
  track.append(minLabel, maxLabel);

  wrapper.append(decButton, track, incButton);

  function render() {
    const ratio = (value - min) / (max - min);
    marker.style.left = `calc(${ratio * 100}% - 24px)`;
    marker.textContent = String(value);
    label.textContent = `Current value: ${value}`;
    track.setAttribute('aria-valuenow', String(value));
  }

  function setValue(next) {
    value = clampValue(next, min, max);
    render();
  }

  decButton.addEventListener('click', () => setValue(value - 1));
  incButton.addEventListener('click', () => setValue(value + 1));

  function ratioFromEvent(evt) {
    const rect = track.getBoundingClientRect();
    return (evt.clientX - rect.left) / rect.width;
  }

  let dragging = false;
  track.addEventListener('pointerdown', (evt) => {
    dragging = true;
    track.setPointerCapture(evt.pointerId);
    setValue(positionRatioToValue(ratioFromEvent(evt), min, max));
  });
  track.addEventListener('pointermove', (evt) => {
    if (!dragging) return;
    setValue(positionRatioToValue(ratioFromEvent(evt), min, max));
  });
  track.addEventListener('pointerup', () => {
    dragging = false;
  });
  track.addEventListener('pointercancel', () => {
    dragging = false;
  });

  render();
  container.append(wrapper, label);

  return {
    element: wrapper,
    getValue: () => value,
    setValue,
  };
}
