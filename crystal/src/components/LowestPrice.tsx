import React from 'react';
import { Table } from 'antd';
import type { TableColumnsType } from 'antd';
import {LowestGamePriceInfo} from '../client/price';

type LowestPriceTableProps = {
  lowestGamePriceInfos: LowestGamePriceInfo[];
}

const LowestPriceTable: React.FC<LowestPriceTableProps> =
  (_props) => {

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
          dataSource={_props.lowestGamePriceInfos}
        />
      </div>
    )
};

export default LowestPriceTable;