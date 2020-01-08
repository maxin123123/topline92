<template>
  <div class="login-container">
    <!-- 给父级加回车事件 -->
    <div class="login-box" @keyup.enter="login()">
      <!-- 绘制登录form表单 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules">
        <img src="./logo_index.png" alt />
        <el-form-item prop="mobile">
          <el-input v-model="loginForm.mobile" placeholder="请输入手机号码">
            <i slot='prefix' class="el-icon-mobile"></i>
          </el-input>
        </el-form-item>
        <el-form-item prop="code">
          <el-input v-model="loginForm.code" placeholder="请输入校验码">
             <i slot='prefix' class="el-icon-chat-round"></i>
          </el-input>
        </el-form-item>
        <el-form-item style="text-align:left;" prop="xieyi">
          <!-- 复选框  单个复选框直接设置v-model即可，接受 true/false的信息，表示是否选中 -->
          <el-checkbox v-model="loginForm.xieyi" style="margin-right:10px;"></el-checkbox>
          <span>
            我已阅读并同意
            <a href="#">用户协议</a>和
            <a href="#">隐私条款</a>
          </span>
        </el-form-item>
        <el-form-item>
          <!-- 登录按钮 -->
          <el-button
            style="width:100%;"
            :loading="isActive"
            :disabled="isActive"
            type="primary"
            @click="login()"
          >登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
// 导入gt.js文件
import './gt.js'
// // 引入iconfont的css文件
// import '@/assets/font/iconfont.css'
export default {
  name: 'Login',
  // 注意：属性绑定、双向数据绑定的值需要通过data做支持
  data () {
    // 声明局部函数 实现校验
    var xieyiTest = function (rule, value, callback) {
      // if (value) {
      //   // 检验通过
      //   callback()
      // } else {
      //   // 检验通过
      //   callback(new Error('请遵守协议'))
      // }
      //  if else 通过三元表达式优化
      value ? callback() : callback(new Error('请遵守协议'))
    }
    return {
      // 表单数据
      loginForm: {

        mobile: '17631577586', // 手机号码
        code: '246810', // 校验码
        xieyi: false // 协议

      },
      isActive: false, // 按钮是否等待、禁用
      capObj: null, // 极验对象

      // 表单检验
      loginFormRules: {
        // 手机号码
        mobile: [
          { required: true, message: '手机号码必填' },
          { pattern: /^1[35789]\d{9}$/, message: '手机号码格式不对' }
        ],
        // 验证码
        code: [
          //
          { required: true, message: '验证码必填' }
        ],
        // 协议
        xieyi: [{ validator: xieyiTest }]
      }
    }
  },
  methods: {
    // 登录系统
    login () {
      // 表单做检验
      this.$refs.loginFormRef.validate(valid => {
        // valid:true  检验成功
        // valid:false  检验失败
        // console.log(valid)
        // 如果检验不通过不执行跳转
        if (!valid) {
          return false
        }
        // 检验通过直接跳转
        if (this.capObj !== null) { return this.capObj.verify() }
        // 登录按钮处于等待、禁用状态
        this.isActive = true
        // A. 人机交互验证
        // axios获得极验的秘钥信息
        let pro = this.$http({
          url: '/mp/v1_0/captchas/' + this.loginForm.mobile,
          method: 'get'
        })
        pro
          .then(result => {
            // console.log(result)//极验的密钥信息
            // 从result里边解构下述的data对象出来(对象解构赋值)
            let { data } = result.data
            // 请检测data的数据结构，保证dat.gt，data.challenge，data.success有值
            window.initGeetest(
              {
                // 以下配置参数来自服务器 SDK
                gt: data.gt,
                challenge: data.challenge,
                offline: !data.success,
                new_captcha: true,
                product: 'bind' // 设置验证窗口样式的
              },
              captchaObj => {
                // 这里可以调用验证实例captchaObj 的实例方法
                captchaObj
                  .onReady(() => {
                    // 验证ready之后才能调用verify方法显示验证码(可以显示窗口了)
                    captchaObj.verify() // 显示验证码窗口
                    this.isActive = false// 恢复按钮
                    this.capObj = captchaObj// 已经极验对象赋值给ctaObj
                  })
                  .onSuccess(() => {
                    // 行为校验正确的处理
                    // B.验证账号，登录系统
                    this.loginAct()
                  })
                  .onError(() => {
                    // 行为校验错误的处理
                  })
              }
            )
          })
          .catch(err => {
            return this.$message.error('获取极验秘钥失败：' + err)
          })
      })
    },
    loginAct () {
      let pro = this.$http({
        url: '/mp/v1_0/authorizations',
        method: 'POST',
        data: this.loginForm
      })
      pro
        .then(result => {
          // console.log(result) // 【data】  status statusText headers config request
          // 客户端浏览器把服务器端返回的秘钥等相关信息通过 sessionStorage 做记录，表明是登录状态
          window.sessionStorage.setItem(
            'userinfo',
            JSON.stringify(result.data.data)
          )
          // 进入后台系统
          // 路由编程式导航
          this.$router.push({ name: 'home' }) // name属性实现编程式导航
        })
        .catch(err => {
          // 上下效果一致
          this.$message.error('手机号码或验证码错误:' + err)
        })
    }
  }
}
</script>

<style lang="less" scoped>
.login-container {
  height: 100%;
  background-color: gray;
  background-image: url("./login_bg.jpg");
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;

  .login-box {
    width: 410px;
    height: 345px;
    background-color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    img {
      width: 50%;
      margin: 20px auto;
    }
    .el-form {
      width: 75%;
    }
  }
}
</style>
