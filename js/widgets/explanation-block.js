export function renderExplanationBlock(container, explanation) {
  const text = document.createElement('p');
  text.className = 'explanation-text';
  text.textContent = explanation.text;
  container.appendChild(text);

  if (explanation.example) {
    const example = document.createElement('div');
    example.className = 'example-box';
    example.innerHTML = `<span class="example-label">Example</span><p>${explanation.example}</p>`;
    container.appendChild(example);
  }
}
