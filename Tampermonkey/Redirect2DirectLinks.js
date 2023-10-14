// ==UserScript==
// @name         Redirect2Direct Links
// @namespace    http://tampermonkey.net/
// @version      0.14
// @description  去掉掘金、CSDN、知乎等转发链接
// @author       You
// @match        https://*.juejin.cn/*
// @match        https://*.zhihu.com/*
// @match        https://*.csdn.net/*
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // global settings
    const href = location.href;
    console.log('===> [Tampermonkey in Global script] Use jQuery, version:', jQuery.fn.jquery, '<===', '[', href, ']');

    // whether is the page site matches
    const isHrefMatchOr = (...links) => {
        for (let link of links) {
            if (href.indexOf(link) != -1) {
                return true
            }
        }
        return false
    }

    // extract the url from href
    const extractUrl = (url, prefix) => decodeURIComponent(url.substring(url.indexOf(prefix) + prefix.length))
    const replaceHref = (regexp, prefix = 'target=') => $('a').filter((_, a) => regexp.test(a.href) && a.href.includes(prefix)).each((_, a) => a.href = extractUrl(a.href, prefix)).length
    const timeoutExtract = (regexp, prefix = 'target=', delay = 5000) => setTimeout(() => replaceHref(regexp, prefix), delay)

    // --------------------------------------------------
    // juejin.cn 掘金
    if(isHrefMatchOr('juejin.cn')) {
        timeoutExtract(/link.juejin.cn/)
    }

    // --------------------------------------------------
    // zhihu.com 知乎
    if(isHrefMatchOr('zhihu.com')) {
        const reg = /link.zhihu.com/
        const repeatWork = () => {
            const id = setInterval(() => replaceHref(reg) === 0 ? clearInterval(id) : undefined, 2000)
        }
        repeatWork()
        $('html').click(repeatWork)
    }

    // --------------------------------------------------
    // csdn.net CSDN
    if(isHrefMatchOr('csdn.net')) {
        $('#content_views a').click(function() {
            console.log('%c~~~ goto: ' + $(this).attr('href'), 'color: green;')
            window.open($(this).attr('href'), "_blank");
            return false
        })
    }
})();