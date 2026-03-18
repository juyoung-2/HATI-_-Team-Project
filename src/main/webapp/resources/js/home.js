document.addEventListener('DOMContentLoaded', function () {
  var brand = document.querySelector('.side-brand[data-home-url]');
  if (!brand) return;

  var url = brand.getAttribute('data-home-url');

  brand.addEventListener('click', function () {
    location.href = url;
  });

  brand.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      location.href = url;
    }
  });
});
