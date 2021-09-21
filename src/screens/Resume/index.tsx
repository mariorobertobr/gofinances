import React, { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoadContainer, Container, MonthSelect, MonthSelectButton, MonthSelectIcon, Month, Content, Header, Title, ChartContainer } from './styles';
import { HistoryCard } from '../../components/HistoryCard';
import { categories } from '../../utils/categories';
import { VictoryPie } from 'victory-native'
import { ActivityIndicator } from 'react-native';
import { useTheme } from 'styled-components';
import { RFValue } from 'react-native-responsive-fontsize';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { addMonths, subMonths, format } from 'date-fns'
import { useFocusEffect } from '@react-navigation/core';
import { ptBR } from 'date-fns/locale'
import { useAuth } from '../../hooks/auth';
interface TransactionData {
  type: 'positive' | 'negative';
  name: string;
  amount: number;
  category: string;
  date: string;

}

interface CategoryData {
  name: string;
  total: number;
  color: string;
  totalFormatted: string;
  percent: string;
}
export function Resume() {
  const [totalByCategories, setTotalByCategories] = useState<CategoryData[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const theme = useTheme();
  const { user } = useAuth()
  function handleChageDate(action: 'next' | 'prev') {

    if (action === 'next') {
      const newDate = addMonths(selectedDate, 1)
      setSelectedDate(newDate)
    }
    else {
      const newDate = subMonths(selectedDate, 1)
      setSelectedDate(newDate)
    }
  }


  async function loadData() {
    setIsLoading(true)
    const dataKey = `@gofinances:transactions_user:${user.id}`
    const response = await AsyncStorage.getItem(dataKey);
    const responseFormatted = response ? JSON.parse(response) : [];

    const expensives = responseFormatted.filter((expensive: TransactionData) => expensive.type === 'negative' &&
      new Date(expensive.date).getMonth() === selectedDate.getMonth() &&
      new Date(expensive.date).getFullYear() === selectedDate.getFullYear()
    );
    const totalByCategory: CategoryData[] = []

    const expensivesTotal = expensives.reduce((acumullator: number, expensive: TransactionData) => {
      return acumullator + Number(expensive.amount);
    }, 0)



    categories.forEach(category => {
      let categorySum = 0;

      expensives.forEach((expensives: TransactionData) => {
        if (expensives.category === category.key) {
          categorySum += Number(expensives.amount);
        }
      })


      const percent = `${(categorySum / expensivesTotal * 100).toFixed(0)}%`

      if (categorySum > 0) {
        totalByCategory.push({
          name: category.name,
          totalFormatted: categorySum.toLocaleString('pt-BR', {
            style: 'currency', currency: 'BRL',
          }),
          color: category.color,
          total: categorySum,
          percent
        })
      }




    })
    setTotalByCategories(totalByCategory)
    setIsLoading(false);

  }


  useFocusEffect(useCallback(() => {
    loadData();
  }, [selectedDate]))

  return (
    <Container>
      <Header>
        <Title>Tela Resumo</Title>
      </Header>
      {
        isLoading ?
          <LoadContainer>
            <ActivityIndicator size="large" color="blue" />

          </LoadContainer>
          :
          <>


            <Content
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 24,
                paddingBottom: useBottomTabBarHeight(),
              }}

            >

              <MonthSelect>
                <MonthSelectButton onPress={() => handleChageDate('prev')}>
                  <MonthSelectIcon name="chevron-left" />
                </MonthSelectButton>

                <Month>{format(selectedDate, "MMMM, yyyy", { locale: ptBR })}</Month>

                <MonthSelectButton onPress={() => handleChageDate('next')}>
                  <MonthSelectIcon name="chevron-right" />
                </MonthSelectButton>
              </MonthSelect>

              <ChartContainer>
                <VictoryPie
                  data={totalByCategories}
                  x="percent"
                  y="total"
                  colorScale={totalByCategories.map(category => category.color)}
                  style={{
                    labels: {

                      fontSize: RFValue(18),
                      fontWeight: 'bold',
                      fill: theme.colors.shape

                    },
                  }}
                  labelRadius={50}

                />
              </ChartContainer>


              {
                totalByCategories.map(item => (
                  <HistoryCard key={item.name} title={item.name} amount={item.totalFormatted} color={item.color} />
                ))

              }
            </Content>
          </>
      }
    </Container>
  );
};


