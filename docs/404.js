// Show the address the visitor tried (text only, never parsed as HTML)
(function () {
    var tried = location.pathname + location.search;
    if (tried && tried !== '/') {
        var box = document.getElementById('nfPath');
        box.querySelector('code').textContent = tried;
        box.hidden = false;
    }
})();
