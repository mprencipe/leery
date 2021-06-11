function normalizeUrl(url) {
    return url.endsWith('/') ? url.substring(0, url.length - 1) : url;
}

const isChrome = window.chrome != null && window.navigator.vendor === "Google Inc."
