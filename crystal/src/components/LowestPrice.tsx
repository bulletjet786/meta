import React from 'react';
import { Table } from 'antd';
import type { TableColumnsType } from 'antd';
import {LowestGamePriceInfo} from '../client/price';
import { Typography } from 'antd';

const { Text } = Typography;

type LowestPriceTableProps = {
  lowestGamePriceInfos: LowestGamePriceInfo[];
}

const LowestPriceTable: React.FC<LowestPriceTableProps> =
  (props) => {

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
            <PriceDisplay 
              price={record.currentPrice}
              originPrice={record.currentPriceOrigin}
              OriginPriceCurrency={record.currentPriceOriginCurrency}
            />
          )
        }
      },
      { 
        title: '最低价格',
        dataIndex: 'lowestPrice',
        render: (_it, record) => {
          return (
            <PriceDisplay 
              price={record.lowestPrice}
              originPrice={record.lowestPriceOrigin}
              OriginPriceCurrency={record.lowestPriceOriginCurrency}
            />
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
          dataSource={props.lowestGamePriceInfos}
        />
      </div>
    )
};

type PriceDisplayProps = {
  price: number,
  originPrice: number,
  OriginPriceCurrency: string,
}

const PriceDisplay: React.FC<PriceDisplayProps> = 
  (props) => {
    return (
      <div>
        <span>
          <Text> ¥ {props.price.toFixed(2)} </Text>
          <Text type='secondary'> { `( ` + props.OriginPriceCurrency + ` ` +  props.originPrice.toFixed(2) + ` )` }</Text>
        </span>
      </div>
    );
  };

export default LowestPriceTable;