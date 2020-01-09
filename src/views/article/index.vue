<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>全部图文</span>
      </div>
      <!-- 匿名插槽，内容主体 -->
      <div class="text item">
        <!-- el-form搜索表单区域   -->
        <el-form ref="searchForm" :model="searchForm" label-width="100px">
          <el-form-item label="文章状态：">
            <el-radio v-model="searchForm.status" label>全部</el-radio>
            <el-radio v-model="searchForm.status" :label="0">草稿</el-radio>
            <el-radio v-model="searchForm.status" :label="1">待审核</el-radio>
            <el-radio v-model="searchForm.status" :label="2">审核通过</el-radio>
            <el-radio v-model="searchForm.status" :label="3">审核失败</el-radio>
          </el-form-item>
          <el-form-item label="频道列表：">
            <el-select v-model="searchForm.channel_id" placeholder="请选择" clearable>
              <el-option
                v-for="item in channelList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="时间选择：">
            <el-date-picker
              v-model="timetotime"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd"
            ></el-date-picker>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>共找到{{tot}}条符合条件的内容</span>
      </div>
      <div class="text item">
        <el-table :data="articleList" style="width:100%;">
          <el-table-column label="图标">
            <img
              :src="stData.row.cover.images[0]"
              slot-scope="stData"
              alt="没有图标"
              width="150"
              height="100"
            />
          </el-table-column>
          <el-table-column label="标题" prop="title"></el-table-column>
          <el-table-column label="状态" prop="status">
            <!--如果当前内容区域中多个标签都使用了 作用域插槽，
            可以优化为：提供一个父级的template标签统一使用作用域插槽-->
            <template slot-scope="stData">
              <el-tag v-if="stData.row.status===0">草稿</el-tag>
              <el-tag v-else-if="stData.row.status===1" type="success">待审核</el-tag>
              <el-tag v-else-if="stData.row.status===2" type="info">审核通过</el-tag>
              <el-tag v-else-if="stData.row.status===3" type="warning">审核失败</el-tag>
              <el-tag v-else type="danger">已删除</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="发布时间" prop="pubdate"></el-table-column>
          <el-table-column label="操作">
            <el-button type="primary" size="mini">修改</el-button>
            <el-button type="danger" size="mini">删除</el-button>
          </el-table-column>
        </el-table>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="searchForm.page"
          :page-sizes="[10, 15, 20, 40]"
          :page-size="searchForm.per_page"
          layout="total, sizes, prev, pager, next, jumper"
          :total="tot"
        ></el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Article',
  // 监听设置
  watch: {
    // 对searchForm的各个成员多深度监听，统一筛选获得文章，其他地方的getArticeList都可以省略了
    searchForm: {
      handler: function (newV, oidV) {
        this.getArticleList()
      },
      deep: true
    },
    // 被检测的成员：function(newV，oldV){
    // newV：数据变化后样子
    // oldV：数据变化前样子
    // }
    // 被检测成员一般即使data成员。她们的名称保持一致
    timetotime: function (newV) {
      // 接受到的时间信息一分为二给到 begin_pubdate 和 end_pubdate
      if (newV) {
        this.searchForm.begin_pubdate = newV[0]
        this.searchForm.end_pubdate = newV[1]
      } else {
        // 清除时间信息
        this.searchForm.begin_pubdate = ''
        this.searchForme.end_pubdate = ''
      }
    }
  },
  data () {
    return {
      tot: 0, // 文章总条数
      articleList: [], // 文章列表
      channelList: [], // 频道列表
      timetotime: '', // 临时接收时间范围信息
      // 搜索表单数据对象
      searchForm: {
        page: 1, // 当前数据记录页码
        per_page: 10, // 分页数据记录条数(10~50)
        status: '', // 文章状态，0-草稿，1-待审核，2-审核通过，3-审核失败，不传为全部
        channel_id: '', // 频道id

        begin_pubdate: '', // 文章发布开始时间
        end_pubdate: '' // 文章发布结束时间
      }
    }
  },
  created () {
    // 获得频道
    this.getchannlList()
    // 获得文章
    this.getArticleList()
  },
  methods: {
    // 分页相关
    // 每条条数
    handleSizeChange (val) {
      // val:变化后的每页条数
      // 更新每页条数
      this.searchForm.per_page = val
      // // 根据变化后的每页条数重新获得文章列表
      // this.getArticleList()
    },
    // 页码变化的回调函数
    handleCurrentChange (val) {
      // val:变化后的页码
      // 更新页码
      this.searchForm.page = val
      // // 根据变化后的页码重新获得文章列表
      // this.getArticleList()
    },

    // 获得真实频道列表数据
    getchannlList () {
      let pro = this.$http({
        url: '/mp/v1_0/channels',
        methd: 'GET'
      })
      pro
        .then(result => {
          // data接收频道数据
          this.channelList = result.data.data.channels
        })
        .catch(err => {
          return this.$message.error('获得频道失败：' + err)
        })
    },
    // 获得真实文章列表数据
    getArticleList () {
      // 把searchForm内部为空的成员都过滤掉
      let searchData = {}
      for (var i in this.searchForm) {
        // i:代表对象的成员属性名称, status、channel_id、begin_pudate等等
        if (this.searchForm[i] || this.searchForm[i] === 0) {
          // 成员值非空
          searchData[i] = this.searchForm[i]
        }
      }
      let pro = this.$http({
        url: '/mp/v1_0/articles',
        methd: 'GET',
        params: searchData
      })
      pro
        .then(result => {
          // console.log(result)
          this.tot = result.data.data.total_count // 总记录条数
          this.articleList = result.data.data.results
        })
        .catch(err => {
          return this.$message.error('获得频道失败：' + err)
        })
    }
  }
}
</script>

<style lang="less" scoped>
.box-card {
  margin-bottom: 15px;
}
.el-pagination{
  margin-top:15px;
}
</style>
