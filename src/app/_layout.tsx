import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from '@/context/auth-context';
import { CharacterProvider } from '@/context/character-context';
import { ThemeProvider, useTheme } from '@/context/theme-context';

function RootNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.backgroundCard,
          },
          headerTintColor: theme.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: theme.background,
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: '⚔️ QuestSheet RPG',
          }}
        />
        <Stack.Screen
          name="auth/login"
          options={{
            title: '🔐 Portal do Aventureiro',
            headerBackTitle: 'Voltar',
          }}
        />
        <Stack.Screen
          name="auth/register"
          options={{
            title: '📝 Cadastro de Aventureiro',
            headerBackTitle: 'Voltar',
          }}
        />
        <Stack.Screen
          name="auth/forgot-password"
          options={{
            title: '🔑 Recuperação de Senha',
            headerBackTitle: 'Voltar',
          }}
        />
        <Stack.Screen
          name="characters/index"
          options={{
            title: '🛡️ Meus Personagens',
            headerBackTitle: 'Início',
          }}
        />
        <Stack.Screen
          name="create"
          options={{
            title: '✨ Forjar Herói',
            headerBackTitle: 'Voltar',
          }}
        />
        <Stack.Screen
          name="character/[id]/index"
          options={{
            title: '⚔️ Ficha de Combate',
            headerBackTitle: 'Heróis',
          }}
        />
        <Stack.Screen
          name="character/[id]/skills"
          options={{
            title: '🎯 Perícias & Salvaguardas',
            headerBackTitle: 'Combate',
          }}
        />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CharacterProvider>
          <RootNavigator />
        </CharacterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
