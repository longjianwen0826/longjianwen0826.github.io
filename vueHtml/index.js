import jsbridge from './utils/jsbridge.js'
new VConsole()
new Vue(
  {
    el: '#wealCenter',
    directives: {
      preventReClick: {
        inserted: function (el) {
          el.addEventListener('click', () => {
            if (!el.disabled) {
              el.disabled = true
              setTimeout(() => {
                  el.disabled = false
              }, binding.value || 1500)
            }
          })
        }
      }
    },
    data() {
        return {
          isIos: false,
          isAndroid: false,
          earningsTop: 0,
          tiChecked: false,
          prizeList: [
              {id: 1, img: 'assets/hong_bao_icon.png', value: '9.9元', describe: '现金红包', ratio: 24},
              {id: 2, img: 'assets/hong_bao_icon.png', value: '0.5元', describe: '现金红包', ratio: 24.5},
              {id: 3, img: 'assets/hong_bao_icon.png', value: '2.9元', describe: '中秋头像框', ratio: 1},
              {id: 4, img: 'assets/ic_diamond_succ.png', value: '2.9元', describe: '中秋头像框', ratio: 23.5},
              {id: 5, img: 'assets/ic_diamond_succ.png', value: '9.9元', describe: '中秋头像框', ratio: 1},
              {id: 6, img: 'assets/ic_diamond_succ.png', value: '1.9元', describe: '中秋头像框', ratio: 1},
              {id: 7, img: 'assets/hong_bao_icon.png', value: '88个', describe: '钻石', ratio: 1},
              {id: 8, img: 'assets/hong_bao_icon.png', value: '5.9元', describe: '现金红包', ratio: 24},
          ],
          prizeIndex: 0,//提前设置的中奖下标
          chouNum: 0,//动画中的中奖下标
          roundList: [1,1,1],//记录抽奖每轮次数
          roundTimes: [50, 140, 230],//记录抽奖每轮每次的毫秒数
          roundNum: 0,//抽奖第几轮
          chouButLoading: false,
          prizeSelectData: {},
          showPrizeDia: false,
          showPrizeList: false,
          chouInter: null,
          timeNum: 0,

          newUserMoney: [ '1.1', '1.3', '3.3', '1.3', '4.9', '1.5', '6.6' ], //新人金额
          oldUserMoney: [ '0.5', '0.5', '1.0', '1.0', '1.5', '1.5', '3.0' ], //老用户金额
          qianDateList: [//签到日期及每天金额集合
            {money: '', date : ''},
            {money: '', date : ''},
            {money: '', date : ''},
            {money: '', date : ''},
            {money: '', date : ''},
            {money: '', date : ''},
            {money: '', date : ''},
          ],
          //新人用户签到记录
          userQianData: [//1表示领了，2表示错过没领，0未到的
            {state: 1, date : ''},
            {state: 2, date : ''},
            {state: 1, date : ''},
            {state: 0, date : ''},
            {state: 0, date : ''},
            {state: 0, date : ''},
            {state: 0, date : ''},
          ],

          // 任务卡片列表 type卡片类型。1去提现类型，2其他可设置文案类型类型
          missionCardList: [
            { type: 1, title: '新人0.5元提现', hongText: '秒到账', message: '通过人气认证即可提现0.5元至支付宝', butText: ''},
            { type: 1, title: '新人1元提现', hongText: '新人专享', message: '发布1条3张图片的时刻即可提现1元至支付宝', butText: ''},
            { type: 2, title: '邀请女神得20元', hongText: '邀请1人20元', message: '邀请女神通过人气认证可得20元，多邀多得', butText: '去邀请'},
          ],
          // 每日任务列表 
          // state 1为完成，2为未完成，type 1为可多次完成， 2只能完成一次
          meiRenList: [
            { title: '发一条视频动态', num: 1, state: 2, type: 1, message: '限时福利，每天可完成一次'},
            { title: '加入私人俱乐部', num: 1, state: 2, type: 1, message: '可选择地区，兴趣或用户的私人俱乐部加入'},
            { title: '与5位男士互聊5句', num: 1, state: 1, type: 1, message: '每天可完成一次，进度5/5'},
            { title: '添加会员男用户为好友', num: 1, state: 1, type: 1, message: '每日可完成一次，进度0/1'},
            { title: '完善全部个人资料', num: 1, state: 1, type: 2, message: '上传五张照片+填写全部个人资料'},
          ],
          showQianDia: false,
          showQianMesDia: false,
          showRestDia: false,
        };
    },
    created(){
        var u = navigator.userAgent//,app = navigator.appVersion;
        var isAndroid = u.indexOf("Android") > -1 || u.indexOf("Linux") > -1;
        var isIos = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
        if (isAndroid) {
          this.isAndroid = true;
        }
        if (isIos) {
          this.isIos = true;
        }
        //在页面滚动时调用监听页面滚动方法
        this.$nextTick( () => {
          document.getElementById("wealCenterId").addEventListener('scroll', this.windowScrollListener);
        })
    },
    mounted() {
        // this.getDateList()
    },
    methods: {
      //监听页面滚动
      windowScrollListener() {
        //获取收益区元素最顶端到页面顶端的垂直距离
        var offsetBot = document.getElementById("earningsConId").getBoundingClientRect().bottom;
        // console.log("滚动前",offsetBot)
        if (offsetBot < 110 ) {
          if(offsetBot > 80){
            this.earningsTop = parseInt(offsetBot) - 79  
          }else{
            this.earningsTop = 1
          }
        }
        if(offsetBot > 110){
          this.earningsTop = 0
        }
      },
      // 签到开关
      dateCheckedInput(check){
        if(!check){
          this.$toast('已关闭签到推送提醒');
          this.tiChecked = check
        }else{
          jsbridge.callHandler('getAppInform', {}, (data) => {
            console.log("getAppInform ====== 回调数据",data)
            if(data){//有权限
              this.tiChecked = check
              this.$toast('已开启签到推送提醒');
            }else{
              this.showQianMesDia = true
            }
          })
        }
      },
      //去设置签到通知权限
      goInform(){
        this.showQianMesDia = false
        jsbridge.callHandler('setAppInform', {}, (data) => {
          console.log("setAppInform ====== 回调数据",data)
          this.tiChecked = data
          if(data){//已设置
            this.$toast('已开启签到推送提醒');
          }
        })
      },
      //获取并打开抽奖记录
      clickShowPrizeList(){
        this.showPrizeList = true
      },
      //点击开始抽奖
      beginChouJIan(time, count){
        this.chouButLoading = true
        setTimeout( () => {//防止程序出错页面被屏蔽了
          this.chouButLoading = false
        }, 4000)
        this.setPrizeIndex()//设置中奖
        this.roundNum = 0 //重置第一轮
        this.getRound() //计算每轮次数
        this.lottery() //开始抽奖动画
      },
      //提前按比例设置中奖下标
      setPrizeIndex(){
        let mathList = this.prizeList.map( item => item.ratio )//请求获取的奖品集合比例(8个组成100)
        let mathGapList = []//奖品比例(8个组成100)，（*10方便算数到小数点后一位）
        for(let i=0; i < mathList.length; i++){
          if(i == 0){
            mathGapList[i] = mathList[i] * 10
          }else{
            mathGapList[i] = 0
            for(let iTwo=0; iTwo <= i; iTwo++){
              mathGapList[i] = mathList[iTwo] * 10 + mathGapList[i]
            }
          }
        }
        this.prizeIndex = 0
        let randomNum = Math.floor(Math.random() * mathGapList[mathGapList.length-1]) + 1;//总比率以内随机数
        for(let i=0; i < mathGapList.length; i++){//随机数比率匹配设置选中奖品
          if(randomNum <= mathGapList[i]){
            this.prizeIndex = i 
            break
          }
        }
        console.log("随机数",randomNum,"=====中奖下标",this.prizeIndex)
      },
      //计算每轮次数
      getRound(){
        let forCount = 24
        if(this.prizeIndex==0){
          forCount = 32
        }else{
          forCount = forCount + this.prizeIndex
        }
        forCount = forCount - this.chouNum
        let oneRound = forCount * 8 / 12
        let twoRound = forCount * 3 / 12
        let threeRound = forCount - parseInt(oneRound) - parseInt(twoRound)
        this.roundList = [parseInt(oneRound), parseInt(twoRound), parseInt(threeRound)]
        console.log("每轮轮",this.roundList)
      },
      //抽奖动画
      lottery(){
        this.timeNum = 1
        this.chouInter = setInterval( () =>{
          // this.chouNum = Math.floor(Math.random() * 8)
          if(this.chouNum == this.prizeList.length-1){
            this.chouNum = 0
          }else{
            this.chouNum ++       }
          if(this.timeNum < this.roundList[this.roundNum]){
            this.timeNum ++
          }else{
            clearInterval(this.chouInter)
            this.chouInter = null
            if(this.roundNum == this.roundTimes.length-1){//动画结束设置中奖的
              this.chouNum = this.prizeIndex
              setTimeout( () => {
                this.showPrizeDia = true
                this.prizeSelectData = this.prizeList[this.chouNum]
                this.chouButLoading = false
              },800)
            }else{//进入下一轮
              this.roundNum ++ 
              this.lottery()
            }
          }
        }, this.roundTimes[this.roundNum])
      },

      //获取签到七天日期赋值
      getDateList(){
        var today=new Date('2023-11-7');
        let dateList=[]
        for(var i=0;i<7;i++){
            var newDate=new Date(today.getTime()+i*1000*60*60*24)
            var year=newDate.getFullYear()
            var month=(parseInt(newDate.getMonth())+1)>9?(parseInt(newDate.getMonth())+1):"0"+(parseInt(newDate.getMonth())+1)
            var day=(newDate.getDate())>9?newDate.getDate():"0"+newDate.getDate()
            var fullDate=`${year}-${month}-${day}`
            dateList.push(fullDate)
        }
        dateList.forEach( (date, index) => {
          this.qianDateList[index].date =  date
          this.qianDateList[index].money =  this.newUserMoney[index]

          this.userQianData[index].date = date

          if(new Date(date).getTime() < new Date().getTime() && this.userQianData[index].state==0){
            this.userQianData[index].state=2
          }
        })
      },
      //获取明天日期时间戳
      ifTomorrow(date){
        var newDate= new Date()
        var tomorrow = new Date(newDate.getTime() + 24 * 60 * 60 * 1000);
        var year=tomorrow.getFullYear()
        var month=(parseInt(tomorrow.getMonth())+1)>9?(parseInt(tomorrow.getMonth())+1):"0"+(parseInt(tomorrow.getMonth())+1)
        var day=(tomorrow.getDate())>9?tomorrow.getDate():"0"+tomorrow.getDate()
        var fullDate=`${year}-${month}-${day}`
        if(new Date(date).getTime() == new Date(fullDate).getTime()){
          return true
        }else{
          return false
        }
      },
      //跳转端内页面
      goAppPage(url){
        console.log("测试跳转",url)
        // 触发 app 内部设定好的方法，触发完成会有回调接收结果
        jsbridge.callHandler('goAppRouter', {'url': url}, (data) => {
          console.log("goAppRouter ====== 回调数据",data)
        })
      }
    },
    beforeDestroy(){ //离开页面时删除该监听
      window.removeEventListener('scroll', this.windowScrollListener)
    }
  }
);  