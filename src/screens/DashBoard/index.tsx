import React, { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native'
import { LoadContainer, TransactionList, Transactions, LogoutButton, Title, Container, HighlightCards, Header, UserInfo, Photo, User, UserGreeting, UserName, UserWrapper, Icon } from './styles';
import { HighlightCard } from '../../components/HighlighCard';
import { TransactionCard, PropsTransactionCard } from '../../components/TransactionCard';
import { AsyncStorage } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { LastTransaction } from '../../components/HighlighCard/styles';
import { useAuth } from './../../hooks/auth';




export interface DataListProps extends PropsTransactionCard {
  id: string;
}
interface HighlightProps {
  amount: string;
  lastTransaction: string;
}

interface HighlightData {
  entries: HighlightProps;
  expensives: HighlightProps;
  total: HighlightProps;
}


export function Dashboard() {
  const [transactions, seTransactions] = useState<DataListProps[]>([])
  const [highlightData, setHighlightData] = useState<HighlightData>({} as HighlightData);
  const [isLoading, setIsLoading] = useState(true);
  const { user, signOut } = useAuth();

  function getLastTransactionDate(
    collection: DataListProps[],
    type: 'positive' | 'negative'
  ) {
    const collectionFilterred = collection.filter(transaction => transaction.type === type);
    if (collectionFilterred.length === 0) {
      return 0;
    }
    const lastTransaction = new Date(
      Math.max.apply(Math, collection
        .filter(transaction => transaction.type === type)
        .map(transaction => new Date(transaction.date).getTime())))

    return `${lastTransaction.getDate()} de ${lastTransaction.toLocaleString('pt-BR', { month: 'long' })}`;




  }


  async function loadTransactions() {

    const dataKey = `@gofinances:transactions_user:${user.id}`
    const response = await AsyncStorage.getItem(dataKey);
    const transactions = response ? JSON.parse(response) : [];

    let entriesSumTotal = 0;
    let expensiveTotal = 0;

    const transactionsFormatted: DataListProps[] = transactions.map((item: DataListProps) => {
      const amount = Number(item.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      const date = Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      }).format(new Date(item.date));

      if (item.type === 'positive') {
        entriesSumTotal += Number(item.amount);
      }
      else {
        expensiveTotal += Number(item.amount);
      }

      return {
        id: item.id,
        name: item.name,
        amount,
        type: item.type,
        category: item.category,
        date
      }


    })
    seTransactions(transactionsFormatted)

    const lastTransactionEntries = getLastTransactionDate(transactions, 'positive')
    const lastTransactionExpensives = getLastTransactionDate(transactions, 'negative')
    const totalInterval = lastTransactionExpensives === 0 ? "não há transações" : `01 a ${lastTransactionEntries}`;

    let total = entriesSumTotal - expensiveTotal;
    setHighlightData({
      entries: {
        amount: entriesSumTotal.toLocaleString('pt-BR', {
          style: 'currency', currency: 'BRL',

        }),
        lastTransaction: `ultima entrada dia ${lastTransactionEntries}`
      },
      expensives: {
        amount: expensiveTotal.toLocaleString('pt-BR', {
          style: 'currency', currency: 'BRL'
        }),
        lastTransaction: `ultima saída dia ${lastTransactionExpensives}`
      },
      total: {
        amount: total.toLocaleString('pt-BR', {
          style: 'currency', currency: 'BRL'
        }),
        lastTransaction: totalInterval
      }
    })
    setIsLoading(false);
  }

  useEffect(() => {
    loadTransactions();

  }, [])

  useFocusEffect(useCallback(() => {
    loadTransactions();
  }, []));





  return (
    <Container>

      {
        isLoading ?
          <LoadContainer>
            <ActivityIndicator size="large" color="blue" />

          </LoadContainer>
          :
          <>
            <Header>
              <UserWrapper>
                <UserInfo>
                  <Photo source={{ uri: user.photo }}></Photo>
                  <User>
                    <UserGreeting>Olá,</UserGreeting>
                    <UserName>{user.name}</UserName>
                  </User>
                </UserInfo>
                <LogoutButton>
                  <Icon name="power" onPress={signOut}></Icon>
                </LogoutButton>

              </UserWrapper>
            </Header>
            <HighlightCards >
              <HighlightCard type="up" title="Entradas" amount={highlightData.entries.amount} lastTransaction={highlightData.entries.lastTransaction} />
              <HighlightCard type="down" title="Saídas" amount={highlightData.expensives.amount} lastTransaction={highlightData.expensives.lastTransaction} />
              <HighlightCard type="total" title="Total" amount={highlightData.total.amount} lastTransaction={highlightData.total.lastTransaction} />
            </HighlightCards>
            <Transactions>
              <Title>Listagem</Title>
              <TransactionList
                data={transactions}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <TransactionCard data={item} />}
              />

            </Transactions>
          </>
      }
    </Container>
  )
}