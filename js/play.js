;(function($){
    // 用ajax异步请求获取json文件
    var xhr = new XMLHttpRequest();
    xhr.open('get','/audio.json',true);
    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4 && xhr.status == 200){
            // console.log(JSON.parse(xhr.responseText))
            // 将获取到的json文件赋给变量 songs
            var songs = JSON.parse(xhr.responseText)
            
            // 通过循环把歌曲名渲染到前端页面上
            // for(var i in songs){
            //     $('.content ul').append('<li>' + songs[i].name + '</li>');
            // }
            $.each(songs,function (idx,song) {
                $('.content ul').append('<li>' + song.name + '</li>');
            })

            // 获取到播放器audio
            var player = document.getElementById('player');
            // console.log(player)

            // 设置初始值
            var index = 0; // 默认初始播放第一首歌
            var timer = null; // 设置计时器
            var allTime = null; // 设置全部时长
            var curTime = null; // 设置当前时长
            var songTime = null; // 设置歌词计时器
            var vol = 0.1; // 设置默认音量

            // 默认第一首歌
            // 设置被选中样式
            $('.content li').eq(index).addClass('click');
            // 将json中的歌曲地址赋给audio
            player.src = songs[index].url; // src每次都写成scr找半天错，无语了
            // 默认音量
            player.volume = vol;

            // 点击播放按钮，播放音乐
            $('.pp').click(function(){
                // 如果是播放按钮
                if($(this).hasClass('play')){
                    player.play();
                    // 播放图标变成暂停图标
                    $(this).removeClass('play');
                    $(this).addClass('pause');
                    play(index);
                }else{
                    player.pause();
                    // 暂停图标变成播放图标
                    $(this).removeClass('pause');
                    $(this).addClass('play');
                    // 暂停后清理计时器，不清理的话每一秒钟都在调用计时器里的方法
                    // 但是同时再次点击时有一秒钟的延迟问题，这里如果是为了页面美观可以不要清理计时器
                    clearInterval(timer);
                }
            })

            
            // 定义一个点击方法，当点击这首歌时播放这首歌
            $('.content li').click(function() {
                var newIndex = $(this).index();
                // console.log(newIndex);
                // 被点击的歌曲激活样式，其他的不被激活
                $(this).addClass('click').siblings().removeClass('click')
                // 调用播放方法
                play(newIndex);
            })

            // 设置一个播放方法
            function play(index){
                // 改变audio的src
                player.src = songs[index].url;
                player.play();
                // 点击别的歌曲时，若当前播放键为（三角形），则换成（直立等于）
                if($('.pp').hasClass('play')){
                    // console.log(11)
                    $('.pp').removeClass('play')
                    $('.pp').addClass('pause');
                }

                // 获取当前歌曲的歌词
                getSongText(songs[index].lrc)
            }

            // for(let o in $('li')){
            //     $($('li')[o]).on('click',function() {
            //         // console.log($('li')[o])
            //         $('.audio-span').html('');
            //         $('.audio-span').append('<audio src="' + songs[o].url + '" controls autoplay></audio>');
            //         // 被点击的歌曲改变样式
            //         $(this).addClass('selected').siblings().removeClass('selected')
            //     })
            //     // 点击上一首，返回上一首
            //     $('#last').on('click',function() {
            //         // console.log(111)
            //         $('.audio-span').html('');
            //         $('.audio-span').append('<audio src="' + songs[o].url + '" controls autoplay></audio>');
            //         $($('li')[o]).addClass('selected').siblings().removeClass('selected')
            //     })             
            // }

            // 点击上一曲，回到上一曲（如果当前是第一首，则回到最后一首）
            $('.prev').click(function() {
                // 获取当前播放的歌下标减一
                var newIndex =  $('.click').index() - 1;
                
                // 如果获取的是第一首歌的下标0，减一为-1，作条件判断语句
                newIndex = newIndex < 0 ? $('.content li').length - 1 : newIndex;
                // console.log(newIndex)
                // 将click赋给获得的新下标的li标签
                $('.content li').eq(newIndex).addClass('click').siblings().removeClass('click');
                // 调用play方法
                play(newIndex)
            }) 

            // 点击下一曲，进到下一曲（如果当前是最后一首，则回到第一首）
            $('.next').click(function() {
                // 获取当前播放的歌下标加一
                var newIndex =  $('.click').index() + 1;
                
                // 如果获取的是最后一首歌的下标4，加1为5，作条件判断语句
                newIndex = newIndex > 4 ? 0 : newIndex;
                // console.log(newIndex)
                // 将click赋给获得的新下标的li标签
                $('.content li').eq(newIndex).addClass('click').siblings().removeClass('click');
                // 调用play方法
                play(newIndex)
            }) 

            // 获取当前歌曲的总时长，注意这里加载音频资源是异步的，如果没有加载完成就获取歌曲总时长，则duration返回NaN
            player.addEventListener('loadedmetadata',function(){    //加载完成后
                at = fixTime(player.duration);
                // 把拼接好的时间渲染到前端
                $('.alltime').html(at);

                
            })

            // 显示实时进度
            player.addEventListener('playing',function(){
                // 这里需要用到计数器，一秒钟刷一次，这样才能达到实时的效果
                timer = setInterval(() => {
                    setCurTime(player.currentTime);
                }, 1000);
                
            })

            // 重置时间和进度条
            function setCurTime(nowtime,sking){
                // 判断是否跳跃
                if(sking){
                    // 修改当前时间
                    player.currentTime = nowtime;
                }
                ct = fixTime(player.currentTime);
                $('.curtime').html(ct);
                // 进度条跟着前进，首先获得当前进度长度
                allTime = parseInt(player.duration);
                curTime = parseInt(player.currentTime);
                var proWidth = (curTime / allTime) * $('.progress').width();
                $('.progress p').width(proWidth)
                // console.log(proWidth)
                // 测试后发现播放完后进度条没有满，因此进行一个判断语句
                proWidth = proWidth < $('.progress').width() ? proWidth : $('.progress').width();

                // 进度条点击跳转
                $('.progress').click(function(){
                    // 获取当前鼠标点击的位置
                    // console.log(getMousePosition().left)
                    // console.log($('.progress').offset())
                    var long = (getMousePosition().left) - ($('.progress').offset().left);
                    // console.log(long)
                    // 将当前点击的长度重新给p标签
                    $('.progress p').width(long);
                    // 获得当前点击长度的时间
                    var nowtime = (long/$('.progress').width()) * allTime;
                    // 清除当前的时间
                    clearInterval(timer);
                    setCurTime(nowtime,true);
                })
            }

            // 鼠标点击位置
            function getMousePosition(e){
                var e = e || window.event;
                var x = e.pageX;
                var y = e.pageY;
                return {'left':x,'top':y}
            }

            // 当一首歌播放完毕后，改变图标，同时清理计时器
            player.addEventListener('ended',function () {
                $('.pp').removeClass('pause');
                $('.pp').addClass('play');
                clearInterval(timer);
                clearInterval(songTime);
                // 判断当前是否是全部循环
                if($('.a-loop').hasClass('aon')){
                    // 播放下一首
                    // 获取当前播放的歌下标加一
                    var newIndex =  $('.click').index() + 1;
                    
                    // 如果获取的是最后一首歌的下标4，加1为5，作条件判断语句
                    newIndex = newIndex > 4 ? 0 : newIndex;
                    // console.log(newIndex)
                    // 将click赋给获得的新下标的li标签
                    $('.content li').eq(newIndex).addClass('click').siblings().removeClass('click');
                    // 调用play方法
                    play(newIndex)
                    // console.log(1)
                }
            })
            // 定义一个修改时间格式的方法
            function fixTime(time){
                // 这里获得的总时长是秒数，我们要把它转换成时间格式
                var m = parseInt(parseInt(time) / 60);   // 得到分钟数
                var s = parseInt(parseInt(time) - m * 60);   // 得到秒数
                // console.log(s)
                // 拼接格式mm:ss
                var at = (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
                return at;
            }

            // 切割歌词
            function getSongText(url) {
                // 设定一个数组来存放时间和歌词
                var arr = [];
                $.get(url).then(function(data) {    
                    // $.get()方法通过远程HTTP GET请求载入信息
                    // then()方法是异步执行，就是当then()前的方法执行完后，再执行then内部的程序。
                    // console.log(data)
                    // 提取每句歌词，用正则表达式来匹配
                    var reg = /\[(\d{2}):(\d{2}).(\d{2})\].*/g;
                    //  \d表示匹配数字，.表示匹配除换行符外的任何单个字符，*表示匹配前面的子表达式零次或多次，/g表示返回多个匹配结果
                    var songText = data.match(reg);
                    // 切割出时间
                    for(var i = 0; i < songText.length; i++){
                        // 将时间与文字分隔开
                        var singleTxt = songText[i].substr(1).split(']');
                        // substr(start) 方法可在字符串中抽取从 start 下标开始的指定数目的字符。
                        // split(separator) 方法用于把一个字符串分割成字符串数组,从该参数指定的地方分割。
                        // 所以得到singleTXT[0]为时间，singleTXT[1]为文字
                        // 接着将时间转换成以秒为单位的数字
                        var timeNum = singleTxt[0];
                        var m = timeNum[0] = 0 ? timeNum[1] : timeNum.substr(0,2);
                        var s = timeNum[3] = 0 ? timeNum[4] : timeNum.substr(3,2);
                        var hs = timeNum[6] = 0 ? timeNum[7] : timeNum.substr(6,2);
                        var finalTime = parseInt(m * 60) + parseInt(s) + parseFloat(hs / 100);
                        // console.log(finalTime);
                        arr.push({
                            time: finalTime,
                            text: singleTxt[1]
                        })
                    }
                    setSongText(arr);
                })
            }
            
            // 歌词同步切换 
            function setSongText(arr) {
                // 回收内存
                clearInterval(songTime);
                songTime = setInterval(() => {
                   $.each(arr,function(idx,item){
                    var curTime = item.time - player.currentTime - 0.5;
                    if(curTime < 0){
                        $('.sing-words').html(item.text)
                    }
                })  
                }, 500);
            }

            // 点击静音
            $('.vol em').click(function() {
                if($(this).hasClass('mute')){   // 如果当前是静音
                    $(this).removeClass('mute')
                    player.muted = false;
                }else{  // 如果当前不是静音
                    $(this).addClass('mute');
                    player.muted = true;
                    $('.vol a').css('display','none')
                }
            })

            // 鼠标移到图标上方出现音量调节
            $('.vol em').mouseover(function(){
                $('.vol a').css('display','block');
            })

            // 音量调节点击
            $('.vol span').click(function(){
                // // 获取当前鼠标点击的位置
                // console.log(getMousePosition().top)
                // // console.log(1)
                // // 获取span标签的最上方位置
                // console.log($(this).offset().top)
                // // 获取当前点击的长度
                var long = (getMousePosition().top) - ($(this).offset().top)
                // 求点击长度占比
                var meter = long / $(this).height();
                var finalLong = 1 - meter;
                // 将进度条调整为点击的长度
                $('.vol i').height(finalLong * $(this).height());
                    
                // 将audio音量调整为对应的音量
                player.volume = finalLong;
                // console.log(finalLong)
                    
                // 改变数字
                $('.vol b').html(parseInt(finalLong * 100) + '%')
                    
                // 点击后音量调整键隐藏
                $('.vol a').css('display','none')

            }) 

            // 点击单曲循环，改变图标
            $('.s-loop').click(function() {
                if($(this).hasClass('son')){   // 如果当前是单曲循环
                    $(this).removeClass('son')
                    player.loop = false;
                    
                }else{  // 如果当前不是单曲循环
                    $(this).addClass('son');
                    $('.a-loop').removeClass('aon');

                    player.loop = true;
                }
            })

            // 全部循环
            $('.a-loop').click(function() {
                if($(this).hasClass('aon')){   // 如果当前是全部循环
                    $(this).removeClass('aon')
                    
                }else{  // 如果当前不是全部循环
                    $(this).addClass('aon');
                    $('.s-loop').removeClass('son');
                    player.loop = false;
                }
            })
        }
    };
    xhr.send();
})(jQuery);