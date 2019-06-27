var URL = "https://www.tianluoge.com/api/";
// var URL = "https://www.tianluoge.cn/api/";
var ERRMSG = '网络忙,请重试';
//封装请求
function ajax(url, data, success, fail, offline) {
    if (api.connectionType == 'none') {
        failToast('网络异常');
        hideProgress();
        offline();
        return false;
    }
    var token =api.getPrefs({
        sync: true,
        key: 'token'
    })

    api.ajax({
        url: URL + url,
        method: 'post',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json;charset=utf-8'
        },
        data: {
            body: data
        }
    }, function(ret, err) {
        if (ret) {
            success(ret)
        } else {
            fail(err)
        }
    });
}
//监听网络断开
function fnAppNetwork(offline, online) {
    api.addEventListener({
        name: 'offline'
    }, function(ret, err) {
        failToast('网络异常');
        offline(ret)
        return false;
    });
    api.addEventListener({
        name: 'online'
    }, function(ret, err) {
        online(ret)
        return false;
    });
}

//图片浏览
function fnOpenPhotoBrowser(images, activeIndex) {
    // if(api.systemType == "ios") {
    //     return false;
    // }
    var _photoBrowser = api.require('photoBrowser');
    _photoBrowser.open({
        images: images,
        activeIndex: activeIndex,
        // placeholderImg: 'widget://imame/loading.gif',
        bgColor: '#000'
    }, function(ret, err) {
        if (ret) {
            if (ret.eventType == "longPress") {
                return;
                var url = images[ret.index];
                api.actionSheet({
                    cancelTitle: '取消',
                    buttons: ['保存到相册']
                }, function(ret, err) {
                    if (ret.buttonIndex == 1) {
                        api.saveMediaToAlbum({
                            path: url
                        }, function(ret, err) {
                            if (ret && ret.status) {
                                messageToast('保存成功');
                            } else {
                                messageToast('保存失败');
                            }
                        });
                    }
                });
            } else if (ret.eventType == "click") {
                _photoBrowser.close();
            }
        } else {
            alert(JSON.stringify(err));
        }
    });
}
//封装提示层
function messageToast(messageText) {
    api.toast({
        msg: messageText ? messageText : '',
        duration: 2000,
        location: 'middle'
    });
}

// 成功类：
function successToast(title) {
    var toast = new auiToast();
    toast.success({
        title: title ? title : '',
        duration: 2000
    });
}

//失败类：
function failToast(title) {
    var toast = new auiToast();
    toast.fail({
        title: title ? title : '',
        duration: 2000
    });
}
//打开加载层
function showProgress(title, text) {
    api.showProgress({
        title: title ? title : '',
        text: text ? text : '',
        animationType: 'fade',
        modal: true
    });
}

//关闭加载层
function hideProgress() {
    api.hideProgress();
}
//监听设备断网
function offline() {
    api.addEventListener({
        name: 'offline'
    }, function(ret, err) {
        alert('断网了');
    });
}
//监听设备连网
function online() {
    api.addEventListener({
        name: 'online'
    }, function(ret, err) {
        alert('连网了');
    });
}
//JSON.parse
function fnJSONparse(data) {
    if (typeof data == 'string') {
        var data = JSON.parse(data);
    }
    return data;
}
//判断iphone x
function isIphoneX() {
    return /iphone/gi.test(navigator.userAgent) && (screen.height == 812 && screen.width == 375)
}
//滑动到顶部
function pageUp(time) {
    setTimeout(function() {
        api.pageUp({
            top: true,
            animate: true
        }, function(ret) {});
    }, time || 0)
}
//滑动到底部
function pageDown(time) {
    setTimeout(function() {
        api.pageDown({
            bottom: true,
            animate: true
        }, function(ret) {

        });
    }, time || 0)
}
//验证版本号
function toNum(a) {
    var a = a.toString();
    var c = a.split('.');
    var num_place = ["", "0", "00", "000", "0000"],
        r = num_place.reverse();
    for (var i = 0; i < c.length; i++) {
        var len = c[i].length;
        c[i] = r[len] + c[i];
    }
    var res = c.join('');
    return res;
}

function checkPlugin(a, b) {
    var a = toNum(a);
    var b = toNum(b);
    if (a == b) {
        return false;
    } else if (a > b) {
        return false;
    } else {
        return true;
    }
}

/*
 *轮播模块
 */
function fnUIScrollPicture(iamges) {
    // var _img = [];
    // if (iamges[0] != 'widget://image/nopic.png') {
    //     for (var i = 0; i < iamges.length; i++) {
    //         _img.push(iamges[i]+'?imageMogr2/auto-orient')
    //     }
    // }else {
    //     _img = iamges
    // }
    var UIScrollPicture = api.require('UIScrollPicture');
    UIScrollPicture.open({
        rect: {
            x: 0,
            y: 0,
            w: api.winWidth,
            h: api.winWidth / 2
        },
        data: {
            paths: iamges

        },
        styles: {
            indicator: {
                align: 'center',
                color: '#FFFFFF',
                activeColor: '#DA70D6'
            }
        },
        contentMode: 'scaleAspectFit',
        interval: 3,
        fixedOn: api.frameName,
        loop: true,
        fixed: false
    }, function(ret, err) {
        if (ret) {
            if (ret.eventType == 'click') {
                fnOpenPhotoBrowser(iamges, 0)
            }
        } else {
            // alert(JSON.stringify(err));
        }
    });
}


// 将时间戳转换成日期格式：
function timestampToTime(timestamp) {
    timestamp = timestamp.toString().length == 13 ? timestamp : (timestamp * 1000);
    var _date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
    Y = _date.getFullYear() + '-';
    M = (_date.getMonth() + 1 < 10 ? '0' + (_date.getMonth() + 1) : _date.getMonth() + 1) + '-';
    D = _date.getDate() + ' ';
    h = _date.getHours() + ':';
    m = _date.getMinutes() + ':';
    s = _date.getSeconds();
    return Y + M + D + h + m + s;
}
//去掉秒
function fnClipSecond(data) {
    if (data) {
        var res = data.split(' ')
        var day = res[0];
        var time = res[1];
        time = time.split(':')[0] + ":" + time.split(':')[1];
        return day + " " + time;
    }
}
//截取字符串装换成对象
function parseStrObjByFor(strDes, delimiter) {
    var obj = {};
    if (strDes == null || strDes == '') {
        return obj;
    }
    delimiter = delimiter || ";";
    var arr = strDes.split(delimiter);
    var k, v, sub;
    for (var i = 0, len = arr.length; i < len; i++) {
        if (arr[i] !== '') {
            sub = arr[i].split("=");
            k = sub[0];
            v = sub[1];
            if (k !== '') {
                obj[k] = v;
            }
        }
    }
    return obj;
}
//哈希算法
var hexcase = 0; /* hex output format. 0 - lowercase; 1 - uppercase */
var chrsz = 8; /* bits per input character. 8 - ASCII; 16 - Unicode */
/*
 *
 * The main function to calculate message digest
 *
 */
function hex_sha1(s) {
    return binb2hex(core_sha1(AlignSHA1(s)));
}

/*
 *
 * Perform a simple self-test to see if the VM is working
 *
 */
function sha1_vm_test() {
    return hex_sha1("abc") == "a9993e364706816aba3e25717850c26c9cd0d89d";
}

/*
 *
 * Calculate the SHA-1 of an array of big-endian words, and a bit length
 *
 */
function core_sha1(blockArray) {

    var x = blockArray; // append padding
    var w = Array(80);

    var a = 1732584193;

    var b = -271733879;

    var c = -1732584194;

    var d = 271733878;

    var e = -1009589776;

    for (var i = 0; i < x.length; i += 16) // 每次处理512位 16*32
    {

        var olda = a;

        var oldb = b;

        var oldc = c;

        var oldd = d;

        var olde = e;

        for (var j = 0; j < 80; j++) // 对每个512位进行80步操作
        {

            if (j < 16)
                w[j] = x[i + j];

            else
                w[j] = rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);

            var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)), safe_add(safe_add(e, w[j]), sha1_kt(j)));

            e = d;

            d = c;

            c = rol(b, 30);

            b = a;

            a = t;

        }

        a = safe_add(a, olda);

        b = safe_add(b, oldb);

        c = safe_add(c, oldc);

        d = safe_add(d, oldd);

        e = safe_add(e, olde);

    }

    return new Array(a, b, c, d, e);

}

/*
 *
 * Perform the appropriate triplet combination function for the current
 * iteration
 *
 * 返回对应F函数的值
 *
 */
function sha1_ft(t, b, c, d) {

    if (t < 20)
        return (b & c) | ((~b) & d);

    if (t < 40)
        return b ^ c ^ d;

    if (t < 60)
        return (b & c) | (b & d) | (c & d);

    return b ^ c ^ d; // t<80
}

/*
 *
 * Determine the appropriate additive constant for the current iteration
 *
 * 返回对应的Kt值
 *
 */
function sha1_kt(t) {

    return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 : (t < 60) ? -1894007588 : -899497514;

}

/*
 *
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 *
 * to work around bugs in some JS interpreters.
 *
 * 将32位数拆成高16位和低16位分别进行相加，从而实现 MOD 2^32 的加法
 *
 */
function safe_add(x, y) {

    var lsw = (x & 0xFFFF) + (y & 0xFFFF);

    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);

    return (msw << 16) | (lsw & 0xFFFF);

}

/*
 *
 * Bitwise rotate a 32-bit number to the left.
 *
 * 32位二进制数循环左移
 *
 */
function rol(num, cnt) {

    return (num << cnt) | (num >>> (32 - cnt));

}

/*
 *
 * The standard SHA1 needs the input string to fit into a block
 *
 * This function align the input string to meet the requirement
 *
 */
function AlignSHA1(str) {

    var nblk = ((str.length + 8) >> 6) + 1,
        blks = new Array(nblk * 16);

    for (var i = 0; i < nblk * 16; i++)
        blks[i] = 0;

    for (i = 0; i < str.length; i++)

        blks[i >> 2] |= str.charCodeAt(i) << (24 - (i & 3) * 8);

    blks[i >> 2] |= 0x80 << (24 - (i & 3) * 8);

    blks[nblk * 16 - 1] = str.length * 8;

    return blks;

}

/*
 *
 * Convert an array of big-endian words to a hex string.
 *
 */
function binb2hex(binarray) {

    var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";

    var str = "";

    for (var i = 0; i < binarray.length * 4; i++) {

        str += hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) +

            hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF);

    }

    return str;

}
