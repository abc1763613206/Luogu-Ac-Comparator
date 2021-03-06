// ==UserScript==
// @name         洛谷通过题目比较器 - yyfcpp
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  比较你和其他用户在洛谷通过的题目
// @author       yyfcpp
// @match        https://www.luogu.org/space/*
// @grant        none
// @namespace    https://github.com/abc1763613206/Luogu-Ac-Comparator
// ==/UserScript==


/*
 * 这是一个注释区，用于保存 TODO 之类的东西
 * 由于暂时不知道如何更改页面颜色，所以只能用 alert() 或者 console.log 显示。
 * 现在使用的是 O(n^2) 的比较算法。如果出现了 AC 数千的神犇，或许需要改为二分算法。
*/


function clearData(acs) {
    var res = new Array();
    for (var i = 1; i < acs.length; i++) { // 把每一行非题号字符删掉（从 1 开始循环为了避开 split 之后产生的垃圾）
        var tmpStr = "";
        for (var j = 0; j < acs[i].length; j++) {
            if (acs[i][j] != '"') { // 引号后面的不是题号部分字符
                tmpStr = tmpStr.concat(acs[i][j]); // 拼接字符串
            } else {
                break;
            }
        }
        if (acs[i].length > 50) { // 这是最后一个题目 / 下一个是「尝试过的题目」
            res.push(tmpStr);
            break;
        }
        res.push(tmpStr);
    }
    return res;
}


function extractData(content) {
    // 如果你有一个问题打算用正则表达式来解决，那么就是两个问题了。
    // 所以窝还是用 split() 解决这一个问题吧！
    // var re = new RegExp('\[<a data-pjax href="/problem/show\?pid=.*?">.*?</a>\]', 'g');
    // console.log(re.test(content));
    // var acs = content.match('/\[<a data-pjax href="/problem/show\?pid=(\S*)">(\S*)</a>\]/');
    // var acs = content.match(/^[<a data-pjax href="\/problem\/show\?pid=[A-Z]+[0-9]+">[A-Z]+[0-9]+<\/a>]/g);
    // console.log(acs);
    // var acs = content.replace(/\[<a data-pjax href="\/problem\/show\?pid=[A-Z]+[0-9]+>/g, '').replace(/<\/a>\]/g, ' ').split(' ');
    // console.log(acs);
    var acs = content.split('[<a data-pjax href="/problem/show?pid='); // 使用 split() 方法把通过的题目分割出来
    acs = clearData(acs); // 把分割好的数据清洁一下
    return acs;
}


function getAc(uid) {
    // 向指定的个人空间发送 get 请求，获取 AC 列表
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://' + window.location.host + '/space/show?uid=' + uid, false);
    xhr.send(null);
    console.log('got ' + uid + "'s AC list: " + xhr.status);
    if (xhr.status == 200) {
        // console.log(xhr.responseText);
        return extractData(xhr.responseText); // 返回自己的 AC 列表
    } else {
        return undefined;
    }
}


function compare(hisAc, myAc) {
    var tot = 0; // 对方 AC 自己却没有 AC 的总数
    for (var i = 0; i < hisAc.length; i++) {
        var meToo = false; // 自己是否 AC 过
        for (var j = 0; j < myAc.length; j++) {
            if (hisAc[i] == myAc[j]) {
                meToo = true;
                tot++;
                break;
            }
        }
        if (meToo == false) {
            console.log('[' + hisAc[i] + '] you have not accepted');
        }
    }
    console.log('Finished! 一共有 ' + tot + ' 道题目是对方 AC 了你没有 AC 的。');
}


function work() {
    console.log("this monkey is working now...");
    var myAc = getAc(myUid);
    var hisAc = getAc(hisUid);
    // console.log(myAc);
    // console.log(hisAc);
    compare(hisAc, myAc);
}




var myUid = document.getElementsByClassName("am-topbar-brand")[0].attributes["myuid"].value; // 获取当前登录账号的 uid
var myUrl = 'https://www.luogu.org/space/show?uid=' + myUid; // 获取自己个人主页的 URL
var nowUrl = window.location.href; // 获取当前所在个人主页的 URL
var hisUid = window.location.href.match(/uid=[0-9]+/)[0].substr(4); // 获取当前所在个人空间主人的 UID

if (myUrl != nowUrl) {
    work();
}
