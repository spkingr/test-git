// ==UserScript==
// @name         AutoLearn
// @namespace    http://tampermonkey.net/
// @version      0.23
// @description  自动学习0.23
// @author       You
// @match        https://*.hnzjpx.net/*
// @match        http://*.hnzjpx.net/*
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // global settings
    const href = location.href
    console.log('===> [Tampermonkey in Global script] Use jQuery, version:', jQuery.fn.jquery, '<===', '[', href, ']')
    // get the last index in query of href
    const query = 'index=['
    const i = href.indexOf(query)
    const index = i === -1 ? 0 : parseInt(href.substring(i + query.length, href.indexOf(']')))

    const isHomePage = url => url.includes(`user.hnzjpx.net/user`)
    const isDetailPage = url => url.includes(`hnzjpx.net/item/package/`)
    const isVideoPage = url => url.includes(`play.hnzjpx.net/player`)
    const mapElementsToProgress = elements => {
        let ps = []
        for (let e of elements) {
            ps.push(parseInt(e.innerText))
        }
        // include NaN
        return ps
    }

    const packages = [
        { pid: 142, index: 0, courses: [1197, 1200] },
        { pid: 52, index: 1, courses: [355, 370, 366, 368, 369, 358, 356, 357, 361, 360, 359, 362, 363, 365, 364] },
        { pid: 79, index: 0, courses: [413, 409, 412, 411, 410, 419, 416, 418, 415, 367, 375, 406, 417, 414] },
        { pid: 106, index: 1, courses: [420, 788, 787, 786, 785, 784, 783, 782, 781, 780, 779, 778, 777, 776,
            775, 774, 773, 772, 770, 769,768, 767, 766, 765, 764, 763, 423, 422, 421]
        },
        { pid: 125, index: 2, courses: [975, 976, 977, 979, 978, 980, 981, 982, 983, 984, 985, 986, 397,
            987, 988, 989, 990, 991, 992, 993] },
    ]

    const gotoHomePage = index => {
        location.href = `https://user.hnzjpx.net/user/trainingclass?${query}${index}]`
    }
    const gotoDetailPage = pid => setTimeout(() => {
        location.href = `http://www.hnzjpx.net/item/package/${pid}/detail?isCourse=true`
    }, 1000)
    const gotoPlayVideo = (pid, videoId) => setTimeout(() => {
        location.href = `http://play.hnzjpx.net/player/${videoId}/play?package_id=${pid}`
    }, 1000)

    if (isHomePage(href)) {
        // 主页，选择包
        console.log('%cHome ====> ', 'color: blue; font-size:16px;')
        if(index + 1 >= packages.length) {
            alert(`所有课程都已经结束，信息：[${index + 1}/${packages.length}]`)
            return
        }
        const pid = packages[index + 1].pid
        gotoDetailPage(pid)
        return
    }

    if (isDetailPage(href)) {
        // 详情页，大量课程和进度条
        console.log('%cDetail ====> ', 'color: green; font-size:16px;')
        setTimeout(findAndGotoPlay, 3000)
    }

    if (isVideoPage(href)) {
        // 来到播放页面
        console.log('%cVideo ====> ', 'color: red; font-size:16px;')
        setTimeout(playOrReturn, 3000)
    }

    // 查找所有的进度，有0%的就开始播放，如果没有就找50%以下的，否则跳转下一个
    function findAndGotoPlay() {
        let match = href.match(/package\/(\d+)\/detail/)
        let pid = parseInt(match[1])
        const pack = packages.find(p => p.pid === pid) ?? packages[0]
        // .alreadyCourse-box .ant-progress-text => 0% => progress text
        let elements = document.querySelectorAll('.alreadyCourse-box .ant-progress-text')
        let ps = mapElementsToProgress(elements)
        for (let i = 0; i < ps.length; i++) {
            if (ps[i] <= 50) {
                gotoPlayVideo(pid, pack.courses[i])
                return
            }
        }
        // 没有找到，回到主页
        gotoHomePage(pack.index)
    }

    let count = 0
    let list = null
    function playing(videoId, pid) {
        if(! list) {
            $.ajax({
                url: `http://api.hnzjpx.net/qm/api/v5/course/${videoId}/outline/list`,
                method: 'post',
                data: {
                    full_domain_name: 'www.hnzjpx.net',
                    package_id: pid,
                },
                xhrFields: {
                    withCredentials: true
                },
            }).then(data => {
                list = data?.data ?? []
            })
        }

        count ++
        if (count >= 30) {
            count = 0
            let i = $('li.section.active').index() + 1
            let contentId = list[i]?.sub_content_id ?? 0
            let status = list[i]?.status ?? 'I'
            console.log(`%c~~~save: [${contentId}] in [${pid}]`, 'color: green; font-size: 16px;')
            $.ajax({
                url: `http://api.hnzjpx.net/qm/api/v5/course/${videoId}/play/save`,
                method: 'post',
                data: {
                    full_domain_name: 'www.hnzjpx.net',
                    current_sub_content_id: contentId,
                    status: status,
                    suspend_data: 600 - (500 * Math.random()).toFixed(0),
                    suspend_time: (80 * Math.random()).toFixed(0),
                    saveType: 'finish',
                    package_id: pid,
                },
                xhrFields: {
                    withCredentials: true
                },
            }).then(data => console.log('%c~~~ Response: ' + data, 'color: green;'))
        }
        playOrReturn()
    }

    function playOrReturn() {
        let match = href.match(/player\/(\d+)\/play\?package_id=(\d+)$/)
        let pid = -1
        let pack = null
        let videoId = -1
        let videoIndex = -1
        if (match && match[1] && match[2]) {
            pid = parseInt(match[2])
            pack = packages.find(p => p.pid === pid)
            videoId = parseInt(match[1])
            videoIndex = pack?.courses?.indexOf(videoId) ?? -1
        }

        // 全部播放完还是在播放中？
        let sections = $('li.section')
        let isOver = true
        $('li.section').each(function(){
            let label = $(this).find('.ant-tag-text').text()
            let type = $(this).find('.type').text()
            if (label.includes('未完成') && type.includes('视频')) {
                isOver = false
            }
        })
        console.log(`===> 结束了吗？ isOver = ${isOver}`)

        // 没有结束，每隔10秒继续查看
        if (!isOver) {
            const video = $('video').get(0)
            if(video && video.paused) {
                video.play()
            }
            if(video && video.volume > 0) {
                video.volume = 0
            }
            setTimeout(playing, 10000, videoId, pid)
            return
        }

        // 所有视频结束了
        if (pack) {
            if (videoIndex === -1 || videoIndex === pack.courses.length - 1) {
                // 最后一个了，查看下一个package
                gotoDetailPage(pack.index + 1)
                return
            }
            // 播放下一个video
            videoIndex ++
            gotoPlayVideo(pid, pack.courses[videoIndex])
            return
        }
        gotoHomePage(index)
    }
})();