const axios = require('axios');
const expect = require('chai').expect;
const AxiosMocker = require('../src/axios-mocker');

describe('AxiosMocker Tests', function () {
    let instance;

    beforeEach(function () {
        instance = axios.create();
    });

    it('can return mock data with 200 success', function (done) {
        new AxiosMocker(instance, [{
            req: {
                url: '/api/getData',
                method: 'GET'
            },
            res: {
                statusCode: 200,
                headers: {
                    'X-Custom-Header': '123'
                },
                contentType: 'application/json;',
                body: {
                    code: "1"
                },
                delay: 1000
            }
        }]);
        instance.get('/getData', {
            baseURL: 'https://some-domain.com/api/',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            },
            params: {
                id: 123,
                'some-param': '你好'
            }
        }).then(resp => {
            expect(resp.status).to.equal(200);
            expect(resp.headers['X-Custom-Header']).to.equal('123');
            expect(resp.data.code).to.equal('1');
            done();
        });
    });

    it('can return 500 error', function (done) {
        new AxiosMocker(instance, [{
            req: {
                url: '/api/getData'
            },
            res: {
                statusCode: 500
            }
        }]);
        instance.get('/api/getData').catch(error => {
            expect(error.response.status).to.equal(500);
            done();
        });
    });
});
