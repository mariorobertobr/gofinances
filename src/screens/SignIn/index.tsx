import React, { useContext, useState } from 'react';
import { ActivityIndicator, Alert, Platform } from 'react-native';
import { Container, Header, TitleWrapper, Title, SignInTittle, Footer, FooterWrapper } from './styles';
import AppleSvg from '../../assets/apple.svg'
import GoogleSvg from '../../assets/google.svg'
import LogoSvg from '../../assets/logo.svg'
import { RFValue } from 'react-native-responsive-fontsize';
import { SignInSocialButton } from '../../components/SignInSocialButton';
import { useAuth } from '../../hooks/auth';
import { useTheme } from 'styled-components';
import { ThemeContext } from 'styled-components/native';


export function SignIn() {
  const [isLoading, setIsLoading] = useState(false);

  const { signInWithGoogle } = useAuth();
  const { signInWithApple } = useAuth();
  const theme = useTheme();

  async function handleSignInWithGoogle() {

    try {
      setIsLoading(true);
      return await signInWithGoogle();

    }
    catch (error) {
      console.log(error);
      Alert.alert("erro ao conectar a conta google")
      setIsLoading(false);
    }


  }
  async function handleSignInWithApple() {

    try {
      setIsLoading(true);
      return await signInWithApple();

    }
    catch (error) {
      console.log(error);
      setIsLoading(false);
      Alert.alert("erro ao conectar a conta Apple")
    }

  }

  return (
    <Container>
      <Header>
        <TitleWrapper>
          <LogoSvg
            width={RFValue(120)}
            height={RFValue(68)}
          ></LogoSvg>
          <Title>
            Controle suas {'\n'} finanças de forma {'\n'} muito simples
          </Title>
        </TitleWrapper>

        <SignInTittle>
          Faça seu login com {'\n'} uma das contas abaixo
        </SignInTittle>
      </Header>

      <Footer>
        <FooterWrapper>

          <SignInSocialButton title="Entrar com Google" svg={GoogleSvg}
            onPress={handleSignInWithGoogle}
          ></SignInSocialButton>
          {
            Platform.OS === 'ios' &&
            <SignInSocialButton title="entrar com Apple" svg={AppleSvg}
              onPress={handleSignInWithApple}
            ></SignInSocialButton>
          }
        </FooterWrapper>
        {isLoading && <ActivityIndicator size={50} color={theme.colors.shape}
          style={{ marginTop: 18 }}
        />}
      </Footer>
    </Container>
  );
};


