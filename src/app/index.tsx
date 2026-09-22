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
import { useCharacters } from '@/context/character-context';
import { useTheme } from '@/context/theme-context';

const PLANNED_SCREENS = [
  // Módulo 1: Autenticação & Acesso (100% Concluído!)
  { id: '1', title: '1. Login do Aventureiro (PRONTA)', desc: 'Acesso seguro com validações e token JWT via SecureStore', icon: '🔐', ready: true, route: '/auth/login' },
  { id: '2', title: '2. Cadastro de Conta (PRONTA)', desc: 'Registro com perfil de Mestre ou Jogador e persistência no SecureStore', icon: '📝', ready: true, route: '/auth/register' },
  { id: '3', title: '3. Recuperação de Senha (PRONTA)', desc: 'Redefinição de acesso com envio simulado de código e timer de reenvio', icon: '🔑', ready: true, route: '/auth/forgot-password' },
  // Módulo 2: Gerenciamento & Ficha do RPG (Iniciado no Commit 07!)
  { id: '4', title: '4. Meus Personagens (HUB 1) (PRONTA)', desc: 'Dashboard com busca em tempo real, filtros por classe, barra de vida e status', icon: '🛡️', ready: true, route: '/characters' },
  { id: '5', title: '5. Criação de Herói (PRONTA)', desc: 'Assistente completo em 2 etapas: origem, alocação de atributos, PV e salvamento', icon: '✨', ready: true, route: '/create' },
  { id: '6', title: '6. Ficha Geral / HUB 2 (PRONTA)', desc: 'HP dinâmico, CA, Iniciativa, dados de vida e descanso de combate', icon: '⚔️', ready: true, route: '/character/hero-1' },
  { id: '7', title: '7. Perícias & Salvaguardas (PRONTA)', desc: '18 perícias clássicas do D&D 5e com cálculo de bônus, maestria e sentidos passivos', icon: '🎯', ready: true, route: '/character/hero-1/skills' },
  { id: '8', title: '8. Grimório & Magias (PRONTA)', desc: 'Controle de Spell Slots por círculo, magias preparadas e conjuração', icon: '🔮', ready: true, route: '/character/char-elora-03/spells' },
  { id: '9', title: '9. Inventário & Equipamentos (PRONTA)', desc: 'Mochila, armas com rolagem de dano, bolsa de 5 moedas (PO/PP/PC) e capacidade de carga D&D 5e', icon: '🎒', ready: true, route: '/character/hero-1/inventory' },
  { id: '10', title: '10. Biografia & Habilidades', desc: 'História, características de raça/classe, traços e talentos', icon: '📜', ready: false },
  { id: '11', title: '11. Rolador de Dados Integrado', desc: 'Rolagens de d4 a d100 com cálculo de modificador e histórico', icon: '🎲', ready: false },
];

export default function HomeScreen() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { characters, activeCharacter, setActiveCharacterId, resetToMock, loading: charsLoading } = useCharacters();

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
          <RPGBadge label="COMMIT #16 • v0.16.0 • INVENTÁRIO & EQUIPAMENTOS (9/11 TELAS)" variant="gold" />
          <Text style={[styles.heroTitle, { color: theme.text }]}>
            ⚔️ QuestSheet RPG
          </Text>
          <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
            A Tela 9 (Inventário, Equipamentos & Moedas) foi finalizada com capacidade de carga D&D 5e, tesouraria com 5 moedas, equipar itens e rolagem de dano!
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
                    Acesse o módulo de autenticação abaixo
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
            <RPGBadge label="SemVer v0.16.0" variant="hp" size="sm" />
            <RPGBadge label="Inventário & Moedas" variant="mana" size="sm" />
            <RPGBadge label="Telas 9/11 Concluídas" variant="gold" size="sm" />
          </View>
        </RPGCard>

        {/* Atalhos Rápidos para as 9 Telas Concluídas */}
        <RPGCard style={styles.actionCard}>
          <Text style={[styles.actionTitle, { color: theme.text }]}>
            🚀 Atalhos para as Telas Prontas (9 de 11)
          </Text>
          <Text style={[styles.actionDesc, { color: theme.textSecondary }]}>
            Navegue pelas telas já construídas com base no padrão Stack e Context API:
          </Text>
          <View style={{ gap: Spacing.xs }}>
            <RPGButton
              title="🎒 Abrir Tela 9: Inventário & Mochila"
              variant="primary"
              icon="⚔️"
              onPress={() => router.push((activeCharacter ? `/character/${activeCharacter.id}/inventory` : '/character/hero-1/inventory') as any)}
              style={{ width: '100%' }}
            />
            <RPGButton
              title="🔮 Abrir Tela 8: Grimório & Magias"
              variant="secondary"
              icon="✨"
              onPress={() => router.push((activeCharacter ? `/character/${activeCharacter.id}/spells` : '/character/char-elora-03/spells') as any)}
              style={{ width: '100%' }}
            />
            <RPGButton
              title="🎯 Abrir Tela 7: Perícias & Salvaguardas"
              variant="secondary"
              icon="🎲"
              onPress={() => router.push((activeCharacter ? `/character/${activeCharacter.id}/skills` : '/character/hero-1/skills') as any)}
              style={{ width: '100%' }}
            />
            <RPGButton
              title="⚔️ Abrir Tela 6: Ficha de Combate (HUB 2)"
              variant="secondary"
              icon="🩸"
              onPress={() => router.push((activeCharacter ? `/character/${activeCharacter.id}` : '/character/hero-1') as any)}
              style={{ width: '100%' }}
            />
            <RPGButton
              title="🛡️ Abrir Tela 4: Meus Personagens (HUB 1)"
              variant="secondary"
              icon="📜"
              onPress={() => router.push('/characters' as any)}
              style={{ width: '100%' }}
            />
          </View>
          <View style={styles.actionBtnRow}>
            <RPGButton
              title="1. Login"
              variant="secondary"
              icon="🔐"
              size="sm"
              onPress={() => router.push('/auth/login' as any)}
              style={{ flex: 1 }}
            />
            <RPGButton
              title="2. Cadastro"
              variant="secondary"
              icon="📝"
              size="sm"
              onPress={() => router.push('/auth/register' as any)}
              style={{ flex: 1 }}
            />
            <RPGButton
              title="3. Recuperar"
              variant="secondary"
              icon="🔑"
              size="sm"
              onPress={() => router.push('/auth/forgot-password' as any)}
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
                3 Telas de Acesso finalizadas: Login, Cadastro e Recuperação com componentes temáticos.
              </Text>
            </RPGCard>
            <RPGCard style={styles.layerCard}>
              <Text style={styles.layerIcon}>🧠</Text>
              <Text style={[styles.layerTitle, { color: theme.text }]}>2. Estado (Local × Global)</Text>
              <Text style={[styles.layerDesc, { color: theme.textSecondary }]}>
                AuthContext com tokens JWT; timers e visibilidade de senhas gerenciados em useState local.
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

        {/* Mock de Personagens Carregados na Camada de Estado & AsyncStorage (Commit 07) */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              🛡️ Heróis Carregados ({characters.length} Fichas)
            </Text>
            <RPGBadge label="ASYNCSTORAGE OFFLINE" variant="gold" size="sm" />
          </View>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Estrutura de dados D&D 5e / T20 com PV, CA, magias, perícias e inventário persistidos:
          </Text>

          {charsLoading ? (
            <RPGCard style={{ padding: Spacing.md, alignItems: 'center' }}>
              <Text style={{ color: theme.textSecondary }}>Carregando grimório de heróis...</Text>
            </RPGCard>
          ) : (
            <View style={styles.characterGrid}>
              {characters.map((char) => {
                const isActive = activeCharacter?.id === char.id;
                return (
                  <RPGCard
                    key={char.id}
                    variant={isActive ? 'highlight' : 'default'}
                    style={[
                      styles.charCard,
                      isActive && { borderColor: theme.primary, borderWidth: 1.5 },
                    ]}
                  >
                    <View style={styles.charHeaderRow}>
                      <Text style={styles.charEmoji}>{char.avatarEmoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.charName, { color: theme.text }]}>{char.name}</Text>
                        <Text style={[styles.charSubtitle, { color: theme.textSecondary }]}>
                          {char.race} • {char.class} Nível {char.level} {char.subclass ? `(${char.subclass})` : ''}
                        </Text>
                      </View>
                      {isActive ? (
                        <RPGBadge label="ATIVO 👑" variant="gold" size="sm" />
                      ) : null}
                    </View>

                    {/* Chips de Combate */}
                    <View style={styles.charStatsRow}>
                      <View style={[styles.statBadge, { backgroundColor: `${theme.hp}15`, borderColor: theme.hp }]}>
                        <Text style={[styles.statLabel, { color: theme.hp }]}>PV</Text>
                        <Text style={[styles.statValue, { color: theme.text }]}>
                          {char.currentHp}/{char.maxHp}
                        </Text>
                      </View>
                      <View style={[styles.statBadge, { backgroundColor: `${theme.armor}15`, borderColor: theme.armor }]}>
                        <Text style={[styles.statLabel, { color: theme.armor }]}>CA</Text>
                        <Text style={[styles.statValue, { color: theme.text }]}>{char.armorClass}</Text>
                      </View>
                      <View style={[styles.statBadge, { backgroundColor: `${theme.mana}15`, borderColor: theme.mana }]}>
                        <Text style={[styles.statLabel, { color: theme.mana }]}>DESL</Text>
                        <Text style={[styles.statValue, { color: theme.text }]}>{char.speed}m</Text>
                      </View>
                      <View style={[styles.statBadge, { backgroundColor: `${theme.stamina}15`, borderColor: theme.stamina }]}>
                        <Text style={[styles.statLabel, { color: theme.stamina }]}>INIC</Text>
                        <Text style={[styles.statValue, { color: theme.text }]}>
                          {char.initiative >= 0 ? `+${char.initiative}` : char.initiative}
                        </Text>
                      </View>
                    </View>

                    {/* Resumo de Atributos */}
                    <View style={[styles.attrRow, { backgroundColor: theme.backgroundInput }]}>
                      <Text style={[styles.attrText, { color: theme.textSecondary }]}>
                        FOR <Text style={{ color: theme.text, fontWeight: 'bold' }}>{char.attributes.strength}</Text>
                      </Text>
                      <Text style={[styles.attrText, { color: theme.textSecondary }]}>
                        DES <Text style={{ color: theme.text, fontWeight: 'bold' }}>{char.attributes.dexterity}</Text>
                      </Text>
                      <Text style={[styles.attrText, { color: theme.textSecondary }]}>
                        CON <Text style={{ color: theme.text, fontWeight: 'bold' }}>{char.attributes.constitution}</Text>
                      </Text>
                      <Text style={[styles.attrText, { color: theme.textSecondary }]}>
                        INT <Text style={{ color: theme.text, fontWeight: 'bold' }}>{char.attributes.intelligence}</Text>
                      </Text>
                      <Text style={[styles.attrText, { color: theme.textSecondary }]}>
                        SAB <Text style={{ color: theme.text, fontWeight: 'bold' }}>{char.attributes.wisdom}</Text>
                      </Text>
                      <Text style={[styles.attrText, { color: theme.textSecondary }]}>
                        CAR <Text style={{ color: theme.text, fontWeight: 'bold' }}>{char.attributes.charisma}</Text>
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', gap: Spacing.xs, marginTop: Spacing.xs }}>
                      <RPGButton
                        title="⚔️ Ver Ficha"
                        variant="primary"
                        size="sm"
                        icon="🛡️"
                        onPress={() => router.push(`/character/${char.id}` as any)}
                        style={{ flex: 1 }}
                      />
                      {!isActive ? (
                        <RPGButton
                          title="Tornar Ativo"
                          variant="secondary"
                          size="sm"
                          onPress={() => setActiveCharacterId(char.id)}
                          style={{ flex: 1 }}
                        />
                      ) : null}
                    </View>
                  </RPGCard>
                );
              })}
            </View>
          )}

          <RPGButton
            title="Restaurar Fichas Padrão do Mock (Reset)"
            variant="ghost"
            size="sm"
            icon="🔄"
            onPress={resetToMock}
            style={{ alignSelf: 'center', marginTop: Spacing.xs }}
          />
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
            ✔ Commits 01 a 15 concluídos e sincronizados no GitHub
          </Text>
          <Text style={[styles.checkItem, { color: theme.healing }]}>
            ✔ Commit 16 pronto: Tela 9 — Inventário, Equipamentos, Moedas (PO/PP/PC) e Carga D&D 5e (v0.16.0)
          </Text>
          <Text style={[styles.checkItem, { color: theme.healing }]}>
            ✔ 9 de 11 telas concluídas e navegáveis com arquitetura em 3 camadas
          </Text>
          <Text style={[styles.checkItem, { color: theme.healing }]}>
            ✔ Próximo: Tela 10 — Biografia, Traços de Personalidade & Antecedentes (Commit 17 / v0.17.0)
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
    gap: Spacing.xs,
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: -4,
    marginBottom: 2,
  },
  characterGrid: {
    gap: 10,
  },
  charCard: {
    padding: 12,
    gap: 8,
  },
  charHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  charEmoji: {
    fontSize: 28,
  },
  charName: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  charSubtitle: {
    fontSize: 12,
  },
  charStatsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statBadge: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  statValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  attrRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Radius.sm,
  },
  attrText: {
    fontSize: 11,
  },
});
