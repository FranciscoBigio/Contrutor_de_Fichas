import { useRouter } from 'expo-router';
import React from 'react';
import {
  Pressable,
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
  RPGHpBar,
} from '@/components/ui';
import { Radius, Shadows, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useCharacters } from '@/context/character-context';
import { useTheme } from '@/context/theme-context';
import { rpgHapticSelection } from '@/utils/haptics';

export default function HomeScreen() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { characters, activeCharacter } = useCharacters();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Barra Superior / Header do App */}
        <View style={styles.headerBar}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.appTitle, { color: theme.primary }]}>
              ⚔️ QuestSheet RPG
            </Text>
            <Text style={[styles.appTagline, { color: theme.textSecondary }]}>
              Gestor de Fichas D&D 5e & Taverna Digital
            </Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              style={({ pressed }) => [
                styles.iconButton,
                {
                  backgroundColor: theme.backgroundCard,
                  borderColor: theme.border,
                  opacity: pressed ? 0.7 : 1,
                },
                Shadows.sm,
              ]}
              onPress={toggleTheme}
              accessibilityLabel="Alternar tema visual"
            >
              <Text style={styles.iconButtonText}>{isDark ? '☀️' : '🌙'}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.iconButton,
                {
                  backgroundColor: theme.backgroundCard,
                  borderColor: theme.border,
                  opacity: pressed ? 0.7 : 1,
                },
                Shadows.sm,
              ]}
              onPress={() => {
                rpgHapticSelection();
                router.push('/settings' as any);
              }}
              accessibilityLabel="Abrir configurações"
            >
              <Text style={styles.iconButtonText}>⚙️</Text>
            </Pressable>
          </View>
        </View>

        {/* Card de Sessão do Jogador / Boas-Vindas */}
        {isAuthenticated && user ? (
          <View
            style={[
              styles.userCard,
              { backgroundColor: theme.backgroundCard, borderColor: theme.border },
              Shadows.sm,
            ]}
          >
            <View
              style={[
                styles.userAvatarBox,
                { backgroundColor: `${theme.primary}20`, borderColor: theme.primary },
              ]}
            >
              <Text style={styles.userAvatarEmoji}>
                {user.role === 'master' ? '👑' : '🛡️'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.userName, { color: theme.text }]}>
                {user.name}
              </Text>
              <Text style={[styles.userRole, { color: theme.textSecondary }]}>
                {user.role === 'master' ? 'Mestre da Masmorra' : 'Aventureiro'} • {user.email}
              </Text>
            </View>
            <RPGButton
              title="Sair"
              variant="ghost"
              size="sm"
              onPress={logout}
            />
          </View>
        ) : (
          <RPGCard
            variant="highlight"
            style={[styles.guestCard, { borderColor: theme.primary }]}
          >
            <View style={styles.guestContent}>
              <Text style={styles.guestIcon}>🏰</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.guestTitle, { color: theme.text }]}>
                  Boas-vindas à Taverna!
                </Text>
                <Text style={[styles.guestSubtitle, { color: theme.textSecondary }]}>
                  Conecte sua conta para sincronizar fichas, campanhas e rolagens.
                </Text>
              </View>
            </View>
            <View style={styles.guestActions}>
              <RPGButton
                title="Entrar"
                variant="primary"
                size="sm"
                icon="🔐"
                onPress={() => router.push('/auth/login' as any)}
                style={{ flex: 1 }}
              />
              <RPGButton
                title="Cadastrar"
                variant="secondary"
                size="sm"
                icon="✨"
                onPress={() => router.push('/auth/register' as any)}
                style={{ flex: 1 }}
              />
            </View>
          </RPGCard>
        )}

        {/* Card do Personagem Ativo em Destaque */}
        {activeCharacter ? (
          <RPGCard variant="highlight" style={styles.activeHeroCard}>
            <View style={styles.activeHeroHeader}>
              <View
                style={[
                  styles.heroAvatarBox,
                  { backgroundColor: `${theme.primary}20`, borderColor: theme.primary },
                ]}
              >
                <Text style={styles.heroAvatarEmoji}>
                  {activeCharacter.avatarEmoji || '🛡️'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.heroTitleRow}>
                  <Text style={[styles.heroName, { color: theme.text }]}>
                    {activeCharacter.name}
                  </Text>
                  <RPGBadge label="EM JOGO" variant="gold" size="sm" />
                </View>
                <Text style={[styles.heroClassRace, { color: theme.textSecondary }]}>
                  {activeCharacter.race} • {activeCharacter.class} Nível {activeCharacter.level} {activeCharacter.subclass ? `(${activeCharacter.subclass})` : ''}
                </Text>
              </View>
            </View>

            {/* Barra de Pontos de Vida (PV) */}
            <View style={{ width: '100%', marginTop: Spacing.xs }}>
              <RPGHpBar
                current={activeCharacter.currentHp}
                max={activeCharacter.maxHp}
                temp={activeCharacter.tempHp}
                height={12}
                label="PONTOS DE VIDA (PV)"
              />
            </View>

            {/* Chips de Estatísticas Principais */}
            <View style={styles.heroStatsRow}>
              <View style={[styles.statChip, { backgroundColor: `${theme.armor}15`, borderColor: theme.armor }]}>
                <Text style={[styles.statChipLabel, { color: theme.armor }]}>CA</Text>
                <Text style={[styles.statChipVal, { color: theme.text }]}>
                  {activeCharacter.armorClass}
                </Text>
              </View>

              <View style={[styles.statChip, { backgroundColor: `${theme.stamina}15`, borderColor: theme.stamina }]}>
                <Text style={[styles.statChipLabel, { color: theme.stamina }]}>INIC</Text>
                <Text style={[styles.statChipVal, { color: theme.text }]}>
                  {activeCharacter.initiative >= 0 ? `+${activeCharacter.initiative}` : activeCharacter.initiative}
                </Text>
              </View>

              <View style={[styles.statChip, { backgroundColor: `${theme.mana}15`, borderColor: theme.mana }]}>
                <Text style={[styles.statChipLabel, { color: theme.mana }]}>DESL</Text>
                <Text style={[styles.statChipVal, { color: theme.text }]}>
                  {activeCharacter.speed}m
                </Text>
              </View>

              <View style={[styles.statChip, { backgroundColor: `${theme.primary}15`, borderColor: theme.primary }]}>
                <Text style={[styles.statChipLabel, { color: theme.primary }]}>PROF</Text>
                <Text style={[styles.statChipVal, { color: theme.text }]}>
                  +{activeCharacter.proficiencyBonus || 2}
                </Text>
              </View>
            </View>

            {/* Ações Rápidas da Ficha Ativa */}
            <View style={styles.heroActionGrid}>
              <RPGButton
                title="Abrir Ficha"
                variant="primary"
                size="sm"
                icon="⚔️"
                onPress={() => router.push(`/character/${activeCharacter.id}` as any)}
                style={{ flex: 1 }}
              />
              <RPGButton
                title="Rolar Dados"
                variant="secondary"
                size="sm"
                icon="🎲"
                onPress={() => router.push(`/character/${activeCharacter.id}/dice` as any)}
                style={{ flex: 1 }}
              />
            </View>

            {/* Botões Secundários em Pílula */}
            <View style={styles.heroSecondaryActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.pillButton,
                  {
                    backgroundColor: theme.backgroundInput,
                    borderColor: theme.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                onPress={() => router.push(`/character/${activeCharacter.id}/inventory` as any)}
              >
                <Text style={[styles.pillButtonText, { color: theme.text }]}>🎒 Inventário</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.pillButton,
                  {
                    backgroundColor: theme.backgroundInput,
                    borderColor: theme.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                onPress={() => router.push(`/character/${activeCharacter.id}/skills` as any)}
              >
                <Text style={[styles.pillButtonText, { color: theme.text }]}>🎯 Perícias</Text>
              </Pressable>

              {activeCharacter.spellcasting && activeCharacter.spellcasting.spells.length > 0 ? (
                <Pressable
                  style={({ pressed }) => [
                    styles.pillButton,
                    {
                      backgroundColor: theme.backgroundInput,
                      borderColor: theme.border,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                  onPress={() => router.push(`/character/${activeCharacter.id}/spells` as any)}
                >
                  <Text style={[styles.pillButtonText, { color: theme.text }]}>🔮 Grimório</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={({ pressed }) => [
                    styles.pillButton,
                    {
                      backgroundColor: theme.backgroundInput,
                      borderColor: theme.border,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                  onPress={() => router.push(`/character/${activeCharacter.id}/bio` as any)}
                >
                  <Text style={[styles.pillButtonText, { color: theme.text }]}>📜 Biografia</Text>
                </Pressable>
              )}
            </View>
          </RPGCard>
        ) : (
          <RPGCard style={styles.noHeroCard}>
            <Text style={styles.noHeroEmoji}>🧙‍♂️</Text>
            <Text style={[styles.noHeroTitle, { color: theme.text }]}>
              Nenhum Herói Selecionado
            </Text>
            <Text style={[styles.noHeroSubtitle, { color: theme.textSecondary }]}>
              Crie seu primeiro aventureiro ou selecione uma ficha para começar a rolar dados e combater!
            </Text>
            <RPGButton
              title="Criar Meu Primeiro Herói"
              variant="primary"
              icon="✨"
              onPress={() => router.push('/create' as any)}
              style={{ marginTop: Spacing.xs, width: '100%' }}
            />
          </RPGCard>
        )}

        {/* Central de Ações Rápidas (Grid 2x2) */}
        <View style={styles.quickNavSection}>
          <Text style={[styles.sectionHeading, { color: theme.text }]}>
            🧭 Menu Principal
          </Text>

          <View style={styles.quickGrid}>
            <Pressable
              style={({ pressed }) => [
                styles.quickTile,
                {
                  backgroundColor: theme.backgroundCard,
                  borderColor: theme.border,
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
                Shadows.sm,
              ]}
              onPress={() => {
                rpgHapticSelection();
                router.push('/characters' as any);
              }}
            >
              <Text style={styles.quickTileIcon}>🛡️</Text>
              <Text style={[styles.quickTileTitle, { color: theme.text }]}>
                Personagens
              </Text>
              <Text style={[styles.quickTileDesc, { color: theme.textSecondary }]}>
                {characters.length} fichas salvas
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.quickTile,
                {
                  backgroundColor: theme.backgroundCard,
                  borderColor: theme.border,
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
                Shadows.sm,
              ]}
              onPress={() => {
                rpgHapticSelection();
                router.push('/create' as any);
              }}
            >
              <Text style={styles.quickTileIcon}>✨</Text>
              <Text style={[styles.quickTileTitle, { color: theme.text }]}>
                Novo Herói
              </Text>
              <Text style={[styles.quickTileDesc, { color: theme.textSecondary }]}>
                Criar ficha D&D 5e
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.quickTile,
                {
                  backgroundColor: theme.backgroundCard,
                  borderColor: theme.border,
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
                Shadows.sm,
              ]}
              onPress={() => {
                rpgHapticSelection();
                router.push('/dice' as any);
              }}
            >
              <Text style={styles.quickTileIcon}>🎲</Text>
              <Text style={[styles.quickTileTitle, { color: theme.text }]}>
                Rolador de Dados
              </Text>
              <Text style={[styles.quickTileDesc, { color: theme.textSecondary }]}>
                d4 a d100 & testes
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.quickTile,
                {
                  backgroundColor: theme.backgroundCard,
                  borderColor: theme.border,
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
                Shadows.sm,
              ]}
              onPress={() => {
                rpgHapticSelection();
                router.push('/settings' as any);
              }}
            >
              <Text style={styles.quickTileIcon}>⚙️</Text>
              <Text style={[styles.quickTileTitle, { color: theme.text }]}>
                Configurações
              </Text>
              <Text style={[styles.quickTileDesc, { color: theme.textSecondary }]}>
                Ajustes e backup
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Grupo de Aventureiros / Lista Rápida */}
        <View style={styles.partySection}>
          <View style={styles.partyHeaderRow}>
            <Text style={[styles.sectionHeading, { color: theme.text }]}>
              👥 Grupo de Aventureiros
            </Text>
            <Pressable onPress={() => router.push('/characters' as any)}>
              <Text style={[styles.seeAllText, { color: theme.primary }]}>
                Ver todos ({characters.length}) ➔
              </Text>
            </Pressable>
          </View>

          {characters.slice(0, 3).map((char) => {
            const isActive = activeCharacter?.id === char.id;
            return (
              <Pressable
                key={char.id}
                style={({ pressed }) => [
                  styles.rosterCard,
                  {
                    backgroundColor: theme.backgroundCard,
                    borderColor: isActive ? theme.primary : theme.border,
                    borderWidth: isActive ? 1.5 : 1,
                    opacity: pressed ? 0.92 : 1,
                  },
                  isActive ? Shadows.glowGold : Shadows.sm,
                ]}
                onPress={() => {
                  rpgHapticSelection();
                  router.push(`/character/${char.id}` as any);
                }}
              >
                <Text style={styles.rosterEmoji}>{char.avatarEmoji || '🛡️'}</Text>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.rosterName, { color: theme.text }]}>
                      {char.name}
                    </Text>
                    {isActive ? (
                      <RPGBadge label="ATIVO" variant="gold" size="sm" />
                    ) : null}
                  </View>
                  <Text style={[styles.rosterSub, { color: theme.textSecondary }]}>
                    {char.race} • {char.class} Nv. {char.level}
                  </Text>
                </View>

                <View style={styles.rosterStats}>
                  <Text style={[styles.rosterHpText, { color: theme.hp }]}>
                    ❤️ {char.currentHp}/{char.maxHp}
                  </Text>
                  <Text style={[styles.rosterCaText, { color: theme.armor }]}>
                    🛡️ {char.armorClass} CA
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Pergaminho do Conhecimento / Dica do Mestre */}
        <RPGCard variant="default" style={styles.loreCard}>
          <View style={styles.loreHeader}>
            <Text style={styles.loreIcon}>📜</Text>
            <Text style={[styles.loreTitle, { color: theme.text }]}>
              Dica do Mestre da Masmorra
            </Text>
          </View>
          <Text style={[styles.loreBody, { color: theme.textSecondary }]}>
            Em combates difíceis, lembre-se de usar a rolagem com <Text style={{ color: theme.primary, fontWeight: 'bold' }}>Vantagem</Text> quando seu aliado flanquear o inimigo ou quando tiver terreno elevado a seu favor!
          </Text>
        </RPGCard>

        {/* Rodapé Elegante */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>
            QuestSheet RPG • Suas campanhas na palma da mão
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
    paddingBottom: Spacing.xl,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  appTagline: {
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: {
    fontSize: 18,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm + 2,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  userAvatarBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarEmoji: {
    fontSize: 20,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  userRole: {
    fontSize: 11,
    marginTop: 1,
  },
  guestCard: {
    gap: Spacing.sm,
  },
  guestContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  guestIcon: {
    fontSize: 28,
  },
  guestTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  guestSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  guestActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  activeHeroCard: {
    gap: Spacing.sm,
  },
  activeHeroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  heroAvatarBox: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAvatarEmoji: {
    fontSize: 30,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  heroName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  heroClassRace: {
    fontSize: 12,
    marginTop: 2,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    width: '100%',
    marginTop: 2,
  },
  statChip: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  statChipLabel: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  statChipVal: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  heroActionGrid: {
    flexDirection: 'row',
    gap: Spacing.xs,
    width: '100%',
    marginTop: Spacing.xs,
  },
  heroSecondaryActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
    width: '100%',
    marginTop: 2,
  },
  pillButton: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillButtonText: {
    fontSize: 11,
    fontWeight: '600',
  },
  noHeroCard: {
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  noHeroEmoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  noHeroTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noHeroSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  quickNavSection: {
    gap: Spacing.xs + 2,
    marginTop: Spacing.xs,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  quickTile: {
    width: '48%',
    flexGrow: 1,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 4,
  },
  quickTileIcon: {
    fontSize: 26,
    marginBottom: 2,
  },
  quickTileTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  quickTileDesc: {
    fontSize: 11,
  },
  partySection: {
    gap: Spacing.xs + 2,
    marginTop: Spacing.xs,
  },
  partyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  rosterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm + 2,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  rosterEmoji: {
    fontSize: 26,
  },
  rosterName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  rosterSub: {
    fontSize: 11,
    marginTop: 2,
  },
  rosterStats: {
    alignItems: 'flex-end',
    gap: 2,
  },
  rosterHpText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  rosterCaText: {
    fontSize: 11,
    fontWeight: '600',
  },
  loreCard: {
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  loreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  loreIcon: {
    fontSize: 18,
  },
  loreTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  loreBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  footerText: {
    fontSize: 11,
    letterSpacing: 0.3,
  },
});
