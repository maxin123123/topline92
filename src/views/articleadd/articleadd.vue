<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>发表文章</span>
      </div>
      <div class="text item">
        <el-form ref="addForm" :model="addForm" label-width="120px">
          <el-form-item label="标题：">
            <el-input v-model="addForm.title"></el-input>
          </el-form-item>
          <el-form-item label="内容：">
            <el-input v-model="addForm.content"></el-input>
          </el-form-item>
          <el-form-item label="封面：">
            <el-radio-group v-model="addForm.cover.type">
              <el-radio :label="1">单图</el-radio>
              <el-radio :label="3">三图</el-radio>
              <el-radio :label="0">无图</el-radio>
              <el-radio :label="-1">自动</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="频道：">
             <el-select
              v-model="addForm.channel_id"
              placeholder="请选择"
              clearable
            >
              <el-option
                v-for="item in channelList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>

</template>

<script>

export default {
  name: 'ArticleAdd',
  data () {
    return {
      channelList: [], // 接收频道列表数据
      addForm: {
        title: '', // 文章标题
        content: '', // 文章内容
        cover: {
          type: 0, // 封面类型 -1:自动，0-无图，1-1张，3-3张
          images: []
        },
        channel_id: '' // 频道
      }
    }
  },
  created () {
    this.getChannelList()
  },
  methods: {
    // 获取频道列表数据
    getChannelList () {
      var pro = this.$http.get('/mp/v1_0/channels')
      pro
        .then(result => {
          if (result.data.message === 'OK') {
            this.channelList = result.data.data.channels
          }
        })
        .catch(err => {
          return this.$message.error('获得文章频道错误：' + err)
        })
    }
  }
}
</script>

<style lang="less" scoped>
</style>
