const Handlers = require('./handlers');

// mock browser storage
var mockSet;
global.browser = {
    storage: {
        local: {
            get: () => {
                return { data: {} };
            }
        }
    }
};

// mock isChrome check
global.isChrome = false;

// mock global function
global.normalizeUrl = (url) => url;

describe('Handlers', () => {

    beforeEach(() => {
        mockSet = jest.fn();
        global.browser.storage.local.set = mockSet;
    });

    /*
        CSP
    */
    test('Content Security Policy missing', async () => {
        const requestDetails = {
            url: 'http://foo.bar',
            type: 'main_frame',
            responseHeaders: []
        };
        const mockSetText = jest.fn();

        await Handlers.handleContentSecurityPolicy(requestDetails, mockSetText);

        expect(mockSet.mock.calls[0][0]).toMatchObject({ data: { 'http://foo.bar': { csp: true } } });
        expect(mockSetText.mock.calls[0][0]).toBe(requestDetails.url);
    });

    test('Content Security Policy present', async () => {
        const requestDetails = {
            url: 'http://foo.bar',
            type: 'main_frame',
            responseHeaders: [{ name: 'content-security-policy', value: 'some-value' }]
        };
        const mockSetText = jest.fn();

        await Handlers.handleContentSecurityPolicy(requestDetails, mockSetText);

        expect(mockSet.mock.calls.length).toBe(0);
        expect(mockSetText.mock.calls.length).toBe(0);
    });

    /*
        Clickjack
    */
    test('clickJacking missing', async () => {
        const requestDetails = {
            url: 'http://foo.bar',
            type: 'main_frame',
            responseHeaders: []
        };
        const mockSetText = jest.fn();

        await Handlers.handleClickJacking(requestDetails, mockSetText);

        expect(mockSet.mock.calls[0][0]).toMatchObject({ data: { 'http://foo.bar': { clickjack: true } } });
        expect(mockSetText.mock.calls[0][0]).toBe(requestDetails.url);
    });

    test('clickJacking present', async () => {
        const requestDetails = {
            url: 'http://foo.bar',
            type: 'main_frame',
            responseHeaders: [{ name: 'x-frame-options', value: 'deny' }]
        };
        const mockSetText = jest.fn();

        await Handlers.handleClickJacking(requestDetails, mockSetText);

        expect(mockSet.mock.calls.length).toBe(0);
        expect(mockSetText.mock.calls.length).toBe(0);
    });


    /*
        Server
    */
    test('Server present', async () => {
        const requestDetails = {
            url: 'http://foo.bar',
            type: 'main_frame',
            responseHeaders: [{ name: 'server', value: 'some server' }]
        };
        const mockSetText = jest.fn();

        await Handlers.handleServer(requestDetails, mockSetText);

        expect(mockSet.mock.calls[0][0]).toMatchObject({ data: { 'http://foo.bar': { server: true } } });
        expect(mockSetText.mock.calls[0][0]).toBe(requestDetails.url);
    });

    test('Server missing', async () => {
        const requestDetails = {
            url: 'http://foo.bar',
            type: 'main_frame',
            responseHeaders: []
        };
        const mockSetText = jest.fn();

        await Handlers.handleServer(requestDetails, mockSetText);

        expect(mockSet.mock.calls.length).toBe(0);
        expect(mockSetText.mock.calls.length).toBe(0);
    });

    /*
        HSTS
    */
    test('HSTS present', async () => {
        const requestDetails = {
            url: 'http://foo.bar',
            type: 'main_frame',
            responseHeaders: [{ name: 'strict-transport-security', value: 'max-age: 31536000' }]
        };
        const mockSetText = jest.fn();

        await Handlers.handleHSTS(requestDetails, mockSetText);

        expect(mockSet.mock.calls[0][0]).toMatchObject({ data: { 'http://foo.bar': { hsts: true } } });
        expect(mockSetText.mock.calls[0][0]).toBe(requestDetails.url);
    });

    test('HSTS missing', async () => {
        const requestDetails = {
            url: 'http://foo.bar',
            type: 'main_frame',
            responseHeaders: []
        };
        const mockSetText = jest.fn();

        await Handlers.handleHSTS(requestDetails, mockSetText);

        expect(mockSet.mock.calls.length).toBe(0);
        expect(mockSetText.mock.calls.length).toBe(0);
    });

    /*
        MIME
    */
    test('MIME missing', async () => {
        const requestDetails = {
            url: 'http://foo.bar',
            type: 'main_frame',
            responseHeaders: []
        };
        const mockSetText = jest.fn();

        await Handlers.handleMimeSniffing(requestDetails, mockSetText);

        expect(mockSet.mock.calls[0][0]).toMatchObject({ data: { 'http://foo.bar': { mimeSniffing: true } } });
        expect(mockSetText.mock.calls[0][0]).toBe(requestDetails.url);
    });

    test('MIME present', async () => {
        const requestDetails = {
            url: 'http://foo.bar',
            type: 'main_frame',
            responseHeaders: [{ name: 'x-content-type-options', value: 'nosniff' }]
        };
        const mockSetText = jest.fn();

        await Handlers.handleMimeSniffing(requestDetails, mockSetText);

        expect(mockSet.mock.calls.length).toBe(0);
        expect(mockSetText.mock.calls.length).toBe(0);
    });

    /*
        Referrer
    */
    test('Referrer missing', async () => {
        const requestDetails = {
            url: 'http://foo.bar',
            type: 'main_frame',
            responseHeaders: []
        };
        const mockSetText = jest.fn();

        await Handlers.handleReferrer(requestDetails, mockSetText);

        expect(mockSet.mock.calls[0][0]).toMatchObject({ data: { 'http://foo.bar': { referrerLeak: true } } });
        expect(mockSetText.mock.calls[0][0]).toBe(requestDetails.url);
    });

    test('Referrer present - unsafe-url', async () => {
        const requestDetails = {
            url: 'http://foo.bar',
            type: 'main_frame',
            responseHeaders: [{ name: 'referrer-policy', value: 'unsafe-url' }]
        };
        const mockSetText = jest.fn();

        await Handlers.handleReferrer(requestDetails, mockSetText);

        expect(mockSet.mock.calls[0][0]).toMatchObject({ data: { 'http://foo.bar': { referrerLeak: true } } });
        expect(mockSetText.mock.calls[0][0]).toBe(requestDetails.url);
    });

    test('Referrer present - origin', async () => {
        const requestDetails = {
            url: 'http://foo.bar',
            type: 'main_frame',
            responseHeaders: [{ name: 'referrer-policy', value: 'origin' }]
        };
        const mockSetText = jest.fn();

        await Handlers.handleReferrer(requestDetails, mockSetText);

        expect(mockSet.mock.calls[0][0]).toMatchObject({ data: { 'http://foo.bar': { referrerLeak: true } } });
        expect(mockSetText.mock.calls[0][0]).toBe(requestDetails.url);
    });

    test('Referrer present - origin-when-cross-origin', async () => {
        const requestDetails = {
            url: 'http://foo.bar',
            type: 'main_frame',
            responseHeaders: [{ name: 'referrer-policy', value: 'origin-when-cross-origin' }]
        };
        const mockSetText = jest.fn();

        await Handlers.handleReferrer(requestDetails, mockSetText);

        expect(mockSet.mock.calls[0][0]).toMatchObject({ data: { 'http://foo.bar': { referrerLeak: true } } });
        expect(mockSetText.mock.calls[0][0]).toBe(requestDetails.url);
    });

    test('Referrer present - nosniff', async () => {
        const requestDetails = {
            url: 'http://foo.bar',
            type: 'main_frame',
            responseHeaders: [{ name: 'referrer-policy', value: 'nosniff' }]
        };
        const mockSetText = jest.fn();

        await Handlers.handleReferrer(requestDetails, mockSetText);

        expect(mockSet.mock.calls.length).toBe(0);
        expect(mockSetText.mock.calls.length).toBe(0);
    });

    /*
        CORS
    */
    test('CORS present - unsafe', async () => {
        const requestDetails = {
            documentUrl: 'http://foo.bar',
            type: 'xmlhttprequest',
            responseHeaders: [{ name: 'access-control-allow-origin', value: '*' }]
        };
        const mockSetText = jest.fn();

        await Handlers.handleCors(requestDetails, mockSetText);

        expect(mockSet.mock.calls[0][0]).toMatchObject({ data: { 'http://foo.bar': { 'cors-star': true } } });
        expect(mockSetText.mock.calls[0][0]).toBe(requestDetails.documentUrl);
    });

    test('CORS present - safe', async () => {
        const requestDetails = {
            documentUrl: 'http://foo.bar',
            type: 'xmlhttprequest',
            responseHeaders: [{ name: 'access-control-allow-origin', value: 'http://foo.bar' }]
        };
        const mockSetText = jest.fn();

        await Handlers.handleCors(requestDetails, mockSetText);

        expect(mockSet.mock.calls.length).toBe(0);
        expect(mockSetText.mock.calls.length).toBe(0);
    });

    test('CORS missing', async () => {
        const requestDetails = {
            documentUrl: 'http://foo.bar',
            type: 'xmlhttprequest',
            responseHeaders: [{ name: 'x-content-type-options', value: 'nosniff' }]
        };
        const mockSetText = jest.fn();

        await Handlers.handleCors(requestDetails, mockSetText);

        expect(mockSet.mock.calls.length).toBe(0);
        expect(mockSetText.mock.calls.length).toBe(0);
    });

});
