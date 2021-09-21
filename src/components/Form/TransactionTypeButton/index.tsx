import React from 'react';
import { Container, Icon, Button, Title } from './styles';
import { RectButtonProps } from 'react-native-gesture-handler'
interface Proprs extends RectButtonProps {
  title: string;
  type: 'up' | 'down';
  isActive: boolean;
}
const icons = {
  up: 'arrow-up-circle',
  down: 'arrow-down-circle',
}


export function TransactionTypeButton({ isActive, title, type, ...rest }: Proprs) {
  return (
    <Container type={type} isActive={isActive} >
      <Button {...rest}>
        <Icon type={type} name={icons[type]}></Icon>
        <Title>{title}</Title>
      </Button>
    </Container>
  );
};


