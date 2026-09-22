import { useRouter } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  RPGBadge,
  RPGButton,
  RPGCard,
} from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';

const PLANNED_SCREENS = [
  // Módulo 1: Autenticação & Acesso
  { id: '1', title: '1. Login do Aventureiro (PRONTA)', desc: 'Acesso seguro com validações e token JWT via SecureStore', icon: '🔐', ready: true, route: '/auth/login' },
  { id: '2', title: '2. Cadastro de Conta (PRONTA)', desc: 'Registro com perfil de Mestre ou Jogador e persistência no SecureStore', icon: '📝', ready: true, route: '/auth/register' },
  { id: '3', title: '3. Recuperação de Senha', desc: 'Formulário de redefinição de acesso para recuperação de credenciais', icon: '🔑', ready: false, route: '/auth/forgot-password' },
  // Módulo 2: Gerenciamento & Ficha do RPG
  { id: '4', title: '4. Meus Personagens (HUB)', desc: 'Dashboard com lista de heróis, status, busca e filtros', icon: '🛡️', ready: false },
  { id: '5', title: '5. Criação de Herói', desc: 'Formulário em etapas (raça, classe, atributos e avatar)', icon: '✨', ready: false },
  { id: '6', title: '6. Ficha Geral (Combate & Atributos)', desc: 'HP dinâmico, CA, Iniciativa e grid dos 6 atributos principais', icon: '⚔️', ready: false },
  { id: '7', title: '7. Perícias & Salvaguardas', desc: '18 perícias clássicas com cálculo de bônus e proficiência', icon: '🎯', ready: false },
  { id: '8', title: '8. Grimório & Magias', desc: 'Controle de Spell Slots por círculo e magias preparadas', icon: '🔮', ready: false },
  { id: '9', title: '9. Inventário & Equipamentos', desc: 'Mochila, armas, moedas (PO, PP, PC) e capacidade de carga', icon: '🎒', ready: false },
  { id: '10', title: '10. Biografia & Habilidades', desc: 'História, características de raça/classe, traços e talentos', icon: '📜', ready: false },
  { id: '11', title: '11. Rolador de Dados Integrado', desc: 'Rolagens de d4 a d100 com cálculo de modificador e histórico', icon: '🎲', ready: false },
];

export default function HomeScreen() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Banner do Aluno e Disciplina (Universidade de Vassouras) */}
        <View
          style={[
            styles.academicBanner,
            {
              backgroundColor: theme.backgroundCard,
              borderLeftColor: theme.primary,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={[styles.institutionText, { color: theme.textSecondary }]}>
            UNIVERSIDADE DE VASSOURAS • ENGENHARIA DE SOFTWARE
          </Text>
          <Text style={[styles.courseText, { color: theme.text }]}>
            Disciplina: Aplicativos Híbridos • Prof. Márcio Garrido
          </Text>
          <Text style={[styles.authorHighlight, { color: theme.primary }]}>
            Aluno: Francisco Bigio
          </Text>
        </View>

        {/* Hero Card do Projeto */}
        <RPGCard variant="highlight" style={styles.heroCard}>
          <RPGBadge label="COMMIT #05 • v0.5.0 • TELA DE CADASTRO PRONTA" variant="gold" />
          <Text style={[styles.heroTitle, { color: theme.text }]}>
            ⚔️ QuestSheet RPG
          </Text>
          <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
            Duas telas do fluxo de autenticação concluídas com validações e segurança OWASP M2 (SecureStore)!
          </Text>

          {/* Card de Sessão do Usuário */}
          <View style={[styles.sessionBox, { backgroundColor: theme.backgroundInput, borderColor: theme.border }]}>
            {isAuthenticated && user ? (
              <View style={styles.sessionContent}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sessionGreeting, { color: theme.text }]}>
                    👑 {user.role === 'master' ? 'Mestre da Masmorra' : 'Aventureiro'}: <Text style={{ color: theme.primary, fontWeight: 'bold' }}>{user.name}</Text>
                  </Text>
                  <Text style={[styles.sessionEmail, { color: theme.textSecondary }]}>
                    {user.email} (Sessão salva no SecureStore)
                  </Text>
                </View>
                <RPGButton
                  title="Sair"
                  variant="danger"
                  size="sm"
                  onPress={logout}
                />
              </View>
            ) : (
              <View style={styles.sessionContent}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sessionGreeting, { color: theme.text }]}>
                    Sessão: Não Autenticado
                  </Text>
                  <Text style={[styles.sessionEmail, { color: theme.textSecondary }]}>
                    Cadastre-se ou entre para salvar seus heróis
                  </Text>
                </View>
                <RPGButton
                  title="Abrir Login"
                  variant="primary"
                  size="sm"
                  icon="🔐"
                  onPress={() => router.push('/auth/login' as any)}
                />
              </View>
            )}
          </View>

          <RPGButton
            title={`Alternar para ${isDark ? 'Pergaminho (Light)' : 'Dark Fantasy'}`}
            icon={isDark ? '☀️' : '🌙'}
            variant="secondary"
            onPress={toggleTheme}
            style={{ width: '100%' }}
          />

          <View style={styles.tagRow}>
            <RPGBadge label="SemVer v0.5.0" variant="hp" size="sm" />
            <RPGBadge label="OWASP M2 SecureStore" variant="mana" size="sm" />
            <RPGBadge label="Telas 2/11 Concluídas" variant="gold" size="sm" />
          </View>
        </RPGCard>

        {/* Atalhos Rápidos para as Telas Concluídas */}
        <RPGCard style={styles.actionCard}>
          <Text style={[styles.actionTitle, { color: theme.text }]}>
            🚀 Teste as Telas Prontas do Fluxo de Acesso
          </Text>
          <Text style={[styles.actionDesc, { color: theme.textSecondary }]}>
            Navegue entre as telas pelo padrão Stack conforme ensinado na Aula 3:
          </Text>
          <View style={styles.actionBtnRow}>
            <RPGButton
              title="Tela 1: Login"
              variant="primary"
              icon="🔐"
              onPress={() => router.push('/auth/login' as any)}
              style={{ flex: 1 }}
            />
            <RPGButton
              title="Tela 2: Cadastro"
              variant="secondary"
              icon="📝"
              onPress={() => router.push('/auth/register' as any)}
              style={{ flex: 1 }}
            />
          </View>
        </RPGCard>

        {/* As 3 Camadas de Arquitetura (Slide 5 da Aula 3) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            🏛️ Arquitetura em 3 Camadas
          </Text>
          <View style={styles.layerContainer}>
            <RPGCard style={styles.layerCard}>
              <Text style={styles.layerIcon}>🖥️</Text>
              <Text style={[styles.layerTitle, { color: theme.text }]}>1. Apresentação (UI)</Text>
              <Text style={[styles.layerDesc, { color: theme.textSecondary }]}>
                Telas de Login e Cadastro modulares, estilizadas com Flexbox e prontas para modo Dark e Pergaminho.
              </Text>
            </RPGCard>
            <RPGCard style={styles.layerCard}>
              <Text style={styles.layerIcon}>🧠</Text>
              <Text style={[styles.layerTitle, { color: theme.text }]}>2. Estado (Local × Global)</Text>
              <Text style={[styles.layerDesc, { color: theme.textSecondary }]}>
                AuthContext global com métodos login/register; useState local em cada formulário.
              </Text>
            </RPGCard>
            <RPGCard style={styles.layerCard}>
              <Text style={styles.layerIcon}>💾</Text>
              <Text style={[styles.layerTitle, { color: theme.text }]}>3. Dados & Resiliência</Text>
              <Text style={[styles.layerDesc, { color: theme.textSecondary }]}>
                Criptografia no SecureStore (Keychain/Keystore) para tokens e dados de sessão (OWASP M2).
              </Text>
            </RPGCard>
          </View>
        </View>

        {/* Lista das 11 Telas Mapeadas */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            🗺️ Grafo de Navegação — 11 Telas
          </Text>
          <View style={styles.screenList}>
            {PLANNED_SCREENS.map((item) => (
              <RPGCard
                key={item.id}
                variant={item.ready ? 'highlight' : 'default'}
                style={styles.screenCard}
                onPress={item.ready && item.route ? () => router.push(item.route as any) : undefined}
              >
                <Text style={styles.screenIcon}>{item.icon}</Text>
                <View style={styles.screenTextContainer}>
                  <Text style={[styles.screenTitle, { color: theme.text }]}>{item.title}</Text>
                  <Text style={[styles.screenDesc, { color: theme.textSecondary }]}>{item.desc}</Text>
                </View>
                {item.ready ? (
                  <RPGBadge label="PRONTA" variant="gold" size="sm" />
                ) : null}
              </RPGCard>
            ))}
          </View>
        </View>

        {/* Checklist do Repositório (Slide 17 da Aula 5) */}
        <RPGCard style={styles.checklistCard}>
          <Text style={[styles.checklistTitle, { color: theme.text }]}>
            ✅ Checklist do Repositório (Prof. Garrido)
          </Text>
          <Text style={[styles.checkItem, { color: theme.healing }]}>
            ✔ Commit 01 efetuado com sucesso (v0.1.0)
          </Text>
          <Text style={[styles.checkItem, { color: theme.healing }]}>
            ✔ Commit 02 efetuado com sucesso (v0.2.0)
          </Text>
          <Text style={[styles.checkItem, { color: theme.healing }]}>
            ✔ Commit 03 efetuado com sucesso (v0.3.0)
          </Text>
          <Text style={[styles.checkItem, { color: theme.healing }]}>
            ✔ Commit 04 efetuado com sucesso (v0.4.0)
          </Text>
          <Text style={[styles.checkItem, { color: theme.healing }]}>
            ✔ Commit 05 pronto: Tela 2 — Cadastro de Jogador criada (v0.5.0)
          </Text>
          <Text style={[styles.checkItem, { color: theme.healing }]}>
            ✔ Próximo: Tela 3 — Recuperação de Senha (Commit 06 - v0.6.0)
          </Text>
        </RPGCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  academicBanner: {
    borderRadius: Radius.md,
    padding: Spacing.sm + 4,
    borderLeftWidth: 4,
    borderWidth: 1,
    gap: 4,
  },
  institutionText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  courseText: {
    fontSize: 12,
  },
  authorHighlight: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 2,
  },
  heroCard: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  sessionBox: {
    width: '100%',
    padding: Spacing.sm + 4,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginVertical: Spacing.xs,
  },
  sessionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sessionGreeting: {
    fontSize: 13,
    fontWeight: '600',
  },
  sessionEmail: {
    fontSize: 11,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  actionCard: {
    gap: Spacing.sm,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  actionDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  layerContainer: {
    gap: 8,
  },
  layerCard: {
    padding: 12,
  },
  layerIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  layerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  layerDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  screenList: {
    gap: 8,
  },
  screenCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
  screenIcon: {
    fontSize: 22,
  },
  screenTextContainer: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  screenDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  checklistCard: {
    padding: Spacing.md,
    gap: 6,
  },
  checklistTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  checkItem: {
    fontSize: 12,
    lineHeight: 18,
  },
});
