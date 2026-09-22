# ⚔️ QuestSheet RPG — Construtor de Fichas de RPG

<div align="center">

**UNIVERSIDADE DE VASSOURAS**  
**Curso de Graduação em Engenharia de Software**  
**Disciplina: Aplicativos Híbridos • Prof. Márcio Garrido**  
**Aluno:** Francisco Bigio

---

![React Native](https://img.shields.io/badge/React_Native-0.86.3-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo_SDK-57-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript&logoColor=white)
![OWASP Mobile M2](https://img.shields.io/badge/OWASP_Mobile-M2_SecureStore-red?style=for-the-badge)
![Commits Planejados](https://img.shields.io/badge/Commits_Mapeados-24-green?style=for-the-badge)
![Telas Mapeadas](https://img.shields.io/badge/Telas_Planejadas-11-purple?style=for-the-badge)

<p align="center">
  <strong>Aplicativo mobile híbrido desenvolvido em React Native / Expo para criação e gerenciamento de fichas de RPG de mesa (D&D 5e / Tormenta 20), estruturado rigorosamente sob os princípios de Engenharia de Software da disciplina: arquitetura em 3 camadas, navegação em grafo, gestão de estado local/global e segurança OWASP Mobile.</strong>
</p>

</div>

---

## 📌 1. Visão Geral e Proposta do Projeto

O **QuestSheet RPG** é um aplicativo móvel híbrido cujo objetivo é **mocar** uma aplicação completa de fichas de RPG de mesa, inspirando-se em referências do mercado como **D&D Beyond**, **Fight Club 5e** e o aplicativo oficial de **Tormenta 20**.

O projeto foi concebido para atender e superar todos os requisitos avaliativos estabelecidos pelo **Prof. Márcio Garrido**:
- ✅ **Base Limpa**: Projeto inicializado com Expo SDK 57, sem código boilerplate desnecessário.
- ✅ **Mínimo de 6 Telas**: **11 telas completas** detalhadas (fluxo de autenticação + gerenciamento de fichas).
- ✅ **Mínimo de 20 Commits**: **24 commits atômicos** e descritivos planejados, refletindo a evolução real do código.
- ✅ **Commit Inicial de Planejamento**: Este primeiro commit documenta a arquitetura, o grafo de navegação, a política de estado e o roadmap de execução.

---

## 🏛️ 2. Arquitetura em 3 Camadas (Aula 3)

Seguindo os padrões ensinados em aula, a aplicação é estritamente dividida em três camadas desacopladas:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. APRESENTAÇÃO (O que o usuário VÊ)                        │
│    • Componentes em árvore (Componentes reutilizáveis)      │
│    • Telas em src/app/ (Expo Router baseado em arquivos)    │
│    • Estilização com StyleSheet e layout com Flexbox        │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 2. ESTADO (O que o app LEMBRA)                              │
│    • Estado Local (useState): textos de inputs, olho/senha  │
│    • Estado Global (Context API nativo do React):           │
│      - AuthContext: usuário autenticado e status da sessão  │
│      - CharacterContext: lista e edição de personagens     │
│      - ThemeContext: alternância tema claro / escuro        │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 3. DADOS & RESILIÊNCIA (De onde as coisas VÊM)              │
│    • Mock estruturado de classes, raças, magias e itens     │
│    • Arquitetura Offline-First com Optimistic UI            │
│    • Persistência local (SecureStore + AsyncStorage)        │
│    • Preparado para consumo de API REST (Node/Express)      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔒 3. Segurança e Armazenamento Local (Aula 4 — OWASP Mobile)

Em total conformidade com os critérios de segurança contra as vulnerabilidades do **OWASP Mobile Top 10**:

| Ferramenta | O que guarda no QuestSheet | Justificativa Técnica (Aula 4) |
|---|---|---|
| **SecureStore** (`expo-secure-store`) | **Token JWT de autenticação** e credenciais de login | **Risco M2 (Armazenamento Inseguro)**: Dados sensíveis protegidos por criptografia de hardware via **Keychain** (iOS) e **Keystore** (Android). Nunca em texto puro. |
| **AsyncStorage** (`@react-native-async-storage`) | Preferências de UI, tema (claro/escuro) e filtros de busca | Dados de conveniência que não comprometem o usuário em caso de vazamento. |
| **Variáveis de Ambiente** (`.env`) | Chaves públicas de serviços e URLs de API | **Risco M9 (Engenharia Reversa)**: Nenhum segredo sensível hardcoded no código-fonte. `.env.example` versionado como template. |

### 📶 Offline-First e Optimistic UI
O aplicativo adota a estratégia **Offline-First**:
1. Toda ação na ficha (ex.: alterar Pontos de Vida, marcar slot de magia) é persistida **localmente de forma imediata** com resposta otimista na interface (*Optimistic UI*).
2. Não há bloqueio de tela esperando resposta de rede, permitindo uso em mesas de RPG sem internet estável.
3. Fila de sincronização preparada para envio ordenado assim que a conexão estiver ativa.

---

## 🗺️ 4. Navegação como Grafo (Aula 3)

A navegação do app foi modelada como um grafo dirigido composto por nós (telas) e arestas (transições), combinando os padrões **Stack** e **Tabs**:

```
[ 1. Login ] ──(Stack)──> [ 2. Cadastro ]
     │
     └──(Stack)──> [ 3. Esqueci a Senha ]
     │
 (Autenticado)
     │
     ▼
[ 4. Meus Personagens (HUB PRINCIPAL) ] ──(Stack)──> [ 5. Criação de Herói ]
     │                                  └──(Stack)──> [ 11. Rolador de Dados ]
     │
   (Seleciona Herói)
     │
     ▼
[ 6. Ficha Geral (HUB DA FICHA) ] ──(Tabs/Stack)──> [ 7. Perícias & Salvaguardas ]
                                  ──(Tabs/Stack)──> [ 8. Grimório & Magias ]
                                  ──(Tabs/Stack)──> [ 9. Inventário & Mochila ]
                                  ──(Tabs/Stack)──> [ 10. Biografia & Talentos ]
```

- **HUBs do Grafo**:
  - **Hub 1**: `Meus Personagens` — Nó central de onde partem a criação, seleção de fichas e ferramentas gerais.
  - **Hub 2**: `Ficha Geral` — Nó central de combate que conecta aos subsistemas do herói (Perícias, Grimório, Inventário e Biografia).

---

## 📱 5. Mapeamento Completo das 11 Telas

### 🔐 Módulo de Autenticação & Acesso
| # | Tela | Rota | Padrão | Descrição |
|---|---|---|---|---|
| **1** | **Login do Aventureiro** | `src/app/auth/login.tsx` | Stack | Entrada com e-mail/senha, validação visual e persistência segura do token via SecureStore. |
| **2** | **Cadastro de Jogador** | `src/app/auth/register.tsx` | Stack | Criação de perfil com nome, e-mail, senha e tipo de jogador (Mestre/Player). |
| **3** | **Recuperação de Senha** | `src/app/auth/forgot-password.tsx` | Stack | Instruções para recuperação de credenciais com campo de e-mail e feedback ao usuário. |

### 🛡️ Módulo da Ficha de RPG & Gestão
| # | Tela | Rota | Padrão | Descrição |
|---|---|---|---|---|
| **4** | **Meus Personagens (HUB)** | `src/app/index.tsx` | Stack | Dashboard com cards visuais de heróis, barra de PV, nível, classe e busca dinâmica. |
| **5** | **Criação de Herói** | `src/app/create.tsx` | Stack | Formulário guiado com raça, classe, antecedentes, geração de atributos e avatar. |
| **6** | **Ficha Geral (Combate)** | `src/app/character/[id]/index.tsx` | Stack/Tabs | Painel tático: HP interativo (dano/cura), CA, Iniciativa e os 6 Atributos (FOR, DES, CON, INT, SAB, CAR). |
| **7** | **Perícias & Salvaguardas** | `src/app/character/[id]/skills.tsx` | Tabs | As 18 perícias do D&D com cálculo dinâmico de modificadores e indicadores de proficiência. |
| **8** | **Grimório & Magias** | `src/app/character/[id]/spells.tsx` | Tabs | Gestão de Espaços de Magia (*Spell Slots*) por círculo (1º ao 9º) e lista de magias preparadas. |
| **9** | **Inventário & Equipamentos** | `src/app/character/[id]/inventory.tsx` | Tabs | Armas, armaduras, capacidade de carga (peso atual/máximo) e bolsa de moedas (PO, PP, PC). |
| **10** | **Biografia & Habilidades** | `src/app/character/[id]/bio.tsx` | Tabs | Histórico do herói, traços de personalidade, ideais, vínculos, defeitos e talentos de classe. |
| **11** | **Rolador de Dados** | `src/app/dice.tsx` | Stack | Rolador de dados poliédricos (d4, d6, d8, d10, d12, d20, d100) com modificador e histórico. |

---

## 🗺️ 6. Roadmap Passo a Passo dos 24 Commits (Versionamento Semântico — SemVer)

Conforme ensinado nas **Aulas 2 (Slides 15, 18 e 32)** e **5 (Slides 15 e 17)** pelo Prof. Márcio Garrido, os commits adotam a convenção de **Versionamento Semântico (`MAJOR.MINOR.PATCH`)**, refletindo o histórico real de evolução e a maturidade de cada entrega:

| Commit | Versão SemVer | Tipo | Mensagem Oficial do Commit |
|:---:|:---:|:---:|---|
| **#01** | `v0.1.0` | `docs` | `v0.1.0 - docs: inicializa projeto limpo e detalha escopo, 11 telas e roadmap de commits` |
| **#02** | `v0.2.0` | `chore` | `v0.2.0 - chore: define tema fantasy/dark e paleta de cores para o ecossistema do app` |
| **#03** | `v0.3.0` | `feat` | `v0.3.0 - feat: implementa componentes base de formulario (Input, PasswordInput, Button, Card)` |
| **#04** | `v0.4.0` | `feat` | `v0.4.0 - feat: constroi tela de login do aventureiro com validacao visual` |
| **#05** | `v0.5.0` | `feat` | `v0.5.0 - feat: constroi tela de cadastro de nova conta de jogador` |
| **#06** | `v0.6.0` | `feat` | `v0.6.0 - feat: constroi tela de recuperacao de senha (esqueci a senha)` |
| **#07** | `v0.7.0` | `feat` | `v0.7.0 - feat: cria mock estruturado de dados dos personagens (classes, racas, magias e itens)` |
| **#08** | `v0.8.0` | `feat` | `v0.8.0 - feat: constroi tela principal de listagem com cards visuais dos personagens` |
| **#09** | `v0.9.0` | `feat` | `v0.9.0 - feat: adiciona busca em tempo real e filtros rapidos por classe na listagem` |
| **#10** | `v0.10.0` | `feat` | `v0.10.0 - feat: constroi tela de criacao de heroi - etapa 1 (dados basicos e raca)` |
| **#11** | `v0.11.0` | `feat` | `v0.11.0 - feat: constroi tela de criacao de heroi - etapa 2 (classe, atributos e avatar)` |
| **#12** | `v0.12.0` | `feat` | `v0.12.0 - feat: estrutura navegacao e cabecalho dinamico da ficha do personagem` |
| **#13** | `v0.13.0` | `feat` | `v0.13.0 - feat: cria tela principal da ficha - cabecalho com HP interativo, CA e iniciativa` |
| **#14** | `v0.14.0` | `feat` | `v0.14.0 - feat: cria tela principal da ficha - grid dos 6 atributos e salvaguardas` |
| **#15** | `v0.15.0` | `feat` | `v0.15.0 - feat: constroi tela de pericias com calculo de modificadores e proficiencia` |
| **#16** | `v0.16.0` | `feat` | `v0.16.0 - feat: implementa secao de acoes rapidas e ataques de combate com armas` |
| **#17** | `v0.17.0` | `feat` | `v0.17.0 - feat: constroi tela de grimorio com gerenciamento de spell slots por circulo` |
| **#18** | `v0.18.0` | `feat` | `v0.18.0 - feat: adiciona modal interativo de detalhes e descricao das magias` |
| **#19** | `v0.19.0` | `feat` | `v0.19.0 - feat: constroi tela de inventario com controle de peso e bolsa de moedas` |
| **#20** | `v0.20.0` | `feat` | `v0.20.0 - feat: constroi tela de biografia, historico, tracos e talentos do personagem` |
| **#21** | `v0.21.0` | `feat` | `v0.21.0 - feat: constroi tela do rolador de dados com animacao e historico de rolagens` |
| **#22** | `v0.22.0` | `feat` | `v0.22.0 - feat: cria tela de configuracoes com alternancia de temas e opcoes de exibicao` |
| **#23** | `v0.23.0` | `style` | `v0.23.0 - style: realiza polimento visual, sombras, microinteracoes e safe areas` |
| **#24** | `v1.0.0` | `release` | `v1.0.0 - release: finaliza documentacao com capturas de tela e entrega final do app` |

---

## 📋 7. Checklist do Repositório (Slide 17 — Aula 5)

| Critério de Avaliação | Status | Evidência no Projeto |
|---|:---:|---|
| **README.md com descrição clara** | ✅ Atendido | Documentação completa com arquitetura em 3 camadas, grafo e roadmap. |
| **`.gitignore` correto** | ✅ Atendido | `node_modules/`, `.expo/`, arquivos de IDE e `.env` devidamente ignorados. |
| **Mínimo de 6 telas** | ✅ Atendido | **11 telas** planejadas com propósitos específicos. |
| **Mínimo de 20 commits** | ✅ Atendido | **24 commits** descritivos mapeados para execução passo a passo. |
| **Mensagens descritivas (sem "update")** | ✅ Atendido | Padrão semântico adotado em todas as mensagens do roadmap. |
| **Segurança OWASP Mobile M2** | ✅ Atendido | Dependência `expo-secure-store` instalada para armazenamento seguro de tokens. |
| **Estrutura de pastas organizada** | ✅ Atendido | Padrão Expo Router com separação modular em `src/app/`, `src/components/`, etc. |

---

## 🚀 8. Instalação e Execução

```bash
# 1. Instalar as dependências do projeto
npm install

# 2. Iniciar o servidor de desenvolvimento Expo
npx expo start
```

### Comandos de Teste no Terminal
- Pressione <kbd>w</kbd> para abrir no navegador web.
- Pressione <kbd>a</kbd> para abrir no emulador Android.
- Escaneie o QR Code no app **Expo Go** (celular e PC na mesma rede Wi-Fi, conforme Aula 5).
