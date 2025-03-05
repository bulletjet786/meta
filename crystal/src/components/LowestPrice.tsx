import React from 'react';
import { Table } from 'antd';
import type { TableColumnsType } from 'antd';
import { ItadClient } from '../client/itad';


const countryCodes = new Map(
  [
    ["CN", "中国"],
    ["AR", "阿根廷"],
    ["RU", "俄罗斯"],
    ["TR", "土耳其"],
    ["US", "美国"],
  ]
)

export default LowestPriceTable;




type LowestPriceTableProps = {

}


const LowestPriceTable: React.FC<LowestPriceTableProps> =
  (props) => {

    useEffect(() => {
      ItadClient
    }, [])

    const data: LowestPriceDataType[] = [
      {
        countryCode: 'John Brown',
        countryName: "32",
        countryIcon: 'New York No. 1 Lake Park',
        currentPrice: 100.0,
        currentPriceOrigin: 200.0,
        currentPriceCut: 0.5,
        lowestPrice: 50.0, 
        lowestPriceOrigin: 100.0,
        lowestPriceCut: 0.25,
        exchangeRate: 0.5,
      }
    ];

    const columns: TableColumnsType<DataType> = [
      { 
        title: '区域', 
        dataIndex: 'countryName',
      },
      { 
        title: '当前价格',
        dataIndex: 'currentPrice',
        render: (_, record, __) => {
          return (
            <div>
              { `¥` + record.currentPrice `($` + record.currentPriceOrigin `)?` + record.exchangeRate }%
            </div>
          )
        }
      },
      { 
        title: '最低价格',
        dataIndex: 'lowestPrice',
        render: (_, record, __) => {
          return (
            <div>
              { `¥` + record.lowestPrice `($` + record.lowestPriceOrigin `)?` + record.exchangeRate }%
            </div>
          )
        }
      },
      {
        title: '历史价格',
        dataIndex: '',
        key: 'x',
        render: () => <a>Delete</a>,
      },
    ];

    return (
      <div>
        <Table<LowestPriceDataType>
          columns={columns}
          expandable={{
            expandedRowRender: (record) => <p style={{ margin: 0 }}>{record.description}</p>,
            rowExpandable: (record) => record.name !== 'Not Expandable',
          }}
          dataSource={data}
        />
      </div>
    )
};