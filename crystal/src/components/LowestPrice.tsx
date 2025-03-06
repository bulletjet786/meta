import React from 'react';
import { Table } from 'antd';
import type { TableColumnsType } from 'antd';
import { CountryInfo } from '../constants/country';
import  { LowestGamePriceInfo } from '../client/price';

const countries = [CountryInfo.CN, CountryInfo.AR, CountryInfo.RU, CountryInfo.TR, CountryInfo.US]



type LowestPriceTableProps = {
  appId: string;
}

const LowestPriceTable: React.FC<LowestPriceTableProps> =
  (props) => {

    useEffect(() => {
    
    }, [])

    const data: LowestGamePriceInfo[] = [
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

    const columns: TableColumnsType<LowestGamePriceInfo> = [
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

export default LowestPriceTable;