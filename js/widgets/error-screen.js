export function renderErrorScreen(root, { router, message }) {
  root.innerHTML = '';
  const card = document.createElement('div');
  card.className = 'card';

  const text = document.createElement('p');
  text.textContent = message ?? "Hmm, that didn't load properly. Let's head back and try again.";
  card.appendChild(text);

  const homeButton = document.createElement('button');
  homeButton.type = 'button';
  homeButton.className = 'button';
  homeButton.textContent = 'Back to home';
  homeButton.addEventListener('click', () => router.navigate('/home'));
  card.appendChild(homeButton);

  root.appendChild(card);
}
