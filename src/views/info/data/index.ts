import { ColumnType } from "ant-design-vue/lib/table/interface";

export const columns:ColumnType[] = [
  {
    title: "Id",
    dataIndex:"id",
    width:100,
    align:"center"
  },
  {
    title: "姓名",
    dataIndex:"name",
    width:100,
    align:"center"
  },
  {
    title: "手机号",
    dataIndex:"mobile",
    width:120,
    align:"center"
  },
  {
    title: "邮箱",
    dataIndex:"email",
    width:150,
    align:"center"
  },
  {
    title:"是否管理员",
    dataIndex:"isAdmin",
    width:100,
    align:"center"
  },
  {
    title: "操作",
    dataIndex: "action",
    width: 150,
    align: "center"
  }
]