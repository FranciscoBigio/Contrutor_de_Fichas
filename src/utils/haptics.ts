import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Utilitário central de Feedback Háptico e Resposta Tátil para o QuestSheet RPG.
 * Proporciona imersão tátil durante rolagens de dados, acertos críticos, dano e cura,
 * com salvaguardas seguras contra erros em navegadores Web e emuladores.
 */

const isHapticsSupported = Platform.OS === 'ios' || Platform.OS === 'android';

/**
 * Vibração leve de seleção ao trocar de dado ou alternar abas
 */
export async function rpgHapticSelection(): Promise<void> {
  if (!isHapticsSupported) return;
  try {
    await Haptics.selectionAsync();
  } catch {
    // Ignora silenciosamente em dispositivos sem suporte a vibração
  }
}

/**
 * Impacto de impacto moderado ao rolar dados poliédricos comuns
 */
export async function rpgHapticRoll(): Promise<void> {
  if (!isHapticsSupported) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // Ignora silenciosamente
  }
}

/**
 * Vibração dupla festiva para Acerto Crítico (20 Natural no d20)
 */
export async function rpgHapticCriticalSuccess(): Promise<void> {
  if (!isHapticsSupported) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Ignora silenciosamente
  }
}

/**
 * Vibração pesada de advertência para Falha Crítica (1 Natural no d20)
 */
export async function rpgHapticCriticalFailure(): Promise<void> {
  if (!isHapticsSupported) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch {
    // Ignora silenciosamente
  }
}

/**
 * Impacto forte ao receber Dano em combate
 */
export async function rpgHapticDamage(): Promise<void> {
  if (!isHapticsSupported) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch {
    // Ignora silenciosamente
  }
}

/**
 * Pulso suave e restaurador ao receber Cura ou Descanso
 */
export async function rpgHapticHeal(): Promise<void> {
  if (!isHapticsSupported) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Ignora silenciosamente
  }
}

/**
 * Toque tátil sutil para botões e ações de menu
 */
export async function rpgHapticButton(): Promise<void> {
  if (!isHapticsSupported) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Ignora silenciosamente
  }
}
