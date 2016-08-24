import * as datagrid from '../src/index'

const grid = datagrid.init('div')
window.$grid = grid
grid.setData({
  "columns": [
    { "name": "日期", "type": "常规", "fixed": false },
    { "name": "总计", "type": "常规", "fixed": false },
    { "name": "催单(用户)", "type": "用户", "fixed": false },
    {
      "name": "退单(用户)",
      "type": "用户",
      "fixed": false
    },
    { "name": "订单变更(用户)", "type": "用户", "fixed": false },
    {
      "name": "钱款问题(用户)",
      "type": "用户",
      "fixed": false
    },
    { "name": "订单投诉(用户)", "type": "用户", "fixed": false },
    {
      "name": "软件、账户、会员卡(用户)",
      "type": "用户",
      "fixed": false
    },
    { "name": "账户与资金(商家)", "type": "商家", "fixed": false },
    {
      "name": "手淘及支付宝店铺(商家)",
      "type": "商家",
      "fixed": false
    },
    { "name": "物流配送(商家)", "type": "商家", "fixed": false },
    {
      "name": "商家客户端(商家)",
      "type": "商家",
      "fixed": false
    },
    { "name": "开店与合作(商家)", "type": "商家", "fixed": false },
    {
      "name": "订单查询(商家)",
      "type": "商家",
      "fixed": false
    },
    { "name": "加入蜂鸟(蜂鸟)", "type": "蜂鸟", "fixed": false },
    {
      "name": "账户管理(蜂鸟)",
      "type": "蜂鸟",
      "fixed": false
    },
    { "name": "骑手申诉(蜂鸟)", "type": "蜂鸟", "fixed": false },
    {
      "name": "投诉及撤销(蜂鸟)",
      "type": "蜂鸟",
      "fixed": false
    },
    { "name": "其他咨询(蜂鸟)", "type": "蜂鸟", "fixed": false }
  ],
  "data": [
    {
      "日期": "总计",
      "总计": "289,235",
      "催单(用户)": "39,047",
      "退单(用户)": "21,112",
      "订单变更(用户)": "2,444",
      "钱款问题(用户)": "24,016",
      "订单投诉(用户)": "51,501",
      "软件、账户、会员卡(用户)": "13,999",
      "账户与资金(商家)": "23,791",
      "手淘及支付宝店铺(商家)": "7,062",
      "物流配送(商家)": "11,338",
      "商家客户端(商家)": "23,856",
      "开店与合作(商家)": "11,486",
      "订单查询(商家)": "8,521",
      "加入蜂鸟(蜂鸟)": "3,219",
      "账户管理(蜂鸟)": "6,384",
      "骑手申诉(蜂鸟)": "11,876",
      "投诉及撤销(蜂鸟)": "2",
      "其他咨询(蜂鸟)": "29,581"
    },
    {
      "日期": "占比",
      "总计": "100.00%",
      "催单(用户)": "13.50%",
      "退单(用户)": "7.30%",
      "订单变更(用户)": "0.84%",
      "钱款问题(用户)": "8.30%",
      "订单投诉(用户)": "17.81%",
      "软件、账户、会员卡(用户)": "4.84%",
      "账户与资金(商家)": "8.23%",
      "手淘及支付宝店铺(商家)": "2.44%",
      "物流配送(商家)": "3.92%",
      "商家客户端(商家)": "8.25%",
      "开店与合作(商家)": "3.97%",
      "订单查询(商家)": "2.95%",
      "加入蜂鸟(蜂鸟)": "1.11%",
      "账户管理(蜂鸟)": "2.21%",
      "骑手申诉(蜂鸟)": "4.11%",
      "投诉及撤销(蜂鸟)": "0.00%",
      "其他咨询(蜂鸟)": "10.23%"
    },
    {
      "日期": "2016-08-08",
      "总计": "20,927",
      "催单(用户)": "2,440",
      "退单(用户)": "1,304",
      "订单变更(用户)": "197",
      "钱款问题(用户)": "1,961",
      "订单投诉(用户)": "3,398",
      "软件、账户、会员卡(用户)": "913",
      "账户与资金(商家)": "1,418",
      "手淘及支付宝店铺(商家)": "459",
      "物流配送(商家)": "746",
      "商家客户端(商家)": "1,462",
      "开店与合作(商家)": "807",
      "订单查询(商家)": "656",
      "加入蜂鸟(蜂鸟)": "265",
      "账户管理(蜂鸟)": "1,098",
      "骑手申诉(蜂鸟)": "1,071",
      "投诉及撤销(蜂鸟)": "0",
      "其他咨询(蜂鸟)": "2,732"
    },
    {
      "日期": "2016-08-09",
      "总计": "20,076",
      "催单(用户)": "3,542",
      "退单(用户)": "2,130",
      "订单变更(用户)": "189",
      "钱款问题(用户)": "1,526",
      "订单投诉(用户)": "4,535",
      "软件、账户、会员卡(用户)": "796",
      "账户与资金(商家)": "966",
      "手淘及支付宝店铺(商家)": "412",
      "物流配送(商家)": "647",
      "商家客户端(商家)": "958",
      "开店与合作(商家)": "634",
      "订单查询(商家)": "524",
      "加入蜂鸟(蜂鸟)": "193",
      "账户管理(蜂鸟)": "457",
      "骑手申诉(蜂鸟)": "846",
      "投诉及撤销(蜂鸟)": "0",
      "其他咨询(蜂鸟)": "1,721"
    },
    {
      "日期": "2016-08-10",
      "总计": "23,161",
      "催单(用户)": "3,059",
      "退单(用户)": "1,734",
      "订单变更(用户)": "182",
      "钱款问题(用户)": "1,849",
      "订单投诉(用户)": "4,289",
      "软件、账户、会员卡(用户)": "1,137",
      "账户与资金(商家)": "1,910",
      "手淘及支付宝店铺(商家)": "519",
      "物流配送(商家)": "883",
      "商家客户端(商家)": "1,930",
      "开店与合作(商家)": "874",
      "订单查询(商家)": "615",
      "加入蜂鸟(蜂鸟)": "299",
      "账户管理(蜂鸟)": "477",
      "骑手申诉(蜂鸟)": "995",
      "投诉及撤销(蜂鸟)": "0",
      "其他咨询(蜂鸟)": "2,409"
    },
    {
      "日期": "2016-08-11",
      "总计": "22,103",
      "催单(用户)": "2,904",
      "退单(用户)": "1,588",
      "订单变更(用户)": "182",
      "钱款问题(用户)": "1,941",
      "订单投诉(用户)": "3,962",
      "软件、账户、会员卡(用户)": "1,070",
      "账户与资金(商家)": "1,734",
      "手淘及支付宝店铺(商家)": "470",
      "物流配送(商家)": "806",
      "商家客户端(商家)": "1,800",
      "开店与合作(商家)": "886",
      "订单查询(商家)": "643",
      "加入蜂鸟(蜂鸟)": "257",
      "账户管理(蜂鸟)": "514",
      "骑手申诉(蜂鸟)": "929",
      "投诉及撤销(蜂鸟)": "0",
      "其他咨询(蜂鸟)": "2,417"
    },
    {
      "日期": "2016-08-12",
      "总计": "22,491",
      "催单(用户)": "3,451",
      "退单(用户)": "1,931",
      "订单变更(用户)": "177",
      "钱款问题(用户)": "1,556",
      "订单投诉(用户)": "3,925",
      "软件、账户、会员卡(用户)": "1,009",
      "账户与资金(商家)": "1,728",
      "手淘及支付宝店铺(商家)": "453",
      "物流配送(商家)": "932",
      "商家客户端(商家)": "1,796",
      "开店与合作(商家)": "907",
      "订单查询(商家)": "698",
      "加入蜂鸟(蜂鸟)": "227",
      "账户管理(蜂鸟)": "425",
      "骑手申诉(蜂鸟)": "953",
      "投诉及撤销(蜂鸟)": "0",
      "其他咨询(蜂鸟)": "2,323"
    },
    {
      "日期": "2016-08-13",
      "总计": "20,882",
      "催单(用户)": "2,362",
      "退单(用户)": "1,307",
      "订单变更(用户)": "176",
      "钱款问题(用户)": "1,741",
      "订单投诉(用户)": "3,647",
      "软件、账户、会员卡(用户)": "1,238",
      "账户与资金(商家)": "2,189",
      "手淘及支付宝店铺(商家)": "450",
      "物流配送(商家)": "920",
      "商家客户端(商家)": "1,850",
      "开店与合作(商家)": "738",
      "订单查询(商家)": "727",
      "加入蜂鸟(蜂鸟)": "216",
      "账户管理(蜂鸟)": "388",
      "骑手申诉(蜂鸟)": "794",
      "投诉及撤销(蜂鸟)": "1",
      "其他咨询(蜂鸟)": "2,138"
    },
    {
      "日期": "2016-08-14",
      "总计": "18,677",
      "催单(用户)": "2,270",
      "退单(用户)": "1,168",
      "订单变更(用户)": "163",
      "钱款问题(用户)": "1,708",
      "订单投诉(用户)": "3,456",
      "软件、账户、会员卡(用户)": "1,188",
      "账户与资金(商家)": "1,292",
      "手淘及支付宝店铺(商家)": "330",
      "物流配送(商家)": "823",
      "商家客户端(商家)": "1,465",
      "开店与合作(商家)": "610",
      "订单查询(商家)": "626",
      "加入蜂鸟(蜂鸟)": "252",
      "账户管理(蜂鸟)": "430",
      "骑手申诉(蜂鸟)": "740",
      "投诉及撤销(蜂鸟)": "0",
      "其他咨询(蜂鸟)": "2,156"
    },
    {
      "日期": "2016-08-15",
      "总计": "20,384",
      "催单(用户)": "2,524",
      "退单(用户)": "1,338",
      "订单变更(用户)": "144",
      "钱款问题(用户)": "1,916",
      "订单投诉(用户)": "3,579",
      "软件、账户、会员卡(用户)": "1,016",
      "账户与资金(商家)": "1,733",
      "手淘及支付宝店铺(商家)": "494",
      "物流配送(商家)": "732",
      "商家客户端(商家)": "1,718",
      "开店与合作(商家)": "876",
      "订单查询(商家)": "609",
      "加入蜂鸟(蜂鸟)": "280",
      "账户管理(蜂鸟)": "499",
      "骑手申诉(蜂鸟)": "833",
      "投诉及撤销(蜂鸟)": "0",
      "其他咨询(蜂鸟)": "2,093"
    },
    {
      "日期": "2016-08-16",
      "总计": "21,628",
      "催单(用户)": "2,776",
      "退单(用户)": "1,451",
      "订单变更(用户)": "191",
      "钱款问题(用户)": "2,209",
      "订单投诉(用户)": "3,826",
      "软件、账户、会员卡(用户)": "909",
      "账户与资金(商家)": "1,830",
      "手淘及支付宝店铺(商家)": "990",
      "物流配送(商家)": "769",
      "商家客户端(商家)": "1,847",
      "开店与合作(商家)": "913",
      "订单查询(商家)": "566",
      "加入蜂鸟(蜂鸟)": "210",
      "账户管理(蜂鸟)": "309",
      "骑手申诉(蜂鸟)": "918",
      "投诉及撤销(蜂鸟)": "0",
      "其他咨询(蜂鸟)": "1,914"
    },
    {
      "日期": "2016-08-17",
      "总计": "20,350",
      "催单(用户)": "2,870",
      "退单(用户)": "1,398",
      "订单变更(用户)": "158",
      "钱款问题(用户)": "1,583",
      "订单投诉(用户)": "3,458",
      "软件、账户、会员卡(用户)": "961",
      "账户与资金(商家)": "1,851",
      "手淘及支付宝店铺(商家)": "559",
      "物流配送(商家)": "761",
      "商家客户端(商家)": "1,875",
      "开店与合作(商家)": "987",
      "订单查询(商家)": "637",
      "加入蜂鸟(蜂鸟)": "202",
      "账户管理(蜂鸟)": "360",
      "骑手申诉(蜂鸟)": "816",
      "投诉及撤销(蜂鸟)": "0",
      "其他咨询(蜂鸟)": "1,874"
    },
    {
      "日期": "2016-08-18",
      "总计": "22,437",
      "催单(用户)": "3,721",
      "退单(用户)": "2,053",
      "订单变更(用户)": "175",
      "钱款问题(用户)": "1,404",
      "订单投诉(用户)": "4,041",
      "软件、账户、会员卡(用户)": "885",
      "账户与资金(商家)": "1,815",
      "手淘及支付宝店铺(商家)": "496",
      "物流配送(商家)": "959",
      "商家客户端(商家)": "1,886",
      "开店与合作(商家)": "907",
      "订单查询(商家)": "598",
      "加入蜂鸟(蜂鸟)": "196",
      "账户管理(蜂鸟)": "431",
      "骑手申诉(蜂鸟)": "829",
      "投诉及撤销(蜂鸟)": "0",
      "其他咨询(蜂鸟)": "2,041"
    },
    {
      "日期": "2016-08-19",
      "总计": "20,058",
      "催单(用户)": "2,756",
      "退单(用户)": "1,346",
      "订单变更(用户)": "175",
      "钱款问题(用户)": "1,577",
      "订单投诉(用户)": "3,132",
      "软件、账户、会员卡(用户)": "867",
      "账户与资金(商家)": "1,875",
      "手淘及支付宝店铺(商家)": "519",
      "物流配送(商家)": "788",
      "商家客户端(商家)": "1,939",
      "开店与合作(商家)": "903",
      "订单查询(商家)": "556",
      "加入蜂鸟(蜂鸟)": "230",
      "账户管理(蜂鸟)": "369",
      "骑手申诉(蜂鸟)": "829",
      "投诉及撤销(蜂鸟)": "0",
      "其他咨询(蜂鸟)": "2,197"
    },
    {
      "日期": "2016-08-20",
      "总计": "19,138",
      "催单(用户)": "2,271",
      "退单(用户)": "1,184",
      "订单变更(用户)": "170",
      "钱款问题(用户)": "1,556",
      "订单投诉(用户)": "3,264",
      "软件、账户、会员卡(用户)": "1,042",
      "账户与资金(商家)": "1,930",
      "手淘及支付宝店铺(商家)": "503",
      "物流配送(商家)": "793",
      "商家客户端(商家)": "1,802",
      "开店与合作(商家)": "752",
      "订单查询(商家)": "555",
      "加入蜂鸟(蜂鸟)": "201",
      "账户管理(蜂鸟)": "345",
      "骑手申诉(蜂鸟)": "761",
      "投诉及撤销(蜂鸟)": "0",
      "其他咨询(蜂鸟)": "2,009"
    },
    {
      "日期": "2016-08-21",
      "总计": "16,923",
      "催单(用户)": "2,101",
      "退单(用户)": "1,180",
      "订单变更(用户)": "165",
      "钱款问题(用户)": "1,489",
      "订单投诉(用户)": "2,989",
      "软件、账户、会员卡(用户)": "968",
      "账户与资金(商家)": "1,520",
      "手淘及支付宝店铺(商家)": "408",
      "物流配送(商家)": "779",
      "商家客户端(商家)": "1,528",
      "开店与合作(商家)": "692",
      "订单查询(商家)": "511",
      "加入蜂鸟(蜂鸟)": "191",
      "账户管理(蜂鸟)": "282",
      "骑手申诉(蜂鸟)": "562",
      "投诉及撤销(蜂鸟)": "1",
      "其他咨询(蜂鸟)": "1,557"
    }
  ],
  size: 30,
  total: 109
})
