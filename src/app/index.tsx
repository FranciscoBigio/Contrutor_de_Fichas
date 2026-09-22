import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

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
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Banner do Aluno e Disciplina (Universidade de Vassouras) */}
        <View style={styles.academicBanner}>
          <Text style={styles.institutionText}>UNIVERSIDADE DE VASSOURAS • ENGENHARIA DE SOFTWARE</Text>
          <Text style={styles.courseText}>Disciplina: Aplicativos Híbridos • Prof. Márcio Garrido</Text>
          <Text style={styles.authorHighlight}>Aluno: Francisco Bigio</Text>
        </View>

        {/* Hero Card do Projeto */}
        <View style={styles.heroCard}>
          <Text style={styles.badge}>COMMIT #01 • v0.1.0 • BASE LIMPA</Text>
          <Text style={styles.heroTitle}>⚔️ QuestSheet RPG</Text>
          <Text style={styles.heroSubtitle}>
            Aplicativo mobile híbrido em React Native / Expo com arquitetura em 3 camadas, navegação em grafo e segurança OWASP Mobile.
          </Text>

          <View style={styles.tagRow}>
            <Text style={styles.tag}>Expo SDK 57</Text>
            <Text style={styles.tag}>React Native 0.86</Text>
            <Text style={styles.tag}>TypeScript</Text>
            <Text style={styles.tagHighlight}>SemVer v0.1.0</Text>
            <Text style={styles.tagHighlight}>11 Telas Mapeadas</Text>
            <Text style={styles.tagHighlight}>24 Commits</Text>
          </View>
        </View>

        {/* As 3 Camadas de Arquitetura (Slide 5 da Aula 3) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏛️ Arquitetura em 3 Camadas</Text>
          <View style={styles.layerContainer}>
            <View style={styles.layerCard}>
              <Text style={styles.layerIcon}>🖥️</Text>
              <Text style={styles.layerTitle}>Apresentação</Text>
              <Text style={styles.layerDesc}>Componentes em árvore, StyleSheet com Flexbox, Expo Router e navegação Stack/Tabs.</Text>
            </View>
            <View style={styles.layerCard}>
              <Text style={styles.layerIcon}>🧠</Text>
              <Text style={styles.layerTitle}>Estado</Text>
              <Text style={styles.layerDesc}>Local com useState (inputs, olho da senha) e Global com Context API (AuthContext, Fichas).</Text>
            </View>
            <View style={styles.layerCard}>
              <Text style={styles.layerIcon}>💾</Text>
              <Text style={styles.layerTitle}>Dados & Segurança</Text>
              <Text style={styles.layerDesc}>SecureStore (OWASP M2 p/ tokens JWT), AsyncStorage (tema/UI) e Offline-First com cache.</Text>
            </View>
          </View>
        </View>

        {/* Lista das 11 Telas Mapeadas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗺️ Grafo de Navegação — 11 Telas</Text>
          <Text style={styles.sectionDescription}>
            Estrutura de telas dividida em nós com navegação Stack e Tabs, centralizada na tela HUB:
          </Text>

          <View style={styles.screenList}>
            {PLANNED_SCREENS.map((item) => (
              <View key={item.id} style={styles.screenCard}>
                <Text style={styles.screenIcon}>{item.icon}</Text>
                <View style={styles.screenTextContainer}>
                  <Text style={styles.screenTitle}>{item.title}</Text>
                  <Text style={styles.screenDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Checklist do Repositório (Slide 17 da Aula 5) */}
        <View style={styles.checklistCard}>
          <Text style={styles.checklistTitle}>✅ Checklist do Repositório (Prof. Garrido)</Text>
          <Text style={styles.checkItem}>✔ README.md claro detalhando arquitetura, telas e roadmap</Text>
          <Text style={styles.checkItem}>✔ .gitignore correto sem node_modules/ nem segredos</Text>
          <Text style={styles.checkItem}>✔ Mínimo de 6 telas: 11 telas planejadas</Text>
          <Text style={styles.checkItem}>✔ Mínimo de 20 commits: 24 commits descritivos mapeados</Text>
          <Text style={styles.checkItem}>✔ Armazenamento seguro de token JWT via SecureStore (OWASP M2)</Text>
          <Text style={styles.checkItem}>✔ Estrutura de pastas modular conforme a anatomia do Expo</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0D12',
  },
  container: {
    padding: 16,
    gap: 18,
  },
  academicBanner: {
    backgroundColor: '#11141C',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#C59B27',
    borderWidth: 1,
    borderColor: '#1E2330',
    gap: 4,
  },
  institutionText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  courseText: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  authorHighlight: {
    fontSize: 13,
    color: '#C59B27',
    fontWeight: 'bold',
    marginTop: 2,
  },
  heroCard: {
    backgroundColor: '#151922',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#262D3D',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#C59B27',
    color: '#0B0D12',
    fontWeight: 'bold',
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 10,
    overflow: 'hidden',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  tag: {
    backgroundColor: '#1C2230',
    color: '#CBD5E1',
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tagHighlight: {
    backgroundColor: '#C59B2720',
    color: '#EAB308',
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EAB30840',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  sectionDescription: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
  },
  layerContainer: {
    gap: 8,
  },
  layerCard: {
    backgroundColor: '#131620',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#202636',
  },
  layerIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  layerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E2E8F0',
    marginBottom: 2,
  },
  layerDesc: {
    fontSize: 12,
    color: '#828FA3',
    lineHeight: 16,
  },
  screenList: {
    gap: 8,
  },
  screenCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131620',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#202636',
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
    color: '#F1F5F9',
    marginBottom: 2,
  },
  screenDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  checklistCard: {
    backgroundColor: '#0F131C',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E2330',
    gap: 6,
  },
  checklistTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E2E8F0',
    marginBottom: 4,
  },
  checkItem: {
    fontSize: 12,
    color: '#A3E635',
    lineHeight: 18,
  },
});
