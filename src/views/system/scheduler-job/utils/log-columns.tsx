import dayjs from "dayjs";

export const logColumns: TableColumnList = [
  { label: "ID", prop: "id", width: 80 },
  {
    label: "状态",
    prop: "status",
    width: 90,
    cellRenderer: ({ row }) =>
      row.status === 0 ? (
        <el-tag type="success">SUCCESS</el-tag>
      ) : (
        <el-tag type="danger">FAILURE</el-tag>
      )
  },
  { label: "耗时(ms)", prop: "durationMs", width: 100 },
  {
    label: "开始时间",
    prop: "startedAt",
    width: 170,
    formatter: ({ startedAt }) =>
      startedAt ? dayjs(startedAt).format("YYYY-MM-DD HH:mm:ss") : ""
  },
  {
    label: "结束时间",
    prop: "finishedAt",
    width: 170,
    formatter: ({ finishedAt }) =>
      finishedAt ? dayjs(finishedAt).format("YYYY-MM-DD HH:mm:ss") : ""
  },
  { label: "错误信息", prop: "errorMessage", showOverflowTooltip: true }
];
