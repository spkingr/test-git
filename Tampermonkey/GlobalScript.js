// ==UserScript==
// @name         Global Script
// @namespace    http://tampermonkey.net/
// @version      0.20
// @description  try to take over the world!
// @author       You
// @match        https://github.com/*
// @match        https://*.github.io/*
// @match        https://proandroiddev.com/*
// @match        https://www.liaoxuefeng.com/*
// @match        https://blog.csdn.net/*
// @match        https://member.bilibili.com/*
// @match        https://bugstack.cn/*
// @match        https://docs.opencv.org/*
// @match        https://quasar.dev/*
// @match        https://www.topcpu.net/*
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // global settings
    const href = location.href;
    console.log('===> [Tampermonkey in Global script] Use jQuery, version:', jQuery.fn.jquery, '<===', '[', href, ']');

    // make button at right bottom, and set the callback
    const appendButton = (callback, text = 'CSS', size = 50, bgColor = '#2fa54a', textColor = 'white') => {
        let button = $(`<div>${text}</div>`).css({
            position: 'fixed',
            bottom: '50px',
            right: '50px',
            width: `${size}px`,
            height: `${size}px`,
            textAlign: 'center',
            lineHeight: `${size}px`,
            borderRadius: '50%',
            color: textColor,
            backgroundColor: bgColor,
            cursor: 'pointer',
            boxShadow: '1px 3px 2px #3c3c3c',
            zIndex: 99999,
        }).click(callback)
        $('body').append(button)
        return button
    }

    // whether is the page site matches
    const isHrefMatchOr = (...links) => {
        for (let link of links) {
            if (href.indexOf(link) != -1) {
                return true
            }
        }
        return false
    }

    // --------------------------------------------------
    // quasar.dev
    if (isHrefMatchOr('quasar.dev')) {
        const setFontSize = (time) => setTimeout(_ => {
            $('.doc-code, .doc-code__inner').css('fontSize', '20px')
            $('.doc-toc .q-item').css('fontSize', '20px')
            $('.app-menu .q-item').css('fontSize', '20px')
        }, time)

        $('body').css('fontSize', '22px')
        setFontSize(1000)
        appendButton(_ => setFontSize(0))
    }
    // --------------------------------------------------

    // --------------------------------------------------
    // opencv docs
    if (isHrefMatchOr('opencv.org')) {
        appendButton(_ => window.scrollTo(0, 0), 'Top')
    }
    // --------------------------------------------------

    // --------------------------------------------------
    // bugstack
    if (isHrefMatchOr('bugstack.cn')) {
        const removeVip = () => {
            $('.read-more-wrap').css('display', 'none');
            $('.lock').css('height', 'auto');
            $('script').remove();
        }

        setTimeout(removeVip, 3000);
        appendButton(removeVip, 'VIP')
    }
    // --------------------------------------------------

    // --------------------------------------------------
    // BILIBILI
    if (isHrefMatchOr('bilibili.com')) {
        const timeout = () => {
            if ($('a.name.ellipsis').length == 0) {
                setTimeout(timeout, 1000);
            } else {
                $('a.name.ellipsis').css({
                    'text-overflow': 'inherit',
                    'max-width': '100%',
                });
                console.log('===================> bilibili', $('a.name').length);
                $('ul.bcc-pagination li').click(function () {
                    console.log('===================> clicked:', $(this).text())
                    setTimeout(timeout, 1000)
                })
            }
        }
        setTimeout(timeout, 1000)
    }
    // --------------------------------------------------

    // --------------------------------------------------
    // GITHUB
    if (isHrefMatchOr('github')) {
        const setFontSize = () => {
            // for github.io read
            $('body').css('fontSize', '20px');
            $('.theme-default-content:not(.custom)').css('maxWidth', '960px');
            // for github code
            $('.blob-code-inner').css('fontSize', '16px');
            // for github readme
            $('.markdown-body').css('fontSize', '16px');
        }
        setFontSize()
        appendButton(setFontSize)
    }
    // --------------------------------------------------

    // --------------------------------------------------
    // for liaoxuefeng.com
    if (href.indexOf('liaoxuefeng.com')) {
        let css = {
            'font-size': '14px',
        };
        $('.x-wiki-content pre').css(css);
        $('pre > code').css(css);
    }
    // --------------------------------------------------

    // --------------------------------------------------
    // CSDN
    if (isHrefMatchOr('csdn.net')) {
        const printCSDNPage = () => {
            $("#side").remove();
            $("#comment_title, #comment_list, #comment_bar, #comment_form, .announce, #ad_cen, #ad_bot").remove();
            $(".nav_top_2011, #header, #navigator").remove();
            $(".p4course_target, .comment-box, .recommend-box, #csdn-toolbar, #tool-box").remove();
            $("aside").remove();
            $(".tool-box").remove();
            $("main").css('display', 'content');
            $("main").css('float', 'left');
            $("tool-box").remove();

            window.print();
        };

        let button = $('<button>Print CSDN</button>');
        button.css({
            position: 'fixed',
            padding: '16px',
            fontSize: '16px',
            backgroundColor: '#003b92',
            color: 'white',
            borderRadius: '8px',
            opacity: '0.5',
            top: '100px',
            left: (8 - button.outerWidth()) + 'px',
            zIndex: '99999',
        }).click(printCSDNPage)
        $('body').append(button)

        button.get(0).onmouseenter = function (e) {
            $(this).animate({ 'left': '0px' })
        };
        button.get(0).onmouseleave = function (e) {
            $(this).animate({ 'left': (8 - $(e.target).outerWidth()) + 'px' })
        };
    }
    // --------------------------------------------------

    // --------------------------------------------------
    // topcpu.net
    if (isHrefMatchOr('topcpu.net')) {
        const selections = ['p1000', 'p1200', 'p2000', 't1000', 't1200', 't2000', 'a1000', 'a2000', 'm1000m', 'rtx 3060', 'rtx 3050 ti']
        const inSelections = (text, array) => {
            for(let s of array) {
                if(text.toLowerCase().includes(s)){
                    return true
                }
            }
            return false
        }
        let button = appendButton(() => {
            const text = button.text()
            $('body > div.flex.flex-col > div:last > div').each(function(){
                if(! inSelections($(this).text(), selections)){
                    $(this).css('display', text === 'On' ? 'none' : 'block')
                }
            })
            button.text(text === 'On' ? 'Off' : 'On')
        }, 'On').css({
            'top': '40px',
            'right': '100px',
        })
    }
    // --------------------------------------------------
})();