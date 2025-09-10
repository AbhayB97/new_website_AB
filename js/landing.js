window.addEventListener('DOMContentLoaded', () => {
  anime.timeline({ easing: 'easeOutExpo', duration: 750 })
    .add({
      targets: '#title',
      opacity: [0, 1],
      translateY: [-50, 0]
    })
    .add({
      targets: '.buttons button',
      opacity: [0, 1],
      translateY: [50, 0],
      delay: anime.stagger(200)
    }, '-=300');
});
