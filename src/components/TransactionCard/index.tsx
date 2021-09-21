import { ReactNode } from 'react';
import React from 'react'
import { Text } from 'react-native';

import { Container, Title, Amount, Footer, Category, Icon, CategoryName, Date } from './styles';
import { categories } from '../../utils/categories';


export interface PropsTransactionCard {
  type: 'negative' | 'positive';
  name: string;
  amount: string;
  category: string;
  date: string;

}
interface Props {
  data: PropsTransactionCard;
}

export function TransactionCard({ data }: Props) {
  const category = categories.filter(item => item.key === data.category)[0];

  return (
    <Container>
      <Title>{data.name}</Title>
      <Amount type={data.type}>
        {data.type === 'negative' && '- '}
        {data.amount}
      </Amount>
      <Footer>
        <Category>
          <Icon name={category.icon}></Icon>
          <CategoryName>{category.name}</CategoryName>
        </Category>
        <Date>{data.date}</Date>
      </Footer>
    </Container>
  );
};


