function normalizeUrl(url) {
    return url.endsWith('/') ? url.substring(0, url.length - 1) : url;
}
