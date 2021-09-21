import React, { useState, useEffect } from 'react';
import { AsyncStorage, Modal, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import { Container, Header, Title, Form, Fields, TransactionTypes } from './styles';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/Form/Button';
import { TransactionTypeButton } from '../../components/Form/TransactionTypeButton';
import { CategorySelectButton } from '../../components/Form/CategorySelectButton';
import { CategorySelect } from '../CategorySelect';
import uuid from 'react-native-uuid';
import { InputForm } from '../../components/Form/InputForm';
import * as Yup from 'yup';
import { useNavigation } from '@react-navigation/native';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../../hooks/auth';
interface FormData {
  name: string;
  amount: string;
}

const schema = Yup.object().shape({
  name: Yup.string().required("Nome é Obrigatório"),
  amount: Yup.number().typeError("informe apenas numeros").positive('O valor não pode ser Negativo').required('o Valor é obrigatório')
})
interface Nav {
  name: string;
}

export function Register() {

  const [transactionType, setTransactionType] = useState('')
  const [categoryModalOpen, setcategoryModalOpen] = useState(false)
  const { user } = useAuth();
  const dataKey = `@gofinances:transactions_user:${user.id}`
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  const [category, setCategory] = useState({
    key: 'category',
    name: 'Categoria',

  });
  const navigation = useNavigation();

  function handleTransactionTypeSelect(type: 'positive' | 'negative') {
    setTransactionType(type);
  }

  function handleCloseSelectCategoryModal() {
    setcategoryModalOpen(false)
  }

  function handleOpenSelectCategoryModal() {
    setcategoryModalOpen(true)
  }

  async function handleRegister(form: FormData) {
    if (!transactionType) {
      return Alert.alert('Selecione o tipo da transação')
    }
    if (category.key === 'category') {
      return Alert.alert('Selecione o tipo de Categoria')
    }

    const newTransaction = {
      id: String(uuid.v4()),
      name: form.name,
      amount: form.amount,
      type: transactionType,
      category: category.key,
      date: new Date(),
    }

    try {
      const data = await AsyncStorage.getItem(dataKey)
      const currentData = data ? JSON.parse(data) : [];

      const dataFormatted = [
        ...currentData,
        newTransaction
      ];

      await AsyncStorage.setItem(dataKey, JSON.stringify(dataFormatted));
      reset();
      setTransactionType('');
      setCategory({
        key: 'category',
        name: 'Categoria',
      })

      navigation.navigate<Nav>("Listagem");

    }
    catch (error) {
      Alert.alert("não foi possivel salvar a transação");
    }




  }
  useEffect(() => {
    async function loadData() {
      const data = await AsyncStorage.getItem(dataKey);

    }
    loadData();

  }, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Container>
        <Header>
          <Title>
            Cadastro
          </Title>
        </Header>
        <Form>
          <Fields>
            <InputForm error={errors.name && errors.name.message} name="name" control={control} placeholder="nome" autoCapitalize="sentences" autoCorrect={false}></InputForm>
            <InputForm error={errors.amount && errors.amount.message} name="amount" control={control} placeholder="Preço" keyboardType="numeric"></InputForm>
            <TransactionTypes>
              <TransactionTypeButton title="Income" type="up" onPress={() => handleTransactionTypeSelect('positive')} isActive={transactionType === 'positive'}></TransactionTypeButton>
              <TransactionTypeButton title="Outcome" type="down" onPress={() => handleTransactionTypeSelect('negative')} isActive={transactionType === 'negative'}></TransactionTypeButton>
            </TransactionTypes>
            <CategorySelectButton title={category.name} onPress={handleOpenSelectCategoryModal}></CategorySelectButton>
          </Fields>
          <Button title="enviar" onPress={handleSubmit(handleRegister)}></Button>
        </Form>
        <Modal visible={categoryModalOpen} >
          <CategorySelect
            category={category}
            setCategory={setCategory}
            closeSelectCategory={handleCloseSelectCategoryModal}

          />
        </Modal>

      </Container>
    </TouchableWithoutFeedback>
  );
};

