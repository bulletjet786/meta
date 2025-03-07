import React, {useEffect} from 'react';
import { Table } from 'antd';
import type { TableColumnsType } from 'antd';
import { CountryInfo } from '../constants/country';
import {fetchLowestGamePriceInfo, LowestGamePriceInfo} from '../client/price';
import {create} from "zustand/react";

const countries = [
  CountryInfo.CN,
  CountryInfo.AR,
  CountryInfo.RU,
  CountryInfo.TR,
  CountryInfo.US
]

interface lowestPriceTableState {
  data: LowestGamePriceInfo[]
  load: (appId: string) => void
}


const useLowestPriceStore = create<lowestPriceTableState>()(
    (set) => ({
      data: [],
      load: async (appId: string) => {
          const requests = [];
          for (const country of countries) {
            requests.push(fetchLowestGamePriceInfo(appId, country));
          }
          const results = await Promise.all(requests);
          set({
            data: results.filter(it => it !== null) as LowestGamePriceInfo[]
          });
      },
  })
)

type LowestPriceTableProps = {
  itadId: string;
}

const LowestPriceTable: React.FC<LowestPriceTableProps> =
  (_props) => {

    const lowestPriceData = useLowestPriceStore((state) => state.data)
    const load = useLowestPriceStore((state) => state.load);

    useEffect(() => {
      load(_props.itadId)
    }, [])

    // const data: LowestGamePriceInfo[] = [
    //   {
    //     country: CountryInfo.CN,
    //     currentPrice: 100.0,
    //     currentPriceOrigin: 200.0,
    //     currentPriceCut: 0.5,
    //     lowestPrice: 50.0,
    //     lowestPriceOrigin: 100.0,
    //     lowestPriceCut: 0.25,
    //     exchangeRate: 0.5,
    //   }
    // ];

    const columns: TableColumnsType<LowestGamePriceInfo> = [
      { 
        title: '区域', 
        dataIndex: 'countryName',
        render: (_it, record) => {
          return (
            <div>
              { record.country.name }
            </div>
          )
        }
      },
      { 
        title: '当前价格',
        dataIndex: 'currentPrice',
        render: (_it, record) => {
          return (
            <div>
              { `¥ ` + record.currentPrice + `( ` + record.country.currencyCode + ` ` + record.currentPriceOrigin + ` )` }
            </div>
          )
        }
      },
      { 
        title: '最低价格',
        dataIndex: 'lowestPrice',
        render: (_it, record) => {
          return (
            <div>
              { `¥ ` + record.lowestPrice + `( ` + record.country.currencyCode + ` ` + record.lowestPriceOrigin + ` )` }
            </div>
          )
        }
      }
    ];

    return (
      <div>
        <Table<LowestGamePriceInfo>
          columns={columns}
          // expandable={{
          //   expandedRowRender: (record) => <p style={{ margin: 0 }}>{record.description}</p>,
          //   rowExpandable: (record) => record.name !== 'Not Expandable',
          // }}
          dataSource={lowestPriceData}
        />
      </div>
    )
};

export default LowestPriceTable;