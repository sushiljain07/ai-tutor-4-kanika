function buildGroup(label, count, blockClass) {
  const group = document.createElement('div');
  group.className = 'base-ten-group';

  const heading = document.createElement('div');
  heading.className = 'base-ten-group-label';
  heading.textContent = `${label} (${count})`;
  group.appendChild(heading);

  const row = document.createElement('div');
  row.className = 'base-ten-blocks-row';
  if (count === 0) {
    row.innerHTML = '<span class="base-ten-none">none</span>';
  } else {
    for (let i = 0; i < count; i++) {
      const block = document.createElement('div');
      block.className = blockClass;
      row.appendChild(block);
    }
  }
  group.appendChild(row);
  return group;
}

export function createBaseTenBlocks(container, number) {
  const hundreds = Math.floor(number / 100);
  const tens = Math.floor((number % 100) / 10);
  const ones = number % 10;

  const wrapper = document.createElement('div');
  wrapper.className = 'base-ten-wrapper';

  const caption = document.createElement('p');
  caption.className = 'base-ten-caption';
  caption.textContent = `${number} shown as blocks:`;
  wrapper.appendChild(caption);

  wrapper.appendChild(buildGroup('Hundreds', hundreds, 'base-ten-flat'));
  wrapper.appendChild(buildGroup('Tens', tens, 'base-ten-rod'));
  wrapper.appendChild(buildGroup('Ones', ones, 'base-ten-cube'));

  container.appendChild(wrapper);
}
