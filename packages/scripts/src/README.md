### 运行该脚本创建模板文件

- tips 参数前必须加上 `--` 前缀

| 参数名称       | 是否必传 | 默认值 | 描述                                       | 示例                                  | 命令别名  |
| -------------- | -------- | ------ | ------------------------------------------ | ------------------------------------- | --------- |
| path           | 是       | -      | 模块相对路径                               | --path=system/menus                   | filepath  |
| title          | 是       | -      | 模块名称                                   | --title=系统管理/菜单管理             | -         |
| tab            | 否       | -      | 是否是 tabList                             | --tab                                 | -         |
| treeList       | 否       | -      | 是否是树列表                               | --treeList                            | tree-list |
| dynamic        | 否       | -      | 是否是动态路由                             | --dynamic                             | -         |
| forceWriteDts  | 否       | -      | 新建模块冲突时选择覆盖后是否还导出声明     | --forceWriteDts                       | force     |
| remove         | 否       | -      | 删除模块(删除模块时 path 不能为空)         | --remove                              | -         |
| layout         | 否       | true   | 根路由是否不设置 component(不需要布局文件) | --layout                              | -         |
| authPrefix     | 否       | -      | 权限的前缀, 默认根据路径生成               | --authPrefix=":a:b:"                  | -         |
| auth           | 否       | -      | 拥有的权限                                 | --auth="[{title:'新增',value:'add'}]" | -         |
| authApplyRoute | 否       | true   | 将权限应用到路由上                         | --authApplyRoute                      | -         |

- `tips`

```bash
# 基于 pnpm 创建文件
pnpm generate --path=system/menus --title=系统管理/菜单管理
# 基于 npm 创建文件(需要在第一个参数前加上 --)
npm run generate -- --path=system/menus --title=系统管理/菜单管理
```
