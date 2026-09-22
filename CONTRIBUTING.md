# 🤝 Guia de Contribuição

Ficamos muito felizes pelo seu interesse em contribuir para o **Construtor de Fichas**! Este documento orienta o processo de desenvolvimento e colaboração para manter o projeto organizado e de alta qualidade.

---

## 📌 Código de Conduta

Ao participar deste projeto, você concorda em manter um ambiente respeitoso, colaborativo e inclusivo para todos.

---

## 🚀 Como Contribuir

### 1. Criando uma Issue
Antes de fazer alterações grandes ou implementar novas funcionalidades, verifique se já existe uma issue aberta ou crie uma nova para discutir a ideia.
- Para relatar **bugs**: forneça detalhes do erro, passos para reproduzir, comportamento esperado e capturas de tela/logs quando aplicável.
- Para sugerir **melhorias**: descreva claramente a necessidade e a solução proposta.

### 2. Fluxo de Trabalho Git (Git Workflow)

1. Faça um **Fork** do repositório no GitHub.
2. Clone o seu fork localmente:
   ```bash
   git clone https://github.com/SEU-USUARIO/P1_Criador_de_fichas.git
   cd P1_Criador_de_fichas/francisco-bigio
   ```
3. Crie uma branch para a sua modificação a partir da branch principal (`main`):
   ```bash
   git checkout -b feat/nome-da-sua-feature
   ```
   *Padrão de nomenclatura das branches:*
   - `feat/descricao-curta` para novas funcionalidades.
   - `fix/descricao-curta` para correção de bugs.
   - `docs/descricao-curta` para alterações na documentação.
   - `refactor/descricao-curta` para refatorações que não alteram funcionalidades.

---

## 💬 Padrão de Commits (Conventional Commits)

Seguimos a convenção [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/):

- `feat:` Nova funcionalidade no app.
- `fix:` Correção de um erro/bug.
- `docs:` Modificações apenas na documentação.
- `style:` Formatação de código, ponto e vírgula ausente, sem alteração lógica.
- `refactor:` Refatoração que não corrige bug nem adiciona funcionalidade.
- `chore:` Atualizações de build, dependências ou configurações auxiliares.

*Exemplo:*
```bash
git commit -m "feat: adiciona componente de seletor de classe na ficha"
```

---

## 🧪 Validação do Código

Antes de abrir seu Pull Request, execute os comandos de verificação:

```bash
# 1. Checagem de tipagem estática (TypeScript)
npx tsc --noEmit

# 2. Análise estática de código (Linter)
npm run lint
```

Certifique-se de que não há erros pendentes ou warnings críticos.

---

## 📥 Enviando o Pull Request (PR)

1. Envie suas alterações para o seu fork remoto:
   ```bash
   git push origin feat/nome-da-sua-feature
   ```
2. Abra um Pull Request apontando para a branch `main` do repositório original.
3. Descreva claramente as alterações realizadas, vinculando à issue correspondente caso exista (ex: `Fixes #12`).
4. Aguarde a revisão do mantenedor. Se solicitado algum ajuste, faça os commits adicionais na mesma branch.

Muito obrigado por ajudar a tornar o projeto ainda melhor! 🎉

