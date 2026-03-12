(function () {
  'use strict';
  document.querySelectorAll('.report-show-more').forEach(function (btn) {
    var text = btn.previousElementSibling;
    // Hide button if content isn't actually clamped
    if (text.scrollHeight <= text.clientHeight + 2) {
      btn.style.display = 'none';
      return;
    }
    btn.addEventListener('click', function () {
      var expanded = text.classList.toggle('expanded');
      btn.textContent = expanded ? 'Show less' : 'Show more';
    });
  });
})();
