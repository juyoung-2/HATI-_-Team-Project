/* home-infinite.js (ES5) */
(function () {
  function qs(sel) { return document.querySelector(sel); }

  var feedList = qs('.feed-list');
  if (!feedList) return;

  var offset  = 10;
  var hasMore = true;
  var loading = false;

  var sentinel    = document.createElement('div');
  sentinel.id     = 'homeSentinel';
  feedList.parentNode.appendChild(sentinel);

  function loadMore() {
    if (loading || !hasMore) return;
    loading = true;

    var ctx = document.body.getAttribute('data-ctx') || '';

    fetch(ctx + '/home/more?offset=' + offset + '&limit=10')
      .then(function (res) { return res.text(); })
      .then(function (html) {
        var tmp = document.createElement('div');
        tmp.innerHTML = html;

        var cards = tmp.querySelectorAll('.post-card');
        cards.forEach(function (card) { feedList.appendChild(card); });

        offset  += cards.length;
        hasMore  = cards.length >= 10;
        loading  = false;

        if (!hasMore) observer.disconnect();
      })
      .catch(function () { loading = false; });
  }

  var observer = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) loadMore();
  }, { rootMargin: '200px' });

  observer.observe(sentinel);

})();