import React, { useState } from 'react';
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
  RPGInput,
  RPGPasswordInput,
} from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

const PLANNED_SCREENS = [
  // Módulo 1: Autenticação & Acesso
  { id: '1', title: '1. Login do Aventureiro', desc: 'Acesso seguro com e-mail/senha e token JWT via SecureStore', icon: '🔐' },
  { id: '2', title: '2. Cadastro de Conta', desc: 'Registro de novo aventureiro (jogador/mestre) com validações', icon: '📝' },
  { id: '3', title: '3. Recuperação de Senha', desc: 'Formulário de redefinição de acesso para recuperação de credenciais', icon: '🔑' },
  // Módulo 2: Gerenciamento & Ficha do RPG
  { id: '4', title: '4. Meus Personagens (HUB)', desc: 'Dashboard com lista de heróis, status, busca e filtros', icon: '🛡️' },
  { id: '5', title: '5. Criação de Herói', desc: 'Formulário em etapas (raça, classe, atributos e avatar)', icon: '✨' },
  { id: '6', title: '6. Ficha Geral (Combate & Atributos)', desc: 'HP dinâmico, CA, Iniciativa e grid dos 6 atributos principais', icon: '⚔️' },
  { id: '7', title: '7. Perícias & Salvaguardas', desc: '18 perícias clássicas com cálculo de bônus e proficiência', icon: '🎯' },
  { id: '8', title: '8. Grimório & Magias', desc: 'Controle de Spell Slots por círculo e magias preparadas', icon: '🔮' },
  { id: '9', title: '9. Inventário & Equipamentos', desc: 'Mochila, armas, moedas (PO, PP, PC) e capacidade de carga', icon: '🎒' },
  { id: '10', title: '10. Biografia & Habilidades', desc: 'História, características de raça/classe, traços e talentos', icon: '📜' },
  { id: '11', title: '11. Rolador de Dados Integrado', desc: 'Rolagens de d4 a d100 com cálculo de modificador e histórico', icon: '🎲' },
];

export default function HomeScreen() {
  const { theme, isDark, toggleTheme } = useTheme();

  // Estados locais para teste interativo dos componentes (Aula 3, Slide 12)
  const [demoName, setDemoName] = useState('');
  const [demoPassword, setDemoPassword] = useState('');
  const [btnFeedback, setBtnFeedback] = useState('Nenhuma ação disparada');

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
          <RPGBadge label="COMMIT #03 • v0.3.0 • COMPONENTES BASE PRONTOS" variant="gold" />
          <Text style={[styles.heroTitle, { color: theme.text }]}>
            ⚔️ QuestSheet RPG
          </Text>
          <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
            Componentes modulares de formulário prontos: Input, PasswordInput (com toggle local), Button e Card.
          </Text>

          <RPGButton
            title={`Alternar para ${isDark ? 'Pergaminho (Light)' : 'Dark Fantasy'}`}
            icon={isDark ? '☀️' : '🌙'}
            variant="secondary"
            onPress={toggleTheme}
            style={{ width: '100%' }}
          />

          <View style={styles.tagRow}>
            <RPGBadge label="SemVer v0.3.0" variant="hp" size="sm" />
            <RPGBadge label="Componentes em Árvore" variant="mana" size="sm" />
            <RPGBadge label="Estado Local (Slide 14)" variant="arcane" size="sm" />
          </View>
        </RPGCard>

        {/* Demonstração dos Componentes de Formulário (Commit 3) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            🧪 Teste dos Componentes de Formulário
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
            Componentes desacoplados que serão reaproveitados nas telas de Login, Cadastro e Ficha (Aula 3, Slide 6):
          </Text>

          <RPGCard style={styles.formCard}>
            <RPGInput
              label="Nome do Aventureiro (Input)"
              placeholder="Ex: Gandalf, Aragorn..."
              value={demoName}
              onChangeText={setDemoName}
              icon="👤"
              helperText={demoName ? `Olá, ${demoName}!` : 'Digite um nome para testar o input'}
            />

            <RPGPasswordInput
              label="Senha de Acesso (PasswordInput com Estado Local)"
              placeholder="Digite sua senha secreta..."
              value={demoPassword}
              onChangeText={setDemoPassword}
              helperText="Clique no olho para alternar a visibilidade (Slide 14)"
            />

            <View style={styles.btnRow}>
              <RPGButton
                title="Ação Primária"
                variant="primary"
                icon="⚔️"
                onPress={() => setBtnFeedback(`Aventureiro: ${demoName || 'Anônimo'} pronto para a batalha!`)}
                style={{ flex: 1 }}
              />
              <RPGButton
                title="Perigo"
                variant="danger"
                icon="🔥"
                onPress={() => setBtnFeedback('Alerta de dano crítico!')}
                style={{ flex: 1 }}
              />
            </View>

            <View style={[styles.feedbackBox, { backgroundColor: theme.backgroundInput, borderColor: theme.border }]}>
              <Text style={[styles.feedbackText, { color: theme.primary }]}>
                Feedback: {btnFeedback}
              </Text>
            </View>
          </RPGCard>
        </View>

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
                Componentes atômicos e reaproveitáveis: RPGButton, RPGInput, RPGCard e RPGBadge.
              </Text>
            </RPGCard>
            <RPGCard style={styles.layerCard}>
              <Text style={styles.layerIcon}>🧠</Text>
              <Text style={[styles.layerTitle, { color: theme.text }]}>2. Estado (Local × Global)</Text>
              <Text style={[styles.layerDesc, { color: theme.textSecondary }]}>
                Visibilidade de senha e foco em useState local; tema em ThemeContext global.
              </Text>
            </RPGCard>
            <RPGCard style={styles.layerCard}>
              <Text style={styles.layerIcon}>💾</Text>
              <Text style={[styles.layerTitle, { color: theme.text }]}>3. Dados & Resiliência</Text>
              <Text style={[styles.layerDesc, { color: theme.textSecondary }]}>
                SecureStore pronto para tokens JWT (OWASP M2) e AsyncStorage para tema.
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
              <RPGCard key={item.id} style={styles.screenCard}>
                <Text style={styles.screenIcon}>{item.icon}</Text>
                <View style={styles.screenTextContainer}>
                  <Text style={[styles.screenTitle, { color: theme.text }]}>{item.title}</Text>
                  <Text style={[styles.screenDesc, { color: theme.textSecondary }]}>{item.desc}</Text>
                </View>
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
            ✔ Commit 03 pronto: Componentes base de formulário criados (v0.3.0)
          </Text>
          <Text style={[styles.checkItem, { color: theme.healing }]}>
            ✔ Próximo: Tela de Login do Aventureiro (Commit 04 - v0.4.0)
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
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  sectionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  formCard: {
    gap: Spacing.md,
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  feedbackBox: {
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: 12,
    fontWeight: '600',
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
