/* explore-infinite.js (ES5) */
(function () {
  function qs(sel) { return document.querySelector(sel); }

  var feedList   = qs('.feed-list');
  var sentinel   = document.createElement('div');
  sentinel.id    = 'exploreSentinel';

  if (!feedList) return;

  // 컨트롤러에서 내려준 값
  var offset  = parseInt(document.body.getAttribute('data-next-offset') || '0', 10);
  var hasMore = document.body.getAttribute('data-has-more') === 'true';
  var loading = false;

  if (!hasMore) return;

  feedList.parentNode.appendChild(sentinel);

  function getParams() {
    var form    = qs('#exploreForm');
    var params  = new URLSearchParams();

    // q
    var qInput = qs('input[name="q"]');
    if (qInput && qInput.value) params.set('q', qInput.value);

    // type
    var hiddenType = qs('#hiddenType');
    var type = hiddenType ? hiddenType.value : 'all';
    params.set('type', type);

    // sort
    var hiddenSort = qs('#hiddenSort');
    if (hiddenSort) params.set('sort', hiddenSort.value);

    // hati
    var hatiInputs = document.querySelectorAll('.hiddenHati');
    hatiInputs.forEach(function (el) { params.append('hati', el.value); });

    params.set('offset', offset);
    params.set('limit', '10');

    return params.toString();
  }

  function loadMore() {
    if (loading || !hasMore) return;
    loading = true;

    var type     = (qs('#hiddenType') || {}).value || 'all';
    var endpoint = '/explore/more?' + getParams();

    fetch(endpoint)
      .then(function (res) { return res.text(); })
      .then(function (html) {
        var tmp = document.createElement('div');
        tmp.innerHTML = html;

        var cards = tmp.querySelectorAll('.post-card, .people-card, .opentalk-card');
        cards.forEach(function (card) { feedList.appendChild(card); });

        offset  += cards.length;
        hasMore  = cards.length >= 10;
        loading  = false;

        document.body.setAttribute('data-next-offset', offset);
        document.body.setAttribute('data-has-more', hasMore);

        if (!hasMore) observer.disconnect();
      })
      .catch(function () { loading = false; });
  }

  var observer = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) loadMore();
  }, { rootMargin: '200px' });

  observer.observe(sentinel);

})();