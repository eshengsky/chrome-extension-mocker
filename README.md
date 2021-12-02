<a href="https://github.com/eshengsky/chrome-extension-mocker"><img src="https://github.com/eshengsky/chrome-extension-mocker/blob/master/public/icons/icon_128.png" height="120" align="right"></a>

# chrome-extension-mocker

A mock tool based on Chrome extension, no need to change any code, support dynamic mock data.

If you want to use v1 version, switch to [axios-mocker](https://github.com/eshengsky/chrome-extension-mocker/tree/axios-mocker) branch.

## Why need mock requests
* Instead of waiting for the dependent web service to develop and deploy, you just need to define the interface fields and the front back end can be developed in parallel.
* Some web service may contaminate the data in the production environment, while the real request will not be sent by simulating the request and specifying the response you want. 
* Many times, the web service may return various types of responses, and developers and testers need to verify if it is working correctly under different returns, for example, when web service status code is 500, the page can be displayed as expected. Creating the data through normal operations can sometimes be particularly cumbersome or difficult, while using mock requests is convenient, and boundary testing can be done efficiently if you want to return what you want. 
* It is the base of TDD (test-driven development) and automated testing.

## Preview
![](https://github.com/eshengsky/chrome-extension-mocker/blob/master/public/preview1.png)
![](https://github.com/eshengsky/chrome-extension-mocker/blob/master/public/preview2.png)

## Download

Download from [Chrome Web Store](https://chrome.google.com/webstore/detail/xxx).

Or, download and install as following:

1. Download the latest package in [Release](https://github.com/eshengsky/chrome-extension-mocker/releases/latest) page.
2. Open Chrome, enter `chrome://extensions/` in the address bar to enter the Chrome extension page, and check the `Developer mode`.
3. Drag the downloaded zip file to the page, and click on the `Add Extension` button.

## Usage

In Chrome browser, press `Ctrl+Shift+I` or `⌘+⌥+I` to open dev tools, go to `Mocker` panel.

Click the New button, and enter the mock data you want.
In Match Request panel, set which requests need to match, and in Mock Response panel, set the simulate response you want to return.

Note that if one request is matched, the original request will be redirected into a data uri, you can see details in Console panel.

## Development

```bash
$ yarn serve
```

## Package

```bash
$ yarn build
```

## Example

```bash
$ cd example
$ node server.js
```

Visit http://localhost:8369/example/index.html.

## Licence

MIT License

Copyright (c) 2021 Sky.Sun 孙正华

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
