import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: theme.backgroundCard,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={[styles.badge, { backgroundColor: theme.primary, color: theme.primaryText }]}>
            COMMIT #02 • v0.2.0 • TEMA FANTASY ATIVO
          </Text>
          <Text style={[styles.heroTitle, { color: theme.text }]}>
            ⚔️ QuestSheet RPG
          </Text>
          <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
            Aplicativo mobile híbrido com tema dinâmico Dark Fantasy / Pergaminho gerenciado via Context API e persistido no AsyncStorage.
          </Text>

          {/* Botão Interativo de Alternância de Tema (Demonstrando Context API) */}
          <TouchableOpacity
            style={[
              styles.themeToggleBtn,
              {
                backgroundColor: theme.backgroundElevated,
                borderColor: theme.primary,
              },
            ]}
            onPress={toggleTheme}
            activeOpacity={0.8}
          >
            <Text style={styles.themeToggleIcon}>{isDark ? '☀️' : '🌙'}</Text>
            <Text style={[styles.themeToggleText, { color: theme.text }]}>
              Modo Atual: <Text style={{ color: theme.primary, fontWeight: 'bold' }}>{isDark ? 'Dark Fantasy' : 'Pergaminho (Light)'}</Text> (Toque para alternar)
            </Text>
          </TouchableOpacity>

          <View style={styles.tagRow}>
            <Text style={[styles.tag, { backgroundColor: theme.backgroundElevated, color: theme.textSecondary, borderColor: theme.border }]}>
              Expo SDK 57
            </Text>
            <Text style={[styles.tag, { backgroundColor: theme.backgroundElevated, color: theme.textSecondary, borderColor: theme.border }]}>
              React Native 0.86
            </Text>
            <Text style={[styles.tagHighlight, { backgroundColor: theme.hpBg, color: theme.hp, borderColor: theme.hp }]}>
              SemVer v0.2.0
            </Text>
            <Text style={[styles.tagHighlight, { backgroundColor: theme.manaBg, color: theme.mana, borderColor: theme.mana }]}>
              Context API Global
            </Text>
          </View>
        </View>

        {/* Paleta de Cores Semânticas do RPG (Tokens de Design da Aula 3) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            🎨 Paleta Semântica de RPG (Design Tokens)
          </Text>
          <View style={styles.paletteGrid}>
            <View style={[styles.paletteBadge, { backgroundColor: theme.primary }]}>
              <Text style={[styles.paletteText, { color: theme.primaryText }]}>Ouro Épico</Text>
            </View>
            <View style={[styles.paletteBadge, { backgroundColor: theme.accent }]}>
              <Text style={[styles.paletteText, { color: '#FFFFFF' }]}>Carmesim</Text>
            </View>
            <View style={[styles.paletteBadge, { backgroundColor: theme.hp }]}>
              <Text style={[styles.paletteText, { color: '#FFFFFF' }]}>PV / Vida</Text>
            </View>
            <View style={[styles.paletteBadge, { backgroundColor: theme.mana }]}>
              <Text style={[styles.paletteText, { color: '#FFFFFF' }]}>Mana / Magia</Text>
            </View>
            <View style={[styles.paletteBadge, { backgroundColor: theme.stamina }]}>
              <Text style={[styles.paletteText, { color: '#0B0D12' }]}>Dados / Vigor</Text>
            </View>
            <View style={[styles.paletteBadge, { backgroundColor: theme.healing }]}>
              <Text style={[styles.paletteText, { color: '#FFFFFF' }]}>Cura</Text>
            </View>
          </View>
        </View>

        {/* As 3 Camadas de Arquitetura (Slide 5 da Aula 3) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            🏛️ Arquitetura em 3 Camadas
          </Text>
          <View style={styles.layerContainer}>
            <View style={[styles.layerCard, { backgroundColor: theme.backgroundCard, borderColor: theme.border }]}>
              <Text style={styles.layerIcon}>🖥️</Text>
              <Text style={[styles.layerTitle, { color: theme.text }]}>1. Apresentação (UI)</Text>
              <Text style={[styles.layerDesc, { color: theme.textSecondary }]}>
                Componentes em árvore, StyleSheet Flexbox e suporte a Dark Fantasy / Pergaminho.
              </Text>
            </View>
            <View style={[styles.layerCard, { backgroundColor: theme.backgroundCard, borderColor: theme.border }]}>
              <Text style={styles.layerIcon}>🧠</Text>
              <Text style={[styles.layerTitle, { color: theme.text }]}>2. Estado (Context API)</Text>
              <Text style={[styles.layerDesc, { color: theme.textSecondary }]}>
                ThemeContext global distribuído via ThemeProvider, sem prop drilling (Aula 3).
              </Text>
            </View>
            <View style={[styles.layerCard, { backgroundColor: theme.backgroundCard, borderColor: theme.border }]}>
              <Text style={styles.layerIcon}>💾</Text>
              <Text style={[styles.layerTitle, { color: theme.text }]}>3. Dados & Resiliência</Text>
              <Text style={[styles.layerDesc, { color: theme.textSecondary }]}>
                Preferencia de tema persistida via AsyncStorage (Aula 4) e tokens via SecureStore.
              </Text>
            </View>
          </View>
        </View>

        {/* Lista das 11 Telas Mapeadas */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            🗺️ Grafo de Navegação — 11 Telas
          </Text>
          <View style={styles.screenList}>
            {PLANNED_SCREENS.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.screenCard,
                  {
                    backgroundColor: theme.backgroundCard,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text style={styles.screenIcon}>{item.icon}</Text>
                <View style={styles.screenTextContainer}>
                  <Text style={[styles.screenTitle, { color: theme.text }]}>{item.title}</Text>
                  <Text style={[styles.screenDesc, { color: theme.textSecondary }]}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Checklist do Repositório (Slide 17 da Aula 5) */}
        <View style={[styles.checklistCard, { backgroundColor: theme.backgroundCard, borderColor: theme.border }]}>
          <Text style={[styles.checklistTitle, { color: theme.text }]}>
            ✅ Checklist do Repositório (Prof. Garrido)
          </Text>
          <Text style={[styles.checkItem, { color: theme.healing }]}>
            ✔ Commit 01 efetuado com sucesso (v0.1.0)
          </Text>
          <Text style={[styles.checkItem, { color: theme.healing }]}>
            ✔ Commit 02 em execução: Tema Fantasy Dark & Light configurado
          </Text>
          <Text style={[styles.checkItem, { color: theme.healing }]}>
            ✔ Context API global funcionando com ThemeProvider nativo
          </Text>
          <Text style={[styles.checkItem, { color: theme.healing }]}>
            ✔ Persistência de preferências de UI no AsyncStorage (Aula 4)
          </Text>
        </View>
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
    borderRadius: Radius.lg,
    padding: Spacing.md + 4,
    borderWidth: 1,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  badge: {
    fontWeight: 'bold',
    fontSize: 11,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    overflow: 'hidden',
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
  themeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 8,
    marginVertical: 4,
  },
  themeToggleIcon: {
    fontSize: 18,
  },
  themeToggleText: {
    fontSize: 12,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  tag: {
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  tagHighlight: {
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  paletteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paletteBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.sm,
  },
  paletteText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  layerContainer: {
    gap: 8,
  },
  layerCard: {
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 1,
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
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 1,
    gap: 10,
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
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
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
